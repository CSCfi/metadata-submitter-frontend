import React from "react"

import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import MuiCard from "@mui/material/Card"
import Stack from "@mui/material/Stack"
import { styled } from "@mui/material/styles"
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridRowParams,
  GridActionsCellItem,
  GridSortModel,
} from "@mui/x-data-grid"
import { useNavigate } from "react-router-dom"

import WizardPagination from "components/SubmissionWizard/WizardComponents/WizardPagination"
import { SubmissionStatus } from "constants/wizardSubmission"
import { setSubmission } from "features/wizardSubmissionSlice"
import { useAppDispatch } from "hooks"
import submissionAPIService from "services/submissionAPI"
import type { SubmissionRow } from "types"
import { getConvertedDate, pathWithLocale } from "utils"

const Card = styled(MuiCard)(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  border: "none",
  padding: 0,
}))

const DataTable = styled(DataGrid)(({ theme }) => ({
  color: theme.palette.secondary.main,
  "&.MuiDataGrid-root .MuiDataGrid-columnHeader:focus, &.MuiDataGrid-root .MuiDataGrid-cell:focus": {
    outline: "none",
    position: "relative",
  },
  "& .MuiDataGrid-columnSeparator": {
    display: "none",
  },
  "& .MuiDataGrid-cell:last-of-type:not(.MuiDataGrid-cell--withRenderer)": {
    display: "none",
  },
  "& .MuiDataGrid-columnHeadersInner, .MuiDataGrid-columnHeader, .MuiDataGrid-virtualScrollerRenderZone, .MuiDataGrid-cell, .MuiDataGrid-cell--withRenderer":
    {
      width: "100% !important",
    },
  "& .MuiDataGrid-columnHeaderTitleContainer": {
    padding: 0,
    "& > *": { fontWeight: 700 },
    "& .MuiDataGrid-sortIcon": {
      color: theme.palette.secondary.main,
      fontSize: "2rem",
    },
  },
  "& .MuiDataGrid-columnHeader:first-of-type, .MuiDataGrid-cell:first-of-type": {
    paddingLeft: "2em",
  },
  "& .MuiDataGrid-row": {
    border: `1px solid ${theme.palette.secondary.light}`,
    width: "100% !important",
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
}))

type SubmissionDataTableProps = {
  submissionType: string
  rows: Array<SubmissionRow>
  page?: number
  itemsPerPage?: number
  totalItems?: number
  fetchItemsPerPage?: (items: number, submissionType: string) => Promise<void>
  fetchPageOnChange?: (page: number, submissionType: string) => Promise<void>
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

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      sortable: false,
    },
    {
      field: "dateCreated",
      headerName: "Date created",
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
      headerName: "Last modified by",
      sortable: false,
    },
    {
      field: "actions",
      type: "actions",
      getActions: (params: GridRowParams) => [
        <>
          <GridActionsCellItem
            key={params.id}
            icon={<EditIcon color="primary" fontSize="large" />}
            onClick={e => handleEditSubmission(e, params.id)}
            label="Edit"
            showInMenu
            data-testid="edit-draft-submission"
          />
        </>,
        <>
          <GridActionsCellItem
            key={params.id}
            icon={<DeleteIcon color="primary" fontSize="large" />}
            onClick={e => {
              handleDeleteSubmission(e, params.id)
            }}
            label="Delete"
            data-testid="delete-draft-submission"
            showInMenu
          />
        </>,
      ],
    },
  ]

  const [columnVisibilityModel, setColumnVisibilityModel] = React.useState<GridColumnVisibilityModel>({
    actions: submissionType !== SubmissionStatus.published,
  })
  const [sortModel, setSortModel] = React.useState<GridSortModel>([
    {
      field: "dateCreated",
      sort: null,
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

  const handleDeleteSubmission = async (e, id) => {
    e.stopPropagation()
    onDeleteSubmission ? onDeleteSubmission(id, submissionType) : null
  }

  const handleChangePage = (_e: unknown, page: number) => {
    fetchPageOnChange ? fetchPageOnChange(page, submissionType) : null
  }

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      No results found.
    </Stack>
  )

  // Renders when there is submission list
  const SubmissionList = () => (
    <div style={{ height: "37.2rem", width: "100%" }}>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flexGrow: 1 }}>
          <DataTable
            rows={rows}
            columns={columns}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={newModel => setColumnVisibilityModel(newModel)}
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
        </div>
      </div>
    </div>
  )

  return (
    <Card variant="outlined">
      <SubmissionList />
    </Card>
  )
}

export default SubmissionDataTable
