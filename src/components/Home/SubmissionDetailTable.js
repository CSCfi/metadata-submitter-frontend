//@flow
import React, { useState } from "react"

import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import Card from "@material-ui/core/Card"
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
import { useDispatch } from "react-redux"
import { useHistory, Link as RouterLink } from "react-router-dom"

import WizardAlert from "../NewDraftWizard/WizardComponents/WizardAlert"
import WizardStatusMessageHandler from "../NewDraftWizard/WizardForms/WizardStatusMessageHandler"

import { FolderSubmissionStatus } from "constants/wizardFolder"
import { WizardStatus } from "constants/wizardStatus"
import { addDraftsToUser } from "features/userSlice"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { publishFolderContent, setFolder, resetFolder } from "features/wizardSubmissionFolderSlice"
import type { ObjectDetails, ObjectInsideFolderWithTags } from "types"

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
  objectType: {
    "&:first-letter": {
      textTransform: "capitalize",
    },
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
  folderData: any,
  folderTitle: string,
  bodyRows: Array<ObjectDetails>,
  folderType: string,
  location: string,
  onDelete: (objectId: string, objectType: string, objectStatus: string) => Promise<any>,
}

const SubmissionDetailTable = (props: SubmissionDetailTableProps): React$Element<any> => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { folderData, folderTitle, bodyRows, folderType, location, onDelete } = props
  const getDateFormat = (date: string) => {
    const d = new Date(date)
    const day = d.getDate()
    const month = d.getMonth() + 1
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  }
  const folderPublishable = bodyRows.find(row => row.status === "Submitted")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [connError, setConnError] = useState(false)
  const [responseError, setResponseError] = useState({})
  const [errorPrefix, setErrorPrefix] = useState("")

  let history = useHistory()

  const editFolder = () => {
    dispatch(setFolder(folderData))
    history.push("/newdraft?step=0")
  }

  const publishFolder = () => {
    dispatch(setFolder(folderData))
    setDialogOpen(true)
  }

  const resetDispatch = () => {
    history.push("/home")
    dispatch(resetObjectType())
    dispatch(resetFolder())
  }

  const handlePublish = (confirm, formData?: Array<ObjectInsideFolderWithTags>) => {
    if (confirm) {
      dispatch(publishFolderContent(folderData))
        .then(() => resetDispatch())
        .catch(error => {
          setConnError(true)
          setResponseError(JSON.parse(error))
          setErrorPrefix(`Couldn't publish folder with id ${folderData.folderId}`)
        })

      formData && formData?.length > 0
        ? dispatch(addDraftsToUser("current", formData)).catch(error => {
            setConnError(true)
            setResponseError(JSON.parse(error))
            setErrorPrefix("Can't save drafts for user")
          })
        : null
    } else {
      setDialogOpen(false)
    }
  }

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
                      onClick={() => editFolder()}
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
                      onClick={() => publishFolder()}
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
                {folderType === FolderSubmissionStatus.unpublished && (
                  <TableCell>
                    <Button
                      aria-label="Delete this object"
                      onClick={() => onDelete(row.accessionId, row.objectType, row.status)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                )}
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

  const EmptyFolder = () => (
    <CardContent>
      <Typography align="center" variant="body2">
        Current folder is empty
      </Typography>
    </CardContent>
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

      {dialogOpen && <WizardAlert onAlert={handlePublish} parentLocation="footer" alertType={"publish"}></WizardAlert>}
      {connError && (
        <WizardStatusMessageHandler
          successStatus={WizardStatus.error}
          response={responseError}
          prefixText={errorPrefix}
        />
      )}
    </Card>
  )
}

export default SubmissionDetailTable
