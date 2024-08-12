import React from "react"

import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import { styled } from "@mui/material/styles"
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridActionsCellItem,
  GridSortModel,
} from "@mui/x-data-grid"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import WizardPagination from "components/SubmissionWizard/WizardComponents/WizardPagination"
import { SubmissionStatus } from "constants/wizardSubmission"
import { setSubmission } from "features/wizardSubmissionSlice"
import { useAppDispatch } from "hooks"
import submissionAPIService from "services/submissionAPI"
import { SubmissionRow } from "types"
import { getConvertedDate, pathWithLocale } from "utils"

const DataTable = styled(DataGrid)(({ theme }) => ({
  color: theme.palette.secondary.main,
  "& .MuiDataGrid-columnSeparator, & .MuiDataGrid-cell:last-of-type": {
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
  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: 700,
  },
  "& .MuiDataGrid-columnHeadersInner, .MuiDataGrid-columnHeader, .MuiDataGrid-virtualScrollerRenderZone, .MuiDataGrid-cell, .MuiDataGrid-cell--withRenderer":
    {
      width: "100% !important",
    },
  "& .MuiDataGrid-columnHeaderTitleContainer": {
    padding: 0,
    "& .MuiDataGrid-sortIcon": {
      color: theme.palette.secondary.main,
      fontSize: "2rem",
    },
  },
  "& .MuiDataGrid-columnHeader--last": {
    "&:hover": {
      backgroundColor: `${theme.palette.common.white} !important`,
    },
  },
  "& .MuiDataGrid-actionsCell": {
    color: theme.palette.primary.main,
    alignItems: "flex-start",
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      flexDirection: "column",
      gridGap: 0,
      "& .MuiMenuItem-root.MuiMenuItem-gutters.MuiButtonBase-root": { minHeight: "0 !important" },
    },
  },
  "& .MuiDataGrid-overlayWrapper": { height: "10rem" },
}))

type SubmissionDataTableProps = {
  submissionType: string
  rows: Array<SubmissionRow>
  page?: number
  itemsPerPage?: number
  totalItems?: number
  fetchItemsPerPage?: (items: number, submissionType: string) => Promise<void>
  fetchPageOnChange?: (page: number) => Promise<void>
  onDeleteSubmission?: (submissionId: string, submissionType: string) => void
}

const SubmissionDataTable: React.FC<SubmissionDataTableProps> = props => {
  const {
    submissionType,
    page,
    itemsPerPage,
    totalItems,
    fetchPageOnChange,
    fetchItemsPerPage,
    rows,
    onDeleteSubmission,
  } = props
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("dataTable.name"),
      sortable: true,
    },
    {
      field: "dateCreated",
      headerName: t("dataTable.dateCreated"),
      type: "date",
      valueFormatter: value => {
        const { convertedDate } = value as Record<string, string>
        return convertedDate
      },
      valueGetter: value => ({
        convertedDate: getConvertedDate(value),
        timestamp: value,
      }),
      sortComparator: (v1, v2) => v2.timestamp - v1.timestamp,
    },
    {
      field: "lastModifiedBy",
      headerName: t("dataTable.lastModifiedBy"),
      sortable: true,
    },
    {
      field: "actions",
      type: "actions",
      getActions: (params: GridRowParams) =>
        params.row.submissionType === SubmissionStatus.unpublished
          ? [
              <>
                <GridActionsCellItem
                  key={params.id}
                  icon={<EditIcon color="primary" fontSize="large" />}
                  onClick={e => handleEditSubmission(e, params.id)}
                  label={t("edit")}
                  showInMenu
                  data-testid="edit-draft-submission"
                />
              </>,
              <>
                <GridActionsCellItem
                  key={params.id}
                  icon={<DeleteIcon color="primary" fontSize="large" />}
                  onClick={e => handleDeleteSubmission(e, params.id, params.row.submissionType)}
                  label={t("delete")}
                  data-testid="delete-draft-submission"
                  showInMenu
                />
              </>,
            ]
          : [],
    },
  ]

  const [sortModel, setSortModel] = React.useState<GridSortModel>([
    {
      field: "dateCreated",
      sort: "asc",
    },
  ])

  const handleEditSubmission = async (e, id) => {
    e.stopPropagation()
    const response = await submissionAPIService.getSubmissionById(id)
    dispatch(setSubmission(response.data))
    navigate({
      pathname: pathWithLocale(`submission/${id}`),
      search: `step=1`,
    })
  }

  const handleDeleteSubmission = async (e, id, submissionType) => {
    e.stopPropagation()
    onDeleteSubmission ? onDeleteSubmission(id, submissionType) : null
  }

  const handleChangePage = (_e: unknown, page: number) => {
    fetchPageOnChange ? fetchPageOnChange(page) : null
  }

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    fetchItemsPerPage ? fetchItemsPerPage(parseInt(e.target.value, 10), submissionType) : null
  }

  const DataGridPagination = () =>
    totalItems && page !== undefined && itemsPerPage ? (
      <WizardPagination
        totalNumberOfItems={totalItems}
        page={page}
        itemsPerPage={itemsPerPage}
        handleChangePage={handleChangePage}
        handleItemsPerPageChange={handleItemsPerPageChange}
      />
    ) : null

  const NoRowsOverlay = () => (
    <Stack height="100%" alignItems="center" justifyContent="center">
      {t("dataTable.noResults")}
    </Stack>
  )

  // Renders when there is submission list
  const SubmissionList = () => (
    <DataTable
      autoHeight
      rows={rows}
      columns={columns}
      disableRowSelectionOnClick
      disableColumnMenu
      disableColumnFilter
      disableColumnSelector
      hideFooterSelectedRowCount
      slots={{
        pagination: DataGridPagination,
        noRowsOverlay: NoRowsOverlay,
      }}
      sortModel={sortModel}
      onSortModelChange={(newSortModel: GridSortModel) => setSortModel(newSortModel)}
    />
  )

  return (
    <Box>
      <SubmissionList />
    </Box>
  )
}

export default SubmissionDataTable
