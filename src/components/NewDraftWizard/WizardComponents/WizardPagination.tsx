import React, { ReactElement } from "react"

import ExpandMore from "@mui/icons-material/ExpandMore"
import MuiPagination from "@mui/material/Pagination"
import { styled } from "@mui/material/styles"
import Table from "@mui/material/Table"
import TableFooter from "@mui/material/TableFooter"
import MuiTablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"

const TablePagination = styled(MuiTablePagination)(({ theme }) => ({
  color: theme.palette.secondary.main,
  border: "none",
  fontSize: "1.4rem",
  borderTop: `1px solid ${theme.palette.secondary.light}`,
  "& .MuiTablePagination-spacer": {
    flex: "none",
  },
  "& .MuiTablePagination-toolbar": {
    display: "flex",
    justifyContent: "flex-start",
    padding: 0,
  },
  "& .MuiInputBase-root": {
    marginRight: "3.25rem",
  },
  "& .MuiTablePagination-selectLabel": {
    fontSize: "1.4rem",
    marginLeft: "1.375em",
    marginRight: "3.25rem",
  },
  "& .MuiTablePagination-select": {
    padding: 0,
    color: theme.palette.primary.main,
    fontWeight: 700,
    fontSize: "1.4rem",
    display: "grid",
    alignItems: "center",
  },
  "& .MuiTablePagination-selectIcon": {
    color: theme.palette.primary.main,
    fontSize: "2rem",
  },
  "& .MuiTablePagination-displayedRows": {
    fontSize: "1.4rem",
    paddingLeft: "3.25rem",
    borderLeft: `1px solid #707070`,
  },
}))

const TablePaginationActions = styled("div")(({ theme }) => ({
  flexGrow: 1,
  marginLeft: "3.25rem",
  width: "auto",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-end",
  "& > span:first-of-type": {
    textAlign: "center",
  },
  "& nav": {
    marginLeft: "3.25rem",
    border: `1px solid ${theme.palette.secondary.light}`,
    "& li": {
      margin: "0 0.5rem",
    },
    "& li:first-of-type, li:last-of-type": {
      border: `1px solid ${theme.palette.secondary.light}`,
      margin: 0,
    },
  },
  "& .MuiPaginationItem-root": {
    fontWeight: 700,
    fontSize: "1.4rem",
    color: theme.palette.secondary.main,
    height: "5.2rem",
    width: "4rem",
    border: "none",
    display: "grid",
    alignItems: "center",
    "&.MuiPaginationItem-previousNext": {
      color: theme.palette.primary.main,
      "& > svg": {
        fontSize: "x-large",
      },
      "&.Mui-disabled": {
        color: theme.palette.secondary.main,
        opacity: 1,
      },
    },
  },
  "& .MuiPaginationItem-root.Mui-selected": {
    color: theme.palette.primary.main,
    backgroundColor: "transparent",
  },
}))

type TablePaginationActionsType = {
  count: number
  page: number
  rowsPerPage: number
  onPageChange: (event: null, newPage: number) => void
}

const PaginationActions = ({ count, page, rowsPerPage, onPageChange }: TablePaginationActionsType): ReactElement => {
  const totalPages = Math.ceil(count / rowsPerPage)

  const handleChange = (e: React.ChangeEvent<unknown>, val: number) => {
    onPageChange(null, val - 1)
  }
  return (
    <TablePaginationActions>
      <span aria-label="current page" data-testid="page info">
        {page + 1} of {totalPages} pages
      </span>
      <MuiPagination count={totalPages} page={page + 1} onChange={handleChange} shape="rounded" variant="outlined" />
    </TablePaginationActions>
  )
}

type PaginationType = {
  totalNumberOfItems: number
  page: number
  itemsPerPage: number
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, page: number) => void
  handleItemsPerPageChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

// Pagination Component
const Pagination: React.FC<PaginationType> = (props: PaginationType) => {
  const { totalNumberOfItems, page, itemsPerPage, handleChangePage, handleItemsPerPageChange } = props

  // Get "rowsPerPageOptions" of TablePagination
  const getRowsPerPageOptions = (totalItems?: number): Array<number | { value: number; label: string }> => {
    if (totalItems) {
      if (totalItems <= 5) return []
      else if (totalItems > 5 && totalItems <= 15) return [5, 15]
      else if (totalItems > 15 && totalItems <= 25) return [5, 15, 25]
      else return [5, 15, 25, 50]
    }
    return []
  }

  return (
    <Table data-testid="table-pagination">
      <TableFooter>
        <TableRow>
          <TablePagination
            ActionsComponent={PaginationActions}
            count={totalNumberOfItems}
            labelRowsPerPage="Items per page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count} items`}
            page={page}
            rowsPerPage={itemsPerPage}
            rowsPerPageOptions={getRowsPerPageOptions(totalNumberOfItems)}
            SelectProps={{ IconComponent: ExpandMore }}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleItemsPerPageChange}
          />
        </TableRow>
      </TableFooter>
    </Table>
  )
}

export default Pagination
