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
import { Link as RouterLink } from "react-router-dom"

import WizardObjectDetails from "components/SubmissionWizard/WizardComponents/WizardObjectDetails"
import { ObjectSubmissionTypes, DisplayObjectTypes, ObjectStatus } from "constants/wizardObject"
import { SubmissionStatus } from "constants/wizardSubmission"
import { addRow, removeRow, resetRows } from "features/openedRowsSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import type { OldSubmissionRow } from "types"
import { pathWithLocale } from "utils"

const headRows = ["Title", "Object type", "Status", "Last modified", "", "", "", ""]

type SubmissionDetailTableProps = {
  submissionTitle: string
  bodyRows: Array<OldSubmissionRow>
  submissionType: string
  location: string
  onEditSubmission: (step: number) => void
  onPublishSubmission: () => void
  onEditObject: (objectId: string, objectType: string, objectStatus: string, submissionType: string) => Promise<void>
  onDeleteObject: (objectId: string, objectType: string, objectStatus: string) => Promise<void>
}

type RowProps = {
  index: number
  row: OldSubmissionRow
  publishedSubmission: boolean
  onEdit: (objectId: string, objectType: string, objectStatus: string, submissionType: string) => Promise<void>
  onDelete: (objectId: string, objectType: string, objectStatus: string) => Promise<void>
}

const Row = (props: RowProps) => {
  const dispatch = useAppDispatch()
  const openedRows = useAppSelector(state => state.openedRows) || []
  const { index, row, publishedSubmission, onEdit, onDelete } = props

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
        {!publishedSubmission && (
          <>
            <TableCell>
              <Button
                disabled={row.submissionType === SubmissionStatus.published}
                aria-label="Edit this object"
                data-testid="edit-object"
                onClick={() => onEdit(row.accessionId, row.objectType, row.status, row.submissionType)}
              >
                {row.submissionType === ObjectSubmissionTypes.xml ? "Replace" : "Edit"}
              </Button>
            </TableCell>
            <TableCell>
              <Button
                disabled={row.submissionType === SubmissionStatus.published}
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

const SubmissionDetailTable: React.FC<SubmissionDetailTableProps> = props => {
  const dispatch = useAppDispatch()

  const {
    submissionTitle,
    bodyRows,
    submissionType,
    location,
    onEditSubmission,
    onPublishSubmission,
    onEditObject,
    onDeleteObject,
  } = props

  const hasSubmittedObject = bodyRows.find(row => row.status === ObjectStatus.submitted)

  const publishedSubmission = submissionType === SubmissionStatus.published

  // Reset opened rows
  useEffect(() => {
    return function cleanup() {
      dispatch(resetRows())
    }
  }, [dispatch])

  const CurrentSubmission = () => (
    <CardContent>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan={publishedSubmission ? 6 : 8} padding="none">
                <ListItem
                  dense
                  sx={{
                    p: 8,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 35,
                      minHeight: 35,
                      justifyContent: "center",
                      alignItems: "center",
                      bgcolor: "common.white",
                      mr: 8,
                    }}
                  >
                    {submissionType === SubmissionStatus.published ? (
                      <FolderIcon color="primary" />
                    ) : (
                      <FolderOpenIcon color="primary" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={submissionTitle} />
                  {submissionType === SubmissionStatus.unpublished && (
                    <Button
                      color="secondary"
                      aria-label="Edit current submission"
                      data-testid="edit-button"
                      onClick={() => onEditSubmission(0)}
                    >
                      Edit
                    </Button>
                  )}
                  {submissionType === SubmissionStatus.unpublished && (
                    <Button
                      disabled={!hasSubmittedObject}
                      aria-label="Publish current submission"
                      variant="contained"
                      data-testid="publish-button"
                      onClick={() => onPublishSubmission()}
                    >
                      Publish
                    </Button>
                  )}
                  {!hasSubmittedObject && (
                    <Box pl={1} display="flex">
                      <Tooltip title={"Publishing requires submitted object(s)."} placement="top" arrow>
                        <HelpOutlineIcon></HelpOutlineIcon>
                      </Tooltip>
                    </Box>
                  )}
                </ListItem>
              </TableCell>
            </TableRow>
            <TableRow>
              {headRows.slice(0, publishedSubmission ? 6 : headRows.length).map((row, index) => (
                <TableCell key={index} sx={{ fontWeight: "bold" }}>
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
                publishedSubmission={publishedSubmission}
                onEdit={onEditObject}
                onDelete={onDeleteObject}
              ></Row>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  )

  const EmptySubmission = () => (
    <>
      <CardContent>
        <Typography align="center" variant="body2">
          Current submission is empty
        </Typography>
      </CardContent>
      <CardActions sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          color="primary"
          variant="contained"
          aria-label="Add objects to this submission"
          data-testid="add-objects-button"
          onClick={() => onEditSubmission(1)}
        >
          Add objects to submission
        </Button>
      </CardActions>
    </>
  )

  return (
    <Card variant="outlined" sx={{ border: "none", padding: 0 }}>
      <Link component={RouterLink} to={`${pathWithLocale("home")}/${location}`} sx={{ color: "common.black" }}>
        <CardHeader
          avatar={
            <KeyboardBackspaceIcon
              sx={{
                "&:hover": {
                  cursor: "pointer",
                },
              }}
            />
          }
          title={`Your ${submissionType} submissions`}
          titleTypographyProps={{ variant: "subtitle1", fontWeight: "fontWeightBold" }}
          sx={{
            fontSize: "0.5em",
            p: 0,
            mt: 8,
            "&:hover": {
              cursor: "pointer",
            },
          }}
        />
      </Link>

      {bodyRows?.length > 0 ? <CurrentSubmission /> : <EmptySubmission />}
    </Card>
  )
}

export default SubmissionDetailTable
