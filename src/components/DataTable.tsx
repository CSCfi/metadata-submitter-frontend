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
  itemsPerPage?: number
  totalItems?: number
  sortingModel: GridSortModel
  fetchItemsPerPage?: (items: number) => void
  fetchPageOnChange?: (page: number) => void
}

const DataTable: React.FC<DataTableProps> = props => {
  const {
    columns,
    rows,
    page,
    itemsPerPage,
    totalItems,
    sortingModel,
    fetchPageOnChange,
    fetchItemsPerPage,
  } = props
  const { t } = useTranslation()

  const [sortModel, setSortModel] = React.useState<GridSortModel>(sortingModel)

  const handleChangePage = (_e: unknown, page: number) => {
    fetchPageOnChange ? fetchPageOnChange(page) : null
  }

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    fetchItemsPerPage ? fetchItemsPerPage(parseInt(e.target.value, 10)) : null
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

  return (
    <Box>
      <Table
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
    </Box>
  )
}

export default DataTable
