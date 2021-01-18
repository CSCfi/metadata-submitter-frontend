//@flow
import React from "react"

import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardHeader from "@material-ui/core/CardHeader"
import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import Paper from "@material-ui/core/Paper"
import { makeStyles } from "@material-ui/core/styles"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import FolderIcon from "@material-ui/icons/Folder"
import FolderOpenIcon from "@material-ui/icons/FolderOpen"
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace"

const useStyles = makeStyles(theme => ({
  backIcon: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  card: {
    border: "none",
    padding: theme.spacing(0),
  },
  cardHeader: {
    fontSize: "0.5em",
    padding: 0,
    marginTop: theme.spacing(1),
    "&:hover": {
      cursor: "pointer",
    },
  },
  tableHeader: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  tableIcon: {
    minWidth: 35,
    minHeight: 35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.palette.common.white,
    marginRight: theme.spacing(1),
  },
  headRows: {
    fontWeight: "bold",
  },
  objectType: {
    "&:first-letter": {
      textTransform: "capitalize",
    },
  },
}))

const headRows = ["Title", "Object type", "Status", "Last modified", "", "", "", ""]

type SubmissionDetailTableProps = {
  folderTitle: string,
  bodyRows: Array<any>,
  folderType: string,
  onClickCardHeader: () => void,
}

const SubmissionDetailTable = (props: SubmissionDetailTableProps) => {
  const classes = useStyles()

  const getDateFormat = (date: string) => {
    const d = new Date(date)
    const day = d.getDate()
    const month = d.getMonth() + 1
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  }

  return (
    <Card className={classes.card} variant="outlined">
      <CardHeader
        className={classes.cardHeader}
        avatar={<KeyboardBackspaceIcon className={classes.backIcon} />}
        title={`Your ${props.folderType} submissions`}
        titleTypographyProps={{ variant: "subtitle1", fontWeight: "fontWeightBold" }}
        onClick={props.onClickCardHeader}
      />
      <CardContent>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="left" colSpan={8} padding="none">
                  <ListItem dense className={classes.tableHeader}>
                    <ListItemIcon className={classes.tableIcon}>
                      {props.folderType === "published" ? (
                        <FolderIcon color="primary" />
                      ) : (
                        <FolderOpenIcon color="primary" />
                      )}
                    </ListItemIcon>
                    <ListItemText primary={props.folderTitle} />
                  </ListItem>
                </TableCell>
              </TableRow>
              <TableRow>
                {headRows.map((row, index) => (
                  <TableCell key={index} className={classes.headRows}>
                    {row}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {props.bodyRows?.map((row, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {row.title}
                  </TableCell>
                  <TableCell className={classes.objectType}>{row.objectType}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{getDateFormat(row.lastModified)}</TableCell>
                  <TableCell>View</TableCell>
                  <TableCell>Edit</TableCell>
                  <TableCell>Delete</TableCell>
                  <TableCell>Show details</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default SubmissionDetailTable
