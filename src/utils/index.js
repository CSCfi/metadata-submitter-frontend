//@flow
import React from "react"
import type { Node } from "react"

import IconButton from "@material-ui/core/IconButton"
import { makeStyles, withStyles, useTheme } from "@material-ui/core/styles"
import Table from "@material-ui/core/Table"
import TableFooter from "@material-ui/core/TableFooter"
import MUITablePagination from "@material-ui/core/TablePagination"
import TableRow from "@material-ui/core/TableRow"
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft"
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight"
import { useLocation } from "react-router-dom"

import { ObjectTypes } from "constants/wizardObject"
import type { ObjectInsideFolderWithTags } from "types"

export const getObjectDisplayTitle = (objectType: string, cleanedValues: any): string => {
  switch (objectType) {
    case ObjectTypes.study:
      return cleanedValues.descriptor?.studyTitle || ""
    case ObjectTypes.dac:
      return cleanedValues.contacts?.find(contact => contact.mainContact)?.name || ""
    default:
      return cleanedValues.title || ""
  }
}

// Get Primary text for displaying item's title
export const getItemPrimaryText = (item: ObjectInsideFolderWithTags): string => {
  if (item.tags?.displayTitle) {
    switch (item.schema) {
      case ObjectTypes.dac:
      case `draft-${ObjectTypes.dac}`:
        return `Main Contact: ${item.tags.displayTitle}`
      default:
        return item.tags.displayTitle
    }
  } else if (item.tags?.fileName) {
    return item.tags.fileName
  }
  return ""
}

export const useQuery = (): URLSearchParams => {
  return new URLSearchParams(useLocation().search)
}

export const formatDisplayObjectType = (objectType: string): string => {
  if (objectType === ObjectTypes.dac) {
    return `${objectType.toUpperCase()}`
  } else if (objectType === `draft-${ObjectTypes.dac}`) {
    const hyphenIndex = objectType.indexOf("-")
    return `draft-${objectType.slice(hyphenIndex + 1).toUpperCase()}`
  } else {
    return `${objectType.charAt(0).toUpperCase()}${objectType.slice(1)}`
  }
}

// draftObjects contains an array of objects and each has a schema and the related draft(s) array if there is any
export const getDraftObjects = (drafts: Array<ObjectInsideFolderWithTags>, objectsArray: Array<string>): any => {
  const draftObjects = objectsArray.flatMap((schema: string) => {
    const draftSchema = `draft-${schema}`
    const draftArray = drafts.filter(draft => draft.schema.toLowerCase() === draftSchema.toLowerCase())
    return draftArray.length > 0 ? [{ [`draft-${schema}`]: draftArray }] : []
  })

  return draftObjects
}

// Get "rowsPerPageOptions" of TablePagination
export const getRowsPerPageOptions = (totalItems?: number): Array<any> => {
  if (totalItems) {
    const optionAll = { value: totalItems, label: "All" }
    if (totalItems <= 10) return []
    else if (totalItems > 10 && totalItems <= 50) return [10, optionAll]
    else if (totalItems > 50 && totalItems <= 100) return [10, 50, optionAll]
    else return [10, 50, 100, optionAll]
  }
  return []
}

const TablePagination = withStyles({
  spacer: {
    flex: "none",
  },
  selectRoot: {
    borderRight: "1px solid rgba(0, 0, 0, 0.87)",
    marginRight: "0.5rem",
    fontWeight: "bold",
  },
  select: { padding: 0 },
  toolbar: {
    display: "flex",
    justifyContent: "flex-start",
  },
  actions: {
    marginLeft: "auto",
  },
})(MUITablePagination)

const tablePaginationStyles = makeStyles({
  tablePagination: {
    border: "none",
  },
  paginationActions: {
    flexShrink: 0,
    flexDirection: "row",
    marginLeft: "auto",
  },
})

const TablePaginationActions = ({ count, page, rowsPerPage, onPageChange }: any) => {
  const theme = useTheme()
  const classes = tablePaginationStyles()
  const totalPages = Math.ceil(count / rowsPerPage)

  const handleBackButtonClick = e => {
    onPageChange(e, page - 1)
  }
  const handleNextButtonClick = e => {
    onPageChange(e, page + 1)
  }
  return (
    <div className={classes.paginationActions}>
      <span aria-label="current page" data-testid="page info">
        {page + 1} of {totalPages} pages
      </span>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === "rtl" ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton onClick={handleNextButtonClick} disabled={page >= totalPages - 1} aria-label="next page">
        {theme.direction === "rtl" ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
    </div>
  )
}

// Pagination Component
export const Pagination = ({
  totalNumberOfItems,
  page,
  itemsPerPage,
  handleChangePage,
  handleItemsPerPageChange,
}: {
  totalNumberOfItems: number,
  page: number,
  itemsPerPage: number,
  handleChangePage: (e: any, page: number) => void,
  handleItemsPerPageChange: (e: any) => void,
}): Node => {
  const classes = tablePaginationStyles()
  return (
    <Table data-testid="table-pagination">
      <TableFooter>
        <TableRow>
          <TablePagination
            className={classes.tablePagination}
            ActionsComponent={TablePaginationActions}
            count={totalNumberOfItems}
            labelRowsPerPage="Items per page:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count} items`}
            page={page}
            rowsPerPage={itemsPerPage}
            rowsPerPageOptions={getRowsPerPageOptions(totalNumberOfItems)}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleItemsPerPageChange}
          />
        </TableRow>
      </TableFooter>
    </Table>
  )
}
