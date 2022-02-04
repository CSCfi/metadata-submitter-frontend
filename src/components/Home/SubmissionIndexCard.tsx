import React from "react"

// import FolderIcon from "@mui/icons-material/Folder"
// import FolderOpenIcon from "@mui/icons-material/FolderOpen"
// import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardHeader from "@mui/material/CardHeader"
// import Link from "@mui/material/Link"
// import List from "@mui/material/List"
// import ListItem from "@mui/material/ListItem"
// import ListItemIcon from "@mui/material/ListItemIcon"
// import ListItemText from "@mui/material/ListItemText"
// import Paper from "@mui/material/Paper"
// import Table from "@mui/material/Table"
// import TableBody from "@mui/material/TableBody"
// import TableCell from "@mui/material/TableCell"
// import TableContainer from "@mui/material/TableContainer"
// import TableHead from "@mui/material/TableHead"
// import TableRow from "@mui/material/TableRow"
// import TextField from "@mui/material/TextField"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { makeStyles } from "@mui/styles"
import { DataGrid } from "@mui/x-data-grid"
// import { Link as RouterLink } from "react-router-dom"

// import { FolderSubmissionStatus } from "constants/wizardFolder"
import type { FolderDetailsWithId } from "types"
import { Pagination } from "utils"

const useStyles = makeStyles(theme => ({
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    border: "none",
    padding: theme.spacing(0),
  },
  cardTitle: {
    fontSize: "0.5em",
    padding: 0,
    marginTop: theme.spacing(1),
  },
  cardContent: {
    flexGrow: 1,
    padding: 0,
  },
  submissionsListItems: {
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: 3,
    margin: theme.spacing(1),
    boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
    alignItems: "flex-start",
    color: theme.palette.common.black,
  },
  submissionsListIcon: {
    minWidth: 35,
  },
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
}))

type SubmissionIndexCardProps = {
  folderType: string
  folders: Array<FolderDetailsWithId>
  rows: Array<any>
  location?: string
  page?: number
  itemsPerPage?: number
  totalItems?: number
  fetchItemsPerPage?: (items: number, submissionType: string) => Promise<void>
  fetchPageOnChange?: (page: number, submissionType: string) => Promise<void>
}
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
  },
  {
    field: "lastModified",
    headerName: "Last modified by",
    width: 250,
  },
  {
    field: "cscProject",
    headerName: "CSC Project",
    width: 250,
  },
]

const SubmissionIndexCard: React.FC<SubmissionIndexCardProps> = props => {
  const classes = useStyles()
  const {
    folderType,
    folders,
    // location = "",
    page,
    itemsPerPage,
    totalItems,
    fetchItemsPerPage,
    fetchPageOnChange,
    rows,
  } = props

  const handleChangePage = (_e: unknown, page: number) => {
    fetchPageOnChange ? fetchPageOnChange(page) : null
  }

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    fetchItemsPerPage ? fetchItemsPerPage(parseInt(e.target.value, 10)) : null
  }

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
      />
    </div>
  )

  // Renders when there is no folders in the list
  const EmptyList = () => (
    <CardContent className={classes.cardContent}>
      <Typography align="center" variant="body2">
        Currently there are no {folderType} submissions
      </Typography>
    </CardContent>
  )

  return (
    <Card className={classes.card} variant="outlined">
      <CardHeader
        // title={folderType === FolderSubmissionStatus.published ? "Published Submissions" : "Draft Submissions"}
        titleTypographyProps={{ variant: "subtitle1", fontWeight: "fontWeightBold" }}
        className={classes.cardTitle}
      />
      {/* <TextField sx={{ width: "12vw", alignItem: "right" }} /> */}
      {folders?.length > 0 ? <FolderList /> : <EmptyList />}
    </Card>
  )
}

export default SubmissionIndexCard
