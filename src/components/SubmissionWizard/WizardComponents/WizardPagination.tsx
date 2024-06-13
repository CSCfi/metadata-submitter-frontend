import React, { ReactElement } from "react"

import ExpandMore from "@mui/icons-material/ExpandMore"
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft"
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import MuiPagination from "@mui/material/Pagination"
import { styled, useTheme } from "@mui/material/styles"
import Table from "@mui/material/Table"
import TableFooter from "@mui/material/TableFooter"
import MuiTablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTranslation } from "react-i18next"

const TablePagination = styled(MuiTablePagination)(({ theme }) => ({
  color: theme.palette.secondary.main,
  border: "none",
  borderTop: `1px solid ${theme.palette.secondary.light}`,
  "& .MuiTablePagination-spacer": {
    flex: "none",
  },
  "& .MuiTablePagination-toolbar": {
    display: "flex",
    padding: 0,
  },
  "& .MuiTablePagination-selectLabel": {
    marginLeft: "1.375em",
  },
  "& .MuiTablePagination-select": {
    padding: 0,
    fontWeight: 700,
    display: "grid",
    alignItems: "center",
  },
  "& .MuiTablePagination-selectIcon": {
    fontSize: "2rem",
  },
  "& .MuiTablePagination-displayedRows": { marginLeft: "auto" },
}))

const TablePaginationActions = styled("div")(({ theme }) => ({
  marginLeft: "auto",
  width: "auto",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  "& > span:first-of-type": {
    textAlign: "center",
  },
  "& nav": {
    marginLeft: "3.25rem",
    "& li": {
      margin: "0 0.5rem",
    },
    "& li:first-of-type, li:last-of-type": {
      margin: 0,
    },
  },
  "& .MuiPaginationItem-root": {
    fontWeight: 700,
    color: theme.palette.secondary.main,
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
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
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
      {matches ? (
        <>
          <IconButton
            onClick={handleBackButtonClick}
            disabled={page === 0}
            aria-label="previous page"
            data-testid="previous page"
          >
            {theme.direction === "rtl" ? (
              <KeyboardArrowRight
                onClick={handleBackButtonClick}
                aria-label="previous page"
                data-testid="previous page"
              />
            ) : (
              <KeyboardArrowLeft />
            )}
          </IconButton>
          <IconButton
            onClick={handleNextButtonClick}
            aria-label="next page"
            data-testid="next page"
          >
            {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
          </IconButton>
        </>
      ) : (
        <MuiPagination count={totalPages} page={page + 1} onChange={handleChange} />
      )}
    </TablePaginationActions>
  )
}

type WizardPaginationProps = {
  totalNumberOfItems: number
  page: number
  itemsPerPage: number
  handleChangePage: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    page: number
  ) => void
  handleItemsPerPageChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
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
const WizardPagination: React.FC<WizardPaginationProps> = props => {
  const { totalNumberOfItems, page, itemsPerPage, handleChangePage, handleItemsPerPageChange } =
    props
  const { t } = useTranslation()

  const labelDisplayedRows = ({ from, to, count }) => (
    <DisplayRows>
      <Divider component="span" orientation="vertical" variant="middle" />
      <span>
        {from}-{to} / {count} {count > 1 ? t("dataTable.items") : t("dataTable.item")}
      </span>
    </DisplayRows>
  )

  // Get "rowsPerPageOptions" of TablePagination
  const getRowsPerPageOptions = (
    totalItems?: number
  ): Array<number | { value: number; label: string }> => {
    if (totalItems) {
      return [5, 10, 25, 50, 100]
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
            labelRowsPerPage={t("dataTable.itemsPerPage")}
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
