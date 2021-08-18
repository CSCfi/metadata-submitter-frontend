//@flow
import React from "react"

import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import Card from "@material-ui/core/Card"
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import CardHeader from "@material-ui/core/CardHeader"
import Link from "@material-ui/core/Link"
import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import Paper from "@material-ui/core/Paper"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import Tooltip from "@material-ui/core/Tooltip"
import Typography from "@material-ui/core/Typography"
import FolderIcon from "@material-ui/icons/Folder"
import FolderOpenIcon from "@material-ui/icons/FolderOpen"
import HelpOutlineIcon from "@material-ui/icons/HelpOutline"
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace"
import { Link as RouterLink } from "react-router-dom"

import { FolderSubmissionStatus } from "constants/wizardFolder"
import { ObjectSubmissionTypes, DisplayObjectTypes } from "constants/wizardObject"
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
  cardActions: {
    display: "flex",
    justifyContent: "center",
  },
  headerLink: {
    color: theme.palette.common.black,
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
  tooltipContainer: {
    display: "flex",
  },
}))

const SubmissionTooltip = withStyles(theme => ({
  tooltip: theme.tooltip,
}))(Tooltip)

const headRows = ["Title", "Object type", "Status", "Last modified", "", "", "", ""]

type SubmissionDetailTableProps = {
  folderTitle: string,
  bodyRows: Array<ObjectDetails>,
  folderType: string,
  location: string,
  onEditFolder: (step: number) => any,
  onPublishFolder: () => any,
  onEditObject: (objectId: string, objectType: string, objectStatus: string, submissionType: string) => Promise<any>,
  onDeleteObject: (objectId: string, objectType: string, objectStatus: string) => Promise<any>,
}

const SubmissionDetailTable = (props: SubmissionDetailTableProps): React$Element<any> => {
  const classes = useStyles()

  const { folderTitle, bodyRows, folderType, location, onEditFolder, onPublishFolder, onEditObject, onDeleteObject } =
    props
  const getDateFormat = (date: string) => {
    const d = new Date(date)
    const day = d.getDate()
    const month = d.getMonth() + 1
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  }
  const folderPublishable = bodyRows.find(row => row.status === "Submitted")

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
                  {folderType === FolderSubmissionStatus.unpublished && (
                    <Button
                      color="secondary"
                      aria-label="Edit current folder"
                      data-testid="edit-button"
                      onClick={() => onEditFolder(0)}
                    >
                      Edit
                    </Button>
                  )}
                  {folderType === FolderSubmissionStatus.unpublished && (
                    <Button
                      disabled={!folderPublishable}
                      aria-label="Publish current folder"
                      variant="contained"
                      data-testid="publish-button"
                      onClick={() => onPublishFolder()}
                    >
                      Publish
                    </Button>
                  )}
                  {!folderPublishable && (
                    <Box pl={1} className={classes.tooltipContainer}>
                      <SubmissionTooltip title={"Publishing requires submitted object(s)."} placement="top" arrow>
                        <HelpOutlineIcon></HelpOutlineIcon>
                      </SubmissionTooltip>
                    </Box>
                  )}
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
              <TableRow key={index} data-testid={row.title}>
                <TableCell component="th" scope="row">
                  {row.title}
                </TableCell>
                <TableCell>{DisplayObjectTypes[row.objectType]}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{getDateFormat(row.lastModified)}</TableCell>
                <TableCell>
                  <Button disabled>View</Button>
                </TableCell>
                <TableCell>
                  <Button
                    disabled={folderType === FolderSubmissionStatus.published}
                    aria-label="Edit this object"
                    onClick={() => onEditObject(row.accessionId, row.objectType, row.status, row.submissionType)}
                  >
                    {row.submissionType === ObjectSubmissionTypes.xml ? "Replace" : "Edit"}
                  </Button>
                </TableCell>
                {folderType === FolderSubmissionStatus.unpublished && (
                  <TableCell>
                    <Button
                      aria-label="Delete this object"
                      onClick={() => onDeleteObject(row.accessionId, row.objectType, row.status)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                )}
                <TableCell>
                  <Button disabled>Show details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  )

  const EmptyFolder = () => (
    <>
      <CardContent>
        <Typography align="center" variant="body2">
          Current folder is empty
        </Typography>
      </CardContent>
      <CardActions className={classes.cardActions}>
        <Button
          color="primary"
          variant="contained"
          aria-label="Add objects to this folder"
          data-testid="add-objects-button"
          onClick={() => onEditFolder(1)}
        >
          Add objects to folder
        </Button>
      </CardActions>
    </>
  )

  return (
    <Card className={classes.card} variant="outlined">
      <Link component={RouterLink} to={`/home/${location}`} className={classes.headerLink}>
        <CardHeader
          className={classes.cardHeader}
          avatar={<KeyboardBackspaceIcon className={classes.backIcon} />}
          title={`Your ${folderType} submissions`}
          titleTypographyProps={{ variant: "subtitle1", fontWeight: "fontWeightBold" }}
        />
      </Link>

      {bodyRows?.length > 0 ? <CurrentFolder /> : <EmptyFolder />}
    </Card>
  )
}

export default SubmissionDetailTable
