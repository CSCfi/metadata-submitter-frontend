import React, { useMemo, useState } from "react"

import EditIcon from "@mui/icons-material/Edit"
import { AppBar, Toolbar } from "@mui/material"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
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
import WizardPagination from "../WizardComponents/WizardPagination"
import WizardSearchBox from "../WizardComponents/WizardSearchBox"
import editObjectHook from "../WizardHooks/WizardEditObjectHook"

import { resetObjectType } from "features/wizardObjectTypeSlice"
import { updateStep } from "features/wizardStepObjectSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import { pathWithLocale } from "utils"

const SummaryBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.common.white,
  borderBottom: `0.5rem solid ${theme.palette.primary.lightest}`,
  marginBottom: "2rem",
}))

const SummaryTable = styled(DataGrid)(({ theme }) => ({
  color: theme.palette.secondary.main,
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
      color: theme.palette.secondary.main,
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

/**
 * Show summary of objects added to submission
 */

const WizardShowSummaryStep: React.FC = () => {
  const submission = useAppSelector(state => state.submission)
  const workflowType = useAppSelector(state => state.workflowType)
  const mappedSteps = useAppSelector(state => state.wizardMappedSteps)

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

  const handleEdit = (draft, objectType, item, step, objects) => {
    dispatch(updateStep({ step: step, objectType: objectType }))
    const folderId = submission.submissionId
    switch (step) {
      case 1: {
        dispatch(resetObjectType())
        navigate({ pathname: pathWithLocale(`submission/${folderId}`), search: "step=1" })
        break
      }
      default: {
        editObjectHook(
          draft,
          objectType,
          item,
          step,
          folderId,
          dispatch,
          navigate,
          objects.findIndex(object => object.id === item.accessionId)
        )
      }
    }
  }

  const summarySteps = mappedSteps.slice(0, mappedSteps.length - 1)
  const rows = summarySteps.flatMap((summaryItem, index) => {
    const step = index + 1
    return (
      summaryItem.schemas?.flatMap(stepItem => {
        const objects = stepItem.objects
        if (objects) {
          const objectsList = Object.values(objects).flat()
          return objectsList.map(item => {
            const draft = item.objectData?.schema.includes("draft-")
            return {
              id: item.id,
              status: draft ? t("draft") : t("draft"),
              name: item.displayTitle,
              action: draft ? t("Please mark as ready") : "",
              step,
              draft,
              objectType: stepItem.objectType,
              objectData: item.objectData,
              objectsList,
            }
          })
        }
        return []
      }) || []
    )
  })

  const [filteringText, setFilteringText] = useState<string>("")
  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      const statusText = row.draft ? t("draft") : t("ready")
      return (
        row.name.toLowerCase().includes(filteringText.toLowerCase()) ||
        statusText.toLowerCase().includes(filteringText.toLowerCase())
      )
    })
  }, [rows, filteringText])

  const columns: GridColDef[] = [
    {
      field: "status",
      headerName: t("Status"),
      renderCell: (params: GridRenderCellParams) => (
        <WizardObjectStatusBadge draft={params.row.draft} />
      ),
      flex: 0.5,
    },
    { field: "name", headerName: t("Name"), flex: 1 },
    { field: "action", headerName: t("Required Action"), flex: 1 },
    {
      field: "edit",
      headerName: "",
      renderCell: (params: GridRenderCellParams) => (
        <GridActionsCellItem
          icon={<EditIcon color="primary" />}
          label={t("edit")}
          onClick={() =>
            handleEdit(
              params.row.draft,
              params.row.objectType,
              params.row.objectData,
              params.row.step,
              params.row.objectsList
            )
          }
        />
      ),
      flex: 0.5,
    },
  ]

  const pageSizeOptions = [5, 10, 25, 50, 100]
  const [paginationModel, setPaginationModel] = useState({ pageSize: 5, page: 0 })

  return (
    <>
      <SummaryBar position="sticky" elevation={0}>
        <Toolbar sx={{ ml: "auto" }}>
          <Button
            color="inherit"
            sx={theme => ({
              bgcolor: theme.palette.primary.main,
              "&:hover": { bgcolor: theme.palette.primary.dark },
            })}
          >
            <Typography>
              {workflowType === "SDSX" ? t("summaryPage.publish") : t("summaryPage.setReleaseDate")}
            </Typography>
          </Button>
        </Toolbar>
      </SummaryBar>
      <Typography component="h1" variant="h4" color="secondary" sx={{ p: 2 }}>
        {t("summary")}
      </Typography>
      <Box sx={{ p: 2 }}>
        <WizardSearchBox
          placeholder={t("searchItems")}
          filteringText={filteringText}
          handleChangeFilteringText={e => setFilteringText(e.target.value)}
          handleClearFilteringText={() => setFilteringText("")}
        />
      </Box>
      {summarySteps.map((summaryItem, index) => {
        const step = index + 1
        const stepRows = filteredRows.filter(row => row.step === step)

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
                pagination
                paginationMode="client"
                paginationModel={paginationModel}
                pageSizeOptions={pageSizeOptions}
                hideFooter={false}
              />
              <WizardPagination
                totalNumberOfItems={stepRows.length}
                page={paginationModel.page}
                itemsPerPage={paginationModel.pageSize}
                handleChangePage={(_e, newPage) =>
                  setPaginationModel(prev => ({ ...prev, page: newPage }))
                }
                handleItemsPerPageChange={e =>
                  setPaginationModel(prev => ({
                    ...prev,
                    pageSize: parseInt(e.target.value, 10),
                    page: 0,
                  }))
                }
              />
            </Box>
          </Container>
        )
      })}
    </>
  )
}

export default WizardShowSummaryStep
