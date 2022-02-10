import React from "react"

import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import MuiCard from "@mui/material/Card"
import MuiCardContent from "@mui/material/CardContent"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
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

import { setFolder } from "features/wizardSubmissionFolderSlice"
import { useAppDispatch } from "hooks"
import folderAPIService from "services/folderAPI"
import type { FolderRow } from "types"
import { getConvertedDate, Pagination, pathWithLocale } from "utils"

const Card = styled(MuiCard)(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  border: "none",
  padding: 0,
}))

const CardContent = styled(MuiCardContent)(() => ({
  flexGrow: 1,
  padding: 0,
}))

const DataTable = styled(DataGrid)(({ theme }) => ({
  color: theme.palette.secondary.main,
  "& .MuiDataGrid-columnSeparator": {
    display: "none",
  },
  "& .MuiDataGrid-columnHeaderTitleContainer": {
    padding: 0,
    "& > *": { fontWeight: 700 },
  },
  "& .MuiDataGrid-columnHeader:first-of-type, .MuiDataGrid-cell:first-of-type": {
    paddingLeft: "2em",
  },
  "& .MuiDataGrid-row": {
    border: `1px solid ${theme.palette.secondary.light}`,
  },
  "& .MuiDataGrid-cell--withRenderer": {
    width: "100%",
    maxWidth: "none !important",
  },
  "& .MuiDataGrid-actionsCell": {
    color: theme.palette.primary.main,
    marginRight: "0.625rem",
  },
}))

type SubmissionIndexCardProps = {
  folderType: string
  rows: Array<FolderRow>
  location?: string
  page?: number
  itemsPerPage?: number
  totalItems?: number
  fetchItemsPerPage?: (items: number, submissionType: string) => Promise<void>
  fetchPageOnChange?: (page: number, submissionType: string) => Promise<void>
  onDeleteSubmission?: (submissionId: string, submissionType: string) => void
}

const SubmissionIndexCard: React.FC<SubmissionIndexCardProps> = props => {
  const { folderType, page, itemsPerPage, totalItems, fetchPageOnChange, fetchItemsPerPage, rows, onDeleteSubmission } =
    props
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const columns = [
    {
      field: "name",
      headerName: "Name",
      sortable: false,
      width: 310,
    },
    {
      field: "dateCreated",
      headerName: "Date created",
      width: 250,
      type: "date",
      valueFormatter: (params: GridValueFormatterParams): GridCellValue => {
        const { convertedDate } = params.value as Record<string, string>
        return convertedDate
      },
      valueGetter: (params: GridValueGetterParams): GridCellValue => ({
        convertedDate: getConvertedDate(params.value),
        timestamp: params.value,
      }),
      sortComparator: (v1, v2) => v1.timestamp - v2.timestamp,
    },
    {
      field: "lastModifiedBy",
      headerName: "Last modified by",
      width: 250,
    },
    {
      field: "cscProject",
      headerName: "CSC Project",
      width: 250,
    },
    {
      field: "actions",
      type: "actions",
      getActions: (params: GridRowParams) => [
        <div key={params.id}>
          <GridActionsCellItem
            icon={<EditIcon color="primary" />}
            onClick={e => handleEditSubmission(e, params.id)}
            label="Edit"
            showInMenu
          />
        </div>,
        <div key={params.id}>
          <GridActionsCellItem
            icon={<DeleteIcon color="primary" />}
            onClick={e => {
              handleDeleteSubmission(e, params.id)
            }}
            label="Delete"
            showInMenu
          />
        </div>,
      ],
    },
  ]

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

  const [sortModel, setSortModel] = React.useState<GridSortModel>([
    {
      field: "dateCreated",
      sort: "asc",
    },
  ])

  const DataGridPagination = () =>
    totalItems && page !== undefined && itemsPerPage ? (
      <Pagination
        totalNumberOfItems={totalItems}
        page={page}
        itemsPerPage={itemsPerPage}
        handleChangePage={handleChangePage}
        handleItemsPerPageChange={handleItemsPerPageChange}
      />
    ) : null

  // Renders when there is folder list
  const FolderList = () => (
    <div style={{ height: "23.25rem", width: "100%" }}>
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
            }}
            sortModel={sortModel}
            onSortModelChange={(newSortModel: GridSortModel) => setSortModel(newSortModel)}
          />
        </div>
      </div>
    </div>
  )

  // Renders when there is no folders in the list
  const EmptyList = () => (
    <CardContent>
      <Typography align="center" variant="body2">
        Currently there are no {folderType} submissions
      </Typography>
    </CardContent>
  )

  return <Card variant="outlined">{rows.length > 0 ? <FolderList /> : <EmptyList />}</Card>
}

export default SubmissionIndexCard
