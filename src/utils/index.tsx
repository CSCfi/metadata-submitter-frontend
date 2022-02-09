import React, { ReactElement } from "react"

import ExpandMore from "@mui/icons-material/ExpandMore"
import MuiPagination from "@mui/material/Pagination"
import { styled } from "@mui/material/styles"
import Table from "@mui/material/Table"
import TableFooter from "@mui/material/TableFooter"
import MuiTablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import { uniq } from "lodash"
import moment from "moment"
import { useLocation } from "react-router-dom"

import { Locale } from "constants/locale"
import { ObjectTypes, ObjectSubmissionTypes } from "constants/wizardObject"
import type { FormDataFiles, ObjectDisplayValues, ObjectInsideFolderWithTags } from "types"

export const getObjectDisplayTitle = (objectType: string, cleanedValues: ObjectDisplayValues): string => {
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
export const getDraftObjects = (
  drafts: Array<ObjectInsideFolderWithTags>,
  objectTypesArray: Array<string>
): { [draftObjectType: string]: ObjectInsideFolderWithTags[] }[] => {
  const draftObjects = objectTypesArray.flatMap((schema: string) => {
    const draftSchema = `draft-${schema}`
    const draftArray = drafts.filter(draft => draft.schema.toLowerCase() === draftSchema.toLowerCase())
    return draftArray.length > 0 ? [{ [draftSchema]: draftArray }] : []
  })

  return draftObjects
}

export const getUserTemplates = (
  templates: Array<ObjectInsideFolderWithTags>,
  objectTypesArray: Array<string>
): { [templateObjectType: string]: ObjectInsideFolderWithTags[] }[] => {
  const userTemplates = objectTypesArray.flatMap((schema: string) => {
    const templateSchema = `template-${schema}`
    const templatesArray = templates.filter(template => template.schema.toLowerCase() === templateSchema.toLowerCase())
    return templatesArray.length > 0 ? [{ [templateSchema]: templatesArray }] : []
  })

  return userTemplates
}

// Get "rowsPerPageOptions" of TablePagination
export const getRowsPerPageOptions = (totalItems?: number): Array<number | { value: number; label: string }> => {
  if (totalItems) {
    if (totalItems <= 5) return []
    else if (totalItems > 5 && totalItems <= 15) return [5, 15]
    else if (totalItems > 15 && totalItems <= 25) return [5, 15, 25]
    else return [5, 15, 25, 50]
  }
  return []
}

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
    fontSize: "1rem",
    display: "grid",
    alignItems: "center",
  },
  "& .MuiTablePagination-selectIcon": {
    color: theme.palette.primary.main,
  },
  "& .MuiTablePagination-displayedRows": {
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
    color: theme.palette.secondary.main,
    height: "3.25rem",
    width: "3.25rem",
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
export const Pagination: React.FC<PaginationType> = (props: PaginationType) => {
  const { totalNumberOfItems, page, itemsPerPage, handleChangePage, handleItemsPerPageChange } = props

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

export const getAccessionIds = (
  objectType: string,
  metadataObjects?: Array<ObjectInsideFolderWithTags>
): Array<string> => {
  if (metadataObjects) {
    const submissions = metadataObjects.filter(obj => obj.schema.toLowerCase() === objectType)
    // SubmissionType Form: Add "- Title: " to accessionId, special case DAC form: add "- Main Contact:"
    // SubmissionType XML: Add "- File name: " to accessionId
    const accessionIds = submissions.map(obj => {
      const accessionId = obj.accessionId
      const displayTitle = obj.tags?.displayTitle || ""
      return obj.schema === ObjectTypes.dac
        ? `${accessionId} - Main Contact: ${displayTitle}`
        : obj.tags?.submissionType === ObjectSubmissionTypes.xml
        ? `${accessionId} - File name: ${displayTitle}`
        : `${accessionId} - Title: ${displayTitle}`
    })
    return accessionIds
  }
  return []
}

export const getOrigObjectType = (schema: string): string => {
  const objectType = schema.slice(schema.indexOf("-") + 1)
  return objectType
}

// Create localized path
// Using useSelector hook causes rendering errors and local storage is used instead
export const pathWithLocale = (path: string): string => {
  const locale = localStorage.getItem("locale") || Locale.defaultLocale

  return `/${locale}/${path}`
}

// Get unique "fileTypes" from Run form or Analysis form
export const getNewUniqueFileTypes = (
  objectAccessionId: string | null,
  formData: FormDataFiles
): { accessionId: string; fileTypes: string[] } | null => {
  if (formData.files?.length > 0 && objectAccessionId) {
    // Get unique fileTypes from current objectType and Add the new unique types fileTypes state in Redux
    const fileTypes = uniq(formData.files.map((file: { filetype: string }) => file.filetype))
    const objectWithFileTypes = { accessionId: objectAccessionId, fileTypes }
    return objectWithFileTypes
  }
  return null
}

// Convert Unix timestamp to Date
export const getConvertedDate = (timestamp: number): string => {
  const convertedDate = !isNaN(timestamp) ? moment.unix(timestamp).format("DD MMM, YYYY") : ""
  return convertedDate
}
