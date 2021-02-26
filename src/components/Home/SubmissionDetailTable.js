//@flow
import * as React from "react"

import Button from "@material-ui/core/Button"
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
import Typography from "@material-ui/core/Typography"
import FolderIcon from "@material-ui/icons/Folder"
import FolderOpenIcon from "@material-ui/icons/FolderOpen"
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace"

import { FolderSubmissionStatus } from "constants/folder"
import type { ObjectDetails } from "types"

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
  bodyRows: Array<ObjectDetails>,
  folderType: string,
  onClickCardHeader: () => void,
  onDelete: (objectId: string, objectType: string, objectStatus: string) => void,
}

const SubmissionDetailTable = (props: SubmissionDetailTableProps): React.Node => {
  const classes = useStyles()
  const { bodyRows, folderTitle, folderType, onClickCardHeader, onDelete } = props

  const getDateFormat = (date: string) => {
    const d = new Date(date)
    const day = d.getDate()
    const month = d.getMonth() + 1
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  }

  // Renders when current folder has the object(s)
  const CurrentFolder = () => (
    <CardContent>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan={8} padding="none">
                <ListItem dense className={classes.tableHeader}>
                  <ListItemIcon className={classes.tableIcon}>
                    {folderType === FolderSubmissionStatus.published ? (
                      <FolderIcon color="primary" />
                    ) : (
                      <FolderOpenIcon color="primary" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={folderTitle} />
                  <Button
                    color="secondary"
                    disabled={folderType === FolderSubmissionStatus.published}
                    aria-label="Edit current folder"
                  >
                    Edit
                  </Button>
                  <Button
                    disabled={folderType === FolderSubmissionStatus.published}
                    aria-label="Publish current folder"
                    variant="contained"
                  >
                    Publish
                  </Button>
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
            {bodyRows?.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {row.title}
                </TableCell>
                <TableCell className={classes.objectType}>{row.objectType}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{getDateFormat(row.lastModified)}</TableCell>
                <TableCell>
                  <Button>View</Button>
                </TableCell>
                <TableCell>
                  <Button disabled={folderType === FolderSubmissionStatus.published} aria-label="Edit this object">
                    Edit
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    disabled={folderType === FolderSubmissionStatus.published}
                    aria-label="Delete this object"
                    onClick={() => onDelete(row.accessionId, row.objectType, row.status)}
                  >
                    Delete
                  </Button>
                </TableCell>
                <TableCell>
                  <Button>Show details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  )

  // Renders when current folder is empty
  const EmptyFolder = () => (
    <CardContent>
      <Typography align="center" variant="body2">
        Current folder is empty
      </Typography>
    </CardContent>
  )

  return (
    <Card className={classes.card} variant="outlined">
      <CardHeader
        className={classes.cardHeader}
        avatar={<KeyboardBackspaceIcon className={classes.backIcon} />}
        title={`Your ${folderType} submissions`}
        titleTypographyProps={{ variant: "subtitle1", fontWeight: "fontWeightBold" }}
        onClick={onClickCardHeader}
      />
      {bodyRows?.length > 0 ? <CurrentFolder /> : <EmptyFolder />}
    </Card>
  )
}

export default SubmissionDetailTable
