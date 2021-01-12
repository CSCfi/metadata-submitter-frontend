//@flow
import React, { useEffect, useState } from "react"

import Button from "@material-ui/core/Button"
import Card from "@material-ui/core/Card"
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import CardHeader from "@material-ui/core/CardHeader"
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
}))

type SubmissionIndexCardProps = {
  title: string,
  folderType: string,
  folderTitles: Array<string>,
}

const SubmissionIndexCard = (props: SubmissionIndexCardProps) => {
  const classes = useStyles()
  const { title, folderType, folderTitles } = props

  return (
    <Card className={classes.card} variant="outlined">
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: "subtitle1", fontWeight: "fontWeightBold" }}
        className={classes.cardTitle}
      />
      <CardContent className={classes.cardContent}>
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
        <Grid container alignItems="flex-start" justify="flex-end" direction="row">
          <Button variant="outlined" color="primary">
            See all
          </Button>
        </Grid>
      </CardActions>
    </Card>
  )
}

const Home = () => {
  const dispatch = useDispatch()
  const user = useSelector(state => state.user)
  const folderIds = user.folders
  const classes = useStyles()
  const [unpublishedFolders, setUnpublishedFolders] = useState([])
  const [publishedFolders, setPublisedFolders] = useState([])

  const draftCard = [
    {
      title: "Your Draft Submissions",
      folderType: "draft",
      submissions: unpublishedFolders,
    },
  ]
  const publishedCard = [
    {
      title: "Your Published Submissions",
      folderType: "published",
      submissions: publishedFolders,
    },
  ]

  useEffect(() => {
    dispatch(fetchUserById("current"))
  }, [])

  useEffect(() => {
    if (folderIds) {
      const fetchFolders = async () => {
        const unpublishedArray = []
        const publishedArray = []

        for (let i = 0; i < folderIds.length; i += 1) {
          const response = await folderAPIService.getFolderById(folderIds[i])
          if (response.ok && response.data.published) {
            publishedArray.push(response.data.name)
          } else if (response.ok && !response.data.published) {
            unpublishedArray.push(response.data.name)
          }
        }
        setUnpublishedFolders(unpublishedArray)
        setPublisedFolders(publishedArray)
      }
      fetchFolders()
    }
  }, [folderIds?.length])

  return (
    <Grid container direction="column" justify="space-between" alignItems="stretch">
      <Grid item xs={12} className={classes.loggedUser}>
        Logged in as: {user.name}
      </Grid>
      {draftCard.map(card => {
        return (
          <Grid item xs={12} key={card.title} className={classes.tableCard}>
            <SubmissionIndexCard
              title={card.title}
              folderType={card.folderType}
              folderTitles={card.submissions.slice(0, 5)}
              key={card.title}
            />
          </Grid>
        )
      })}
      <Divider variant="middle" />
      {publishedCard.map(card => {
        return (
          <Grid item xs={12} key={card.title} className={classes.tableCard}>
            <SubmissionIndexCard
              title={card.title}
              folderType={card.folderType}
              folderTitles={card.submissions.slice(0, 5)}
              key={card.title}
            />
          </Grid>
        )
      })}
    </Grid>
  )
}

export default Home
