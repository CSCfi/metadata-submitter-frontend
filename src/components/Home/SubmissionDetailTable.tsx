import React, { useEffect } from "react"

import FolderIcon from "@mui/icons-material/Folder"
import FolderOpenIcon from "@mui/icons-material/FolderOpen"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardActions from "@mui/material/CardActions"
import CardContent from "@mui/material/CardContent"
import CardHeader from "@mui/material/CardHeader"
import Collapse from "@mui/material/Collapse"
import Link from "@mui/material/Link"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { makeStyles, withStyles } from "@mui/styles"
import { Link as RouterLink } from "react-router-dom"

import WizardObjectDetails from "components/NewDraftWizard/WizardComponents/WizardObjectDetails"
import { FolderSubmissionStatus } from "constants/wizardFolder"
import { ObjectSubmissionTypes, DisplayObjectTypes, ObjectStatus } from "constants/wizardObject"
import { addRow, removeRow, resetRows } from "features/openedRowsSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import type { ObjectDetails } from "types"
import { pathWithLocale } from "utils"

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
  folderTitle: string
  bodyRows: Array<ObjectDetails>
  folderType: string
  location: string
  onEditFolder: (step: number) => any
  onPublishFolder: () => any
  onEditObject: (objectId: string, objectType: string, objectStatus: string, submissionType: string) => Promise<any>
  onDeleteObject: (objectId: string, objectType: string, objectStatus: string) => Promise<any>
}

type RowProps = {
  index: number
  row: any
  publishedFolder: boolean
  onEdit: (objectId: string, objectType: string, objectStatus: string, submissionType: string) => Promise<any>
  onDelete: (objectId: string, objectType: string, objectStatus: string) => Promise<any>
}

const Row = (props: RowProps) => {
  const dispatch = useAppDispatch()
  const openedRows = useAppSelector(state => state.openedRows) || []
  const { index, row, publishedFolder, onEdit, onDelete } = props

  const getDateFormat = (date: string) => {
    const d = new Date(date)
    const day = d.getDate()
    const month = d.getMonth() + 1
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  }

  const rowOpen = openedRows.indexOf(index) > -1

  const showObjectDetails = () => {
    !rowOpen ? dispatch(addRow(index)) : dispatch(removeRow(index))
  }

  const displayObjectType = Object.keys(DisplayObjectTypes).find(objectType => objectType === row.objectType)

  return (
    <React.Fragment>
      <TableRow data-testid={row.title}>
        <TableCell component="th" scope="row">
          {row.title}
        </TableCell>
        <TableCell>{displayObjectType}</TableCell>
        <TableCell>{row.status}</TableCell>
        <TableCell>{getDateFormat(row.lastModified)}</TableCell>
        <TableCell>
          <Button disabled>View</Button>
        </TableCell>
        {!publishedFolder && (
          <>
            <TableCell>
              <Button
                disabled={row.folderType === FolderSubmissionStatus.published}
                aria-label="Edit this object"
                data-testid="edit-object"
                onClick={() => onEdit(row.accessionId, row.objectType, row.status, row.submissionType)}
              >
                {row.submissionType === ObjectSubmissionTypes.xml ? "Replace" : "Edit"}
              </Button>
            </TableCell>
            <TableCell>
              <Button
                disabled={row.folderType === FolderSubmissionStatus.published}
                aria-label="Delete this object"
                data-testid="delete-object"
                onClick={() => onDelete(row.accessionId, row.objectType, row.status)}
              >
                Delete
              </Button>
            </TableCell>
          </>
        )}

        <TableCell>
          <Button aria-label="Show object details" data-testid="toggle-details" onClick={() => showObjectDetails()}>
            {rowOpen ? "Hide details" : "Show details"}
          </Button>
        </TableCell>
      </TableRow>
      {rowOpen && (
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
            <Collapse in={rowOpen} timeout="auto" unmountOnExit>
              <WizardObjectDetails objectType={row.objectType} objectData={row.objectData}></WizardObjectDetails>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  )
}

const SubmissionDetailTable: React.FC<any> = (props: SubmissionDetailTableProps) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()

  const { folderTitle, bodyRows, folderType, location, onEditFolder, onPublishFolder, onEditObject, onDeleteObject } =
    props

  const hasSubmittedObject = bodyRows.find(row => row.status === ObjectStatus.submitted)

  const publishedFolder = folderType === FolderSubmissionStatus.published

  // Reset opened rows
  useEffect(() => {
    return function cleanup() {
      dispatch(resetRows())
    }
  }, [dispatch])

  const CurrentFolder = () => (
    <CardContent>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan={publishedFolder ? 6 : 8} padding="none">
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
                      disabled={!hasSubmittedObject}
                      aria-label="Publish current folder"
                      variant="contained"
                      data-testid="publish-button"
                      onClick={() => onPublishFolder()}
                    >
                      Publish
                    </Button>
                  )}
                  {!hasSubmittedObject && (
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
              {headRows.slice(0, publishedFolder ? 6 : headRows.length).map((row, index) => (
                <TableCell key={index} className={classes.headRows}>
                  {row}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {bodyRows?.map((row, index) => (
              <Row
                key={index}
                index={index}
                row={row}
                publishedFolder={publishedFolder}
                onEdit={onEditObject}
                onDelete={onDeleteObject}
              ></Row>
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
      <Link component={RouterLink} to={`${pathWithLocale("home")}/${location}`} className={classes.headerLink}>
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
