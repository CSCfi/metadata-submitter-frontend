import React, { ReactElement } from "react"

import ExpandMore from "@mui/icons-material/ExpandMore"
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft"
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight"
import { Typography } from "@mui/material"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import MuiPagination from "@mui/material/Pagination"
import { styled, useTheme } from "@mui/material/styles"
import Table from "@mui/material/Table"
import TableFooter from "@mui/material/TableFooter"
import MuiTablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import useMediaQuery from "@mui/material/useMediaQuery"

const TablePagination = styled(MuiTablePagination)(({ theme }) => ({
  color: theme.palette.secondary.main,
  border: "none",
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
    marginLeft: "1.375em",
    marginRight: "3.25rem",
  },
  "& .MuiTablePagination-select": {
    padding: 0,
    color: theme.palette.primary.main,
    fontWeight: 700,
    display: "grid",
    alignItems: "center",
  },
  "& .MuiTablePagination-selectIcon": {
    color: theme.palette.primary.main,
    fontSize: "2rem",
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

type WizardPaginationActionsType = {
  count: number
  page: number
  rowsPerPage: number
  onPageChange: (event: null, newPage: number) => void
}

const WizardPaginationActions = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
}: WizardPaginationActionsType): ReactElement => {
  const theme = useTheme()
  const totalPages = Math.ceil(count / rowsPerPage)

  const matches = useMediaQuery(theme.breakpoints.down("md"))

  const handleChange = (e: React.ChangeEvent<unknown>, val: number) => {
    onPageChange(null, val - 1)
  }

  const handleBackButtonClick = () => {
    onPageChange(null, page - 1)
  }
  const handleNextButtonClick = () => {
    onPageChange(null, page + 1)
  }
  return (
    <TablePaginationActions>
      <Typography component="span" variant="body2" aria-label="current page" data-testid="page info">
        {page + 1} of {totalPages} pages
      </Typography>
      {matches ? (
        <>
          <IconButton
            onClick={handleBackButtonClick}
            disabled={page === 0}
            aria-label="previous page"
            data-testid="previous page"
          >
            {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
          </IconButton>
          <IconButton
            onClick={handleNextButtonClick}
            disabled={page >= totalPages - 1}
            aria-label="next page"
            data-testid="next page"
          >
            {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
          </IconButton>
        </>
      ) : (
        <MuiPagination count={totalPages} page={page + 1} onChange={handleChange} shape="rounded" variant="outlined" />
      )}
    </TablePaginationActions>
  )
}

type WizardPagination = {
  totalNumberOfItems: number
  page: number
  itemsPerPage: number
  handleChangePage: (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, page: number) => void
  handleItemsPerPageChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

const DisplayRows = styled("span")(({ theme }) => ({
  display: "flex",
  "& span:first-of-type": {
    height: "auto",
    margin: 0,
  },
  "& span:last-of-type": {
    color: theme.palette.secondary.main,
    fontSize: "1.4rem",
    marginLeft: "3.25rem",
  },
}))

// Pagination Component
const WizardPagination: React.FC<WizardPagination> = props => {
  const { totalNumberOfItems, page, itemsPerPage, handleChangePage, handleItemsPerPageChange } = props

  const labelDisplayedRows = ({ from, to, count }) => (
    <DisplayRows>
      {totalNumberOfItems > 5 && <Divider component="span" orientation="vertical" variant="middle" />}
      <span>
        {from}-{to} of {count} items
      </span>
    </DisplayRows>
  )

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
            ActionsComponent={WizardPaginationActions}
            count={totalNumberOfItems}
            labelRowsPerPage="Items per page:"
            labelDisplayedRows={labelDisplayedRows}
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

export default WizardPagination
