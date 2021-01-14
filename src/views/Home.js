//@flow
import React, { useEffect, useState } from "react"

import Button from "@material-ui/core/Button"
import Card from "@material-ui/core/Card"
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import CardHeader from "@material-ui/core/CardHeader"
import CircularProgress from "@material-ui/core/CircularProgress"
import Collapse from "@material-ui/core/Collapse"
import Divider from "@material-ui/core/Divider"
import Grid from "@material-ui/core/Grid"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles } from "@material-ui/core/styles"
import FolderIcon from "@material-ui/icons/Folder"
import FolderOpenIcon from "@material-ui/icons/FolderOpen"
import { useDispatch, useSelector } from "react-redux"

import WizardStatusMessageHandler from "components/NewDraftWizard/WizardForms/WizardStatusMessageHandler"
import { setPublishedFolders } from "features/publishedFoldersSlice"
import { setUnpublishedFolders } from "features/unpublishedFoldersSlice"
import { fetchUserById } from "features/userSlice"
import folderAPIService from "services/folderAPI"

const useStyles = makeStyles(theme => ({
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
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
  tableCard: {
    margin: theme.spacing(1, 0),
  },
  submissionsListItems: {
    border: "solid 1px #ccc",
    borderRadius: 3,
    margin: theme.spacing(1, 0),
    boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
    alignItems: "flex-start",
  },
  submissionsListIcon: {
    minWidth: 35,
  },
  loggedUser: {
    margin: theme.spacing(2, 0, 0),
  },
  circularProgress: {
    margin: theme.spacing(10, "auto"),
  },
}))

type SubmissionIndexCardProps = {
  folderType: string,
  folderTitles: Array<string>,
  buttonTitle: string,
  onClickHeader: () => void,
  onClickContent: () => void,
  onClickButton: () => void,
}

const SubmissionIndexCard = (props: SubmissionIndexCardProps) => {
  const classes = useStyles()
  const { folderType, folderTitles, buttonTitle, onClickHeader, onClickContent, onClickButton } = props

  return (
    <Card className={classes.card} variant="outlined">
      <CardHeader
        title={folderType === "published" ? "Your Published Submissions" : "Your Draft Submissions"}
        titleTypographyProps={{ variant: "subtitle1", fontWeight: "fontWeightBold" }}
        className={classes.cardTitle}
        onClick={onClickHeader}
      />
      <CardContent className={classes.cardContent} onClick={onClickContent}>
        <List>
          {folderTitles.map((folderTitle, index) => {
            return (
              <ListItem button key={index} dense className={classes.submissionsListItems}>
                <ListItemIcon className={classes.submissionsListIcon}>
                  {folderType === "published" ? <FolderIcon color="primary" /> : <FolderOpenIcon color="primary" />}
                </ListItemIcon>
                <ListItemText primary={folderTitle} />
              </ListItem>
            )
          })}
        </List>
      </CardContent>
      <CardActions>
        {folderTitles.length > 0 && (
          <Grid container alignItems="flex-start" justify="flex-end" direction="row">
            <Button variant="outlined" color="primary" onClick={onClickButton}>
              {buttonTitle}
            </Button>
          </Grid>
        )}
      </CardActions>
    </Card>
  )
}

const Home = () => {
  const dispatch = useDispatch()
  const user = useSelector(state => state.user)
  const folderIds = user.folders
  const unpublishedFolders = useSelector(state => state.unpublishedFolders)
  const publishedFolders = useSelector(state => state.publishedFolders)

  const classes = useStyles()

  const [isFetchingFolders, setFetchingFolders] = useState(true)
  const [openAllUnpublished, setOpenAllUnpublished] = useState(false)
  const [openAllPublished, setOpenAllPublished] = useState(false)

  const [connError, setConnError] = useState(false)
  const [responseError, setResponseError] = useState({})
  const [errorPrefix, setErrorPrefix] = useState("")

  useEffect(() => {
    dispatch(fetchUserById("current"))
  }, [])

  useEffect(() => {
    if (folderIds) {
      const unpublishedArr = []
      const publishedArr = []
      const fetchFolders = async () => {
        for (let i = 0; i < folderIds.length; i += 1) {
          const response = await folderAPIService.getFolderById(folderIds[i])
          if (response.ok) {
            response.data.published ? publishedArr.push(response.data.name) : unpublishedArr.push(response.data.name)
          } else {
            setConnError(true)
            setResponseError(response)
            setErrorPrefix("Fetching folders error.")
          }
        }
        dispatch(setUnpublishedFolders(unpublishedArr))
        dispatch(setPublishedFolders(publishedArr))
        setFetchingFolders(false)
      }
      fetchFolders()
    }
  }, [folderIds?.length])

  // Contains both unpublished and published folders (max. 5 items/each)
  const overviewSubmissions = !isFetchingFolders && !openAllUnpublished && !openAllPublished && (
    <>
      <Grid item xs={12} className={classes.tableCard}>
        <SubmissionIndexCard
          folderType="unpublished"
          folderTitles={unpublishedFolders.slice(0, 5)}
          buttonTitle="See all"
          onClickHeader={() => {}}
          onClickContent={() => {}}
          onClickButton={() => setOpenAllUnpublished(true)}
        />
      </Grid>
      <Divider variant="middle" />
      <Grid item xs={12} className={classes.tableCard}>
        <SubmissionIndexCard
          folderType="published"
          folderTitles={publishedFolders.slice(0, 5)}
          buttonTitle="See all"
          onClickHeader={() => {}}
          onClickContent={() => {}}
          onClickButton={() => setOpenAllPublished(true)}
        />
      </Grid>
    </>
  )

  // Full list of unpublished folders
  const allUnpublishedSubmissions = (
    <Collapse in={openAllUnpublished} collapsedHeight={0} timeout={{ enter: 1500 }}>
      <SubmissionIndexCard
        folderType="unpublished"
        folderTitles={unpublishedFolders}
        buttonTitle="Close"
        onClickHeader={() => {}}
        onClickContent={() => {}}
        onClickButton={() => setOpenAllUnpublished(false)}
      />
    </Collapse>
  )

  // Full list of published folders
  const allPublishedSubmissions = (
    <Collapse in={openAllPublished} collapsedHeight={0} timeout={{ enter: 1500 }}>
      <SubmissionIndexCard
        folderType="publishedCard"
        folderTitles={publishedFolders}
        buttonTitle="Close"
        onClickHeader={() => {}}
        onClickContent={() => {}}
        onClickButton={() => setOpenAllPublished(false)}
      />
    </Collapse>
  )

  return (
    <Grid container direction="column" justify="space-between" alignItems="stretch">
      <Grid item xs={12} className={classes.loggedUser}>
        Logged in as: {user.name}
      </Grid>

      {isFetchingFolders && <CircularProgress className={classes.circularProgress} size={50} thickness={2.5} />}
      {overviewSubmissions}
      {allUnpublishedSubmissions}
      {allPublishedSubmissions}

      {connError && (
        <WizardStatusMessageHandler successStatus="error" response={responseError} prefixText={errorPrefix} />
      )}
    </Grid>
  )
}

export default Home
