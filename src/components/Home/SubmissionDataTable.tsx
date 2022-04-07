import React from "react"

import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import MuiCard from "@mui/material/Card"
import Stack from "@mui/material/Stack"
import { styled } from "@mui/material/styles"
import {
  DataGrid,
  GridRowParams,
  GridValueGetterParams,
  GridValueFormatterParams,
  GridActionsCellItem,
  GridCellValue,
  GridSortModel,
} from "@mui/x-data-grid"
import { useNavigate } from "react-router-dom"

import WizardPagination from "components/NewDraftWizard/WizardComponents/WizardPagination"
import { FolderSubmissionStatus } from "constants/wizardFolder"
import { setFolder } from "features/wizardSubmissionFolderSlice"
import { useAppDispatch } from "hooks"
import folderAPIService from "services/folderAPI"
import type { FolderRow } from "types"
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
  folderType: string
  rows: Array<FolderRow>
  page?: number
  itemsPerPage?: number
  totalItems?: number
  fetchItemsPerPage?: (items: number, folderType: string) => Promise<void>
  fetchPageOnChange?: (page: number, folderType: string) => Promise<void>
  onDeleteSubmission?: (submissionId: string, folderType: string) => void
}

const SubmissionDataTable: React.FC<SubmissionDataTableProps> = props => {
  const { folderType, page, itemsPerPage, totalItems, fetchPageOnChange, fetchItemsPerPage, rows, onDeleteSubmission } =
    props
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const columns = [
    {
      field: "name",
      headerName: "Name",
      sortable: false,
    },
    {
      field: "dateCreated",
      headerName: "Date created",
      type: "date",
      valueFormatter: (params: GridValueFormatterParams): GridCellValue => {
        const { convertedDate } = params.value as Record<string, string>
        return convertedDate
      },
      valueGetter: (params: GridValueGetterParams): GridCellValue => ({
        convertedDate: getConvertedDate(params.value),
        timestamp: params.value,
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
      hide: folderType === FolderSubmissionStatus.published,
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

  const [sortModel, setSortModel] = React.useState<GridSortModel>([
    {
      field: "dateCreated",
      sort: null,
    },
  ])

  const handleEditSubmission = async (e, id) => {
    e.stopPropagation()
    const response = await folderAPIService.getFolderById(id)
    dispatch(setFolder(response.data))
    navigate({
      pathname: pathWithLocale(`newdraft/${id}`),
      search: `step=0`,
    })
  }

  const handleDeleteSubmission = async (e, id) => {
    e.stopPropagation()
    onDeleteSubmission ? onDeleteSubmission(id, folderType) : null
  }

  const handleChangePage = (_e: unknown, page: number) => {
    fetchPageOnChange ? fetchPageOnChange(page, folderType) : null
  }

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    fetchItemsPerPage ? fetchItemsPerPage(parseInt(e.target.value, 10), folderType) : null
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

  // Renders when there is folder list
  const FolderList = () => (
    <div style={{ height: "37.2rem", width: "100%" }}>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ flexGrow: 1 }}>
          <DataTable
            rows={rows}
            columns={columns}
            disableSelectionOnClick
            disableColumnMenu
            disableColumnFilter
            disableColumnSelector
            hideFooterSelectedRowCount
            components={{
              Pagination: DataGridPagination,
              NoRowsOverlay: NoRowsOverlay,
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
      <FolderList />
    </Card>
  )
}

export default SubmissionDataTable
