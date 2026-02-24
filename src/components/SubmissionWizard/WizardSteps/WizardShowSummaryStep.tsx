import React, { useState } from "react"

import EditIcon from "@mui/icons-material/Edit"
import Box from "@mui/material/Box"
import Container from "@mui/material/Container"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRenderCellParams,
  GridSortModel,
} from "@mui/x-data-grid"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"

import WizardObjectStatusBadge from "../WizardComponents/WizardObjectStatusBadge"

import { SDObjectTypes, FormStatus } from "constants/wizardObject"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { updateStep } from "features/wizardStepObjectSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import { SubmissionDetails } from "types"
import { pathWithLocale } from "utils"

const SummaryTable = styled(DataGrid)(({ theme }) => ({
  "& .MuiDataGrid-filler": {
    display: "none",
  },
  "& .MuiDataGrid-columnSeparator": {
    display: "none",
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: theme.palette.common.white,
  },
  "& .MuiDataGrid-columnHeaders .MuiDataGrid-columnHeader": {
    backgroundColor: theme.palette.common.white,
  },
  "& .MuiDataGrid-cell:hover": {
    backgroundColor: "inherit",
  },
  "& .MuiDataGrid-columnHeaderTitleContainer": {
    padding: 0,
    "& .MuiDataGrid-sortIcon": {
      fontSize: "2rem",
    },
  },
  "& .MuiSvgIcon-root": {
    fontSize: "2.5rem",
  },
  "& .MuiDataGrid-cell": {
    display: "flex",
    alignItems: "center",
  },
  "& .MuiDataGrid-overlay": {
    display: "none",
  },
  "& .MuiDataGrid-footerContainer": {
    display: "none",
  },
}))

let formState: string = FormStatus.missing

let isFormReady = (step: number, submission: SubmissionDetails) => {
  switch (step) {
    case 1:
      return Boolean(submission.name.length)
    case 2:
      return Boolean(submission.rems && submission.rems?.organizationId.length)
    case 3:
      return Boolean(submission.bucket?.length)
    case 4:
      return Boolean(submission.metadata && Object.keys(submission.metadata).length)
  }
}

/*
 * Show summary of objects added to submission
 */

const WizardShowSummaryStep: React.FC = () => {
  const submission = useAppSelector(state => state.submission)
  const mappedSteps = useAppSelector(state => state.wizardMappedSteps)

  // Remove publish step
  const mappedSummarySteps = mappedSteps.toSpliced(-1, 1)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const { t } = useTranslation()

  const [sortModels, setSortModels] = useState<{ [key: number]: GridSortModel }>({})

  const handleSortModelChange = (step: number, model: GridSortModel) => {
    setSortModels(prevSortModels => ({
      ...prevSortModels,
      [step]: model,
    }))
  }

  const handleEdit = (objectType: string, step: number) => {
    const { submissionId } = submission

    dispatch(updateStep({ step: step, objectType: objectType }))
    dispatch(resetObjectType())
    navigate({ pathname: pathWithLocale(`submission/${submissionId}`), search: `step=${step}` })
  }

  // Table of all summary rows
  const rows = mappedSummarySteps.flatMap((summaryItem, index) => {
    const step = index + 1

    return (
      summaryItem.schemas?.flatMap(stepItem => {
        const objects = stepItem.objects
        formState = isFormReady(step, submission) ? FormStatus.ready : FormStatus.missing

        // Add row for a linked bucket
        if (
          stepItem.objectType === SDObjectTypes.linkBucket &&
          submission.bucket &&
          (!objects || Object.values(objects).flat().length === 0)
        ) {
          return [
            {
              id: `linked-bucket-${step}`,
              status: formState,
              name: submission.bucket,
              action: "",
              step,
              objectType: stepItem.objectType,
              objectsList: [],
            },
          ]
        }
        // if objects array contains objects
        if (objects && objects.length > 0) {
          const objectsList = Object.values(objects).flat()

          return objectsList.map(item => {
            const name = item.displayTitle || item.fileName || item.id

            return {
              id: item.id,
              status: formState,
              name,
              action: isFormReady(step, submission)
                ? ""
                : stepItem.objectType === SDObjectTypes.linkBucket
                  ? t("summaryPage.selectBucket")
                  : t("summaryPage.fillForm"),
              step,
              objectType: stepItem.objectType,
              objectsList,
            }
          })
        } else {
          if ([1, 2, 3, 4].includes(step)) {
            return [
              {
                id: `${submission.submissionId}-${stepItem.objectType}`,
                status: FormStatus.missing,
                name: "",
                action:
                  stepItem.objectType === SDObjectTypes.linkBucket
                    ? t("summaryPage.selectBucket")
                    : t("summaryPage.fillForm"),
                step,
                objectType: stepItem.objectType,
                objectsList: [],
              },
            ]
          }
        }
        return []
      }) || []
    )
  })

  const columns: GridColDef[] = [
    {
      field: "status",
      headerName: t("Status"),
      renderCell: (params: GridRenderCellParams) => (
        <WizardObjectStatusBadge status={params.row.status} />
      ),
      flex: 0.5,
    },
    { field: "name", headerName: t("Name"), flex: 1 },
    {
      field: "action",
      headerName: t("summaryPage.requiredAction"),
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          {params.row.status === FormStatus.ready
            ? ""
            : params.row.objectType === SDObjectTypes.linkBucket
              ? t("summaryPage.selectBucket")
              : t("summaryPage.fillForm")}
        </Box>
      ),
      flex: 1,
    },
    {
      field: "edit",
      headerName: "",
      renderCell: (params: GridRenderCellParams) => (
        <GridActionsCellItem
          icon={<EditIcon color="primary" />}
          label={t("edit")}
          showInMenu
          onClick={() => {
            handleEdit(params.row.objectType, params.row.step)
          }}
          data-testid={`edit-${params.row.objectType}-summary`}
          disabled={
            params.row.objectType === SDObjectTypes.linkBucket && submission.bucket !== undefined
          }
        />
      ),
      flex: 0.5,
    },
  ]

  return (
    <>
      <Typography component="h1" variant="h4" color="secondary" sx={{ p: 2 }}>
        {t("summary")}
      </Typography>

      {mappedSummarySteps.map((summaryItem, index) => {
        const step = index + 1
        const stepRows = rows.filter(row => row.step === step)

        return (
          <Container
            key={summaryItem.title}
            disableGutters
            data-testid={`summary-step-${step}`}
            sx={{ padding: "1rem 0", mb: "2rem" }}
          >
            <Typography component="h2" variant="h5" color="secondary" sx={{ p: 2 }}>
              {step}. {summaryItem.title}
            </Typography>
            <Box sx={{ height: "auto", width: "100%", p: 2 }}>
              <SummaryTable
                rows={stepRows}
                columns={columns}
                sortModel={sortModels[step] || []}
                onSortModelChange={model => handleSortModelChange(step, model)}
                disableColumnMenu
                hideFooter={false}
              />
            </Box>
          </Container>
        )
      })}
    </>
  )
}

export default WizardShowSummaryStep
