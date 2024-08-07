import React, { useEffect, useState } from "react"

import EditIcon from "@mui/icons-material/Edit"
import { AppBar, Toolbar } from "@mui/material"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
//import Dialog from "@mui/material/Dialog"
//import DialogActions from "@mui/material/DialogActions"
//import DialogContent from "@mui/material/DialogContent"
//import DialogContentText from "@mui/material/DialogContentText"
//import DialogTitle from "@mui/material/DialogTitle"
// import Grid from "@mui/material/Grid"
// import Link from "@mui/material/Link"
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
import { useNavigate } from "react-router-dom"

//import WizardAlert from "../WizardComponents/WizardAlert"
import WizardObjectStatusBadge from "../WizardComponents/WizardObjectStatusBadge"
// import WizardDOIForm from "../WizardForms/WizardDOIForm"
import editObjectHook from "../WizardHooks/WizardEditObjectHook"
import WizardMapObjectsToStepHook from "../WizardHooks/WizardMapObjectsToStepsHook"
// import saveDraftsAsTemplates from "../WizardHooks/WizardSaveTemplatesHook"

// import { ResponseStatus } from "constants/responseStatus"
// import { DisplayObjectTypes } from "constants/wizardObject"
// import { resetAutocompleteField } from "features/autocompleteSlice"
// import { resetFileTypes } from "features/fileTypesSlice"
// import { setOpenedDoiForm } from "features/openedDoiFormSlice"
// import { updateStatus } from "features/statusMessageSlice"
// import { setCurrentObject, resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { updateStep } from "features/wizardStepObjectSlice"
// import { publishSubmissionContent, resetSubmission } from "features/wizardSubmissionSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import workflowAPIService from "services/workflowAPI"
// import type { ObjectInsideSubmissionWithTags, Workflow } from "types"
import type { Workflow } from "types"
import { pathWithLocale } from "utils"

const SummaryBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.common.white,
  borderBottom: `0.5rem solid ${theme.palette.primary.lightest}`,
  marginBottom: "2rem",
}))

const SummaryTable = styled(DataGrid)(({ theme }) => ({
  color: theme.palette.secondary.main,
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
}))

// const StepContainer = styled(Container)(({ theme }) => {
//   const itemBorder = `1px solid ${theme.palette.secondary.lightest}`
//   return {
//     "& .MuiGrid-container": { border: itemBorder, borderBottom: 0 },
//     "& .MuiGrid-container:last-child": { borderBottom: itemBorder },
//     "& ul:first-of-type p:first-of-type": { paddingTop: "0 !important" },
//   }
// })

// const SummaryItem = styled(Grid)(({ theme }) => ({
//   margin: 0,
//   padding: theme.spacing(1.5, 2),
//   "& .MuiGrid-item": { padding: theme.spacing(0, 1), alignSelf: "center" },
// }))

// const DraftHelperGridItem = styled(Grid)(({ theme }) => ({
//   flexGrow: "2 !important",
//   color: theme.palette.secondary.main,
// }))

// const ButtonContainer = styled("div")(({ theme }) => ({
//   marginTop: theme.spacing(3),
//   display: "flex",
//   width: "100%",
//   justifyContent: "space-between",
// }))

///**
// * Show summary of objects added to submission
// */
const WizardShowSummaryStep: React.FC = () => {
  const submission = useAppSelector(state => state.submission)
  const workflowType = useAppSelector(state => state.workflowType)
  //const openedDoiForm = useAppSelector(state => state.openedDoiForm)
  //const projectId = useAppSelector(state => state.projectId)
  const objectTypesArray = useAppSelector(state => state.objectTypesArray)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  //const [dialogOpen, setDialogOpen] = useState(false)

  const { t } = useTranslation()

  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | Record<string, unknown>>({})

  const [sortModels, setSortModels] = useState<{ [key: number]: GridSortModel }>({})

  const handleSortModelChange = (step: number, model: GridSortModel) => {
    setSortModels(prevSortModels => ({
      ...prevSortModels,
      [step]: model,
    }))
  }

  const [paginationModel, setPaginationModel] = useState({ pageSize: 5, page: 0 })

  // Fetch workflow based on workflowType
  useEffect(() => {
    const getWorkflow = async () => {
      if (workflowType) {
        const response = await workflowAPIService.getWorkflowByType(workflowType)
        setCurrentWorkflow(response.data)
      }
    }
    getWorkflow()
  }, [workflowType])

  // const DOIDialog = () => (
  //   <Dialog
  //     maxWidth="md"
  //     fullWidth
  //     open={openedDoiForm}
  //     onClose={() => dispatch(setOpenedDoiForm(false))}
  //     aria-labelledby="doi-dialog-title"
  //     aria-describedby="doi-dialog-description"
  //   >
  //     <DialogTitle id="doi-dialog-title">DOI information</DialogTitle>
  //     <DialogContent>
  //       <DialogContentText id="doi-dialog-description" data-testid="doi-dialog-content">
  //         Please fill in and save the information if you would like your submission to have DOI.
  //       </DialogContentText>
  //       <WizardDOIForm formId="doi-form" />
  //     </DialogContent>
  //     <DialogActions>
  //       <Button variant="contained" onClick={handleCancelDoiDialog} color="secondary">
  //         Cancel
  //       </Button>
  //       <Button variant="contained" color="primary" type="submit" form="doi-form">
  //         Save DOI info
  //       </Button>
  //     </DialogActions>
  //   </Dialog>
  // )
  // const handleCancelDoiDialog = () => {
  //   dispatch(setOpenedDoiForm(false))
  //   dispatch(resetAutocompleteField())
  //   dispatch(resetCurrentObject())
  // }
  // const handleOpenDoiDialog = () => {
  //   dispatch(setOpenedDoiForm(true))
  //   dispatch(setCurrentObject(submission.doiInfo))
  // }
  // const handlePublishDialog = async (
  //   alertWizard: boolean,
  //   formData?: Array<ObjectInsideSubmissionWithTags>
  // ) => {
  //   const resetDispatch = () => {
  //     navigate(pathWithLocale("home"))
  //     dispatch(resetObjectType())
  //     dispatch(resetSubmission())
  //   }
  //   if (alertWizard) {
  //     if (formData && formData?.length > 0) {
  //       await saveDraftsAsTemplates(projectId, formData, dispatch)
  //     }
  //     // Publish the submission
  //     dispatch(publishSubmissionContent(submission))
  //       .then(() => resetDispatch())
  //       .catch(error => {
  //         dispatch(
  //           updateStatus({
  //             status: ResponseStatus.error,
  //             response: error,
  //             helperText: `Couldn't publish submission with id ${submission.submissionId}`,
  //           })
  //         )
  //       })
  //     dispatch(resetFileTypes())
  //   } else {
  //     setDialogOpen(false)
  //   }
  //   setDialogOpen(false)
  // }

  useEffect(() => {
    WizardMapObjectsToStepHook(submission, objectTypesArray, currentWorkflow, t)
  })

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
  // Display other steps than last (summary)

  // Fetch workflow based on workflowType
  useEffect(() => {
    const getWorkflow = async () => {
      if (workflowType) {
        const response = await workflowAPIService.getWorkflowByType(workflowType)
        setCurrentWorkflow(response.data)
      }
    }
    getWorkflow()
  }, [workflowType])

  const { mappedSteps } = WizardMapObjectsToStepHook(
    submission,
    objectTypesArray,
    currentWorkflow,
    t
  )

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
              status: draft ? "Draft" : "Ready",
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
      <Container>
        <Typography
          component="h1"
          variant="h4"
          color="secondary"
        >
          {t("summary")}
        </Typography>
      </Container>
      {summarySteps.map((summaryItem, index) => {
        const step = index + 1
        const stepRows = rows.filter(row => row.step === step)
        const isDescribeStep = step === 4
        return (
          <Container
            key={summaryItem.title}
            disableGutters
            data-testid={`summary-step-${step}`}
            sx={{ padding: "1rem 0", marginBottom: "2rem" }}
          >
            <Typography
              component="h2"
              variant="h5"
              color="secondary"
              sx={{ marginTop: 2, marginBottom: 2 }}
            >
              {step}. {summaryItem.title}
            </Typography>
            <Box sx={{ height: "auto" }}>
              <SummaryTable
                rows={stepRows}
                columns={columns}
                sortModel={sortModels[step] || []}
                onSortModelChange={model => handleSortModelChange(step, model)}
                disableColumnMenu
                slots={{
                  noRowsOverlay: () => null,
                }}
                hideFooter={!isDescribeStep}
                hideFooterPagination={!isDescribeStep}
                hideFooterSelectedRowCount={!isDescribeStep}
                paginationModel={isDescribeStep ? paginationModel : undefined}
                onPaginationModelChange={
                  isDescribeStep ? newModel => setPaginationModel(newModel) : undefined
                }
                pagination={isDescribeStep ? true : undefined}
                pageSizeOptions={isDescribeStep ? [5, 10, 20, 50, 100] : undefined}
              />
            </Box>
          </Container>
        )
      })}
      {/* <ButtonContainer>
        <Button variant="contained" color="secondary" onClick={handleOpenDoiDialog}>
          Add DOI information (optional)
        </Button>
        <Button
          variant="contained"
          onClick={() => setDialogOpen(true)}
          data-testid="summary-publish"
        >
          Publish
        </Button>
      </ButtonContainer>
      {openedDoiForm && <DOIDialog />}
      {dialogOpen && (
        <WizardAlert
          onAlert={handlePublishDialog}
          parentLocation="footer"
          alertType={"publish"}
        ></WizardAlert>
      )} */}
    </>
  )
}

export default WizardShowSummaryStep
