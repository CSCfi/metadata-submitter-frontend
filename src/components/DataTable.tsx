import React from "react"

import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import { styled } from "@mui/material/styles"
import { DataGrid, GridColDef, GridSortModel } from "@mui/x-data-grid"
import { useTranslation } from "react-i18next"

import WizardPagination from "components/SubmissionWizard/WizardComponents/WizardPagination"
import type { SubmissionRow, DataFolderRow, DataFileRow } from "types"

const Table = styled(DataGrid)(({ theme }) => ({
  color: theme.palette.secondary.main,
  "& .MuiDataGrid-columnSeparator, & .MuiDataGrid-cell:last-of-type": {
    display: "none",
  },
  "& .MuiDataGrid-columnHeaders .MuiDataGrid-columnHeader": {
    backgroundColor: theme.palette.common.white,
    "&:hover": {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.primary.lighter,
    },
    flex: "1 1 auto",
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    fontWeight: 700,
  },
  "& .MuiDataGrid-columnHeaderTitleContainer": {
    padding: 0,
    justifyContent: "left",
    "& .MuiDataGrid-sortIcon": {
      color: theme.palette.secondary.main,
      fontSize: "2rem",
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
  "& .MuiDataGrid-row:hover": {
    cursor: "pointer",
  },
}))

type DataTableProps = {
  columns: GridColDef[]
  rows: Array<SubmissionRow | DataFolderRow | DataFileRow>
  page?: number
  totalItems?: number
  sortingModel: GridSortModel
  fetchPageOnChange?: (page: number) => void
}

const DataTable: React.FC<DataTableProps> = props => {
  const {
    columns,
    rows,
    totalItems,
    sortingModel,
    fetchPageOnChange,
  } = props
  const { t } = useTranslation()

  const [paginationModel, setPaginationModel] = React.useState({ pageSize: 5, page: 0 })
  const [sortModel, setSortModel] = React.useState<GridSortModel>(sortingModel)

  const handleChangePage = (_e: unknown, newPage: number) => {
    fetchPageOnChange ? fetchPageOnChange(newPage) : null
    setPaginationModel(prev => ( { ...prev, page: newPage } ))
  }

  const DataGridPagination = () =>
    totalItems && paginationModel.page !== undefined && paginationModel.pageSize? (
      <WizardPagination
        totalNumberOfItems={totalItems}
        page={paginationModel.page}
        itemsPerPage={paginationModel.pageSize}
        handleChangePage={handleChangePage}
        handleItemsPerPageChange={e =>
          setPaginationModel(prev => ({
            ...prev,
            pageSize: parseInt(e.target.value, 10),
            page: 0,
          }))
        }
      />
    ) : null

  const NoRowsOverlay = () => (
    <Stack height="100%" alignItems="center" justifyContent="center">
      {t("dataTable.noResults")}
    </Stack>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <Table
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
        paginationModel={paginationModel}
        onPaginationModelChange={(newPaginationModel) => setPaginationModel(newPaginationModel)}
        sortModel={sortModel}
        onSortModelChange={(newSortModel: GridSortModel) => setSortModel(newSortModel)}
      />
    </Box>
  )
}

export default DataTable
