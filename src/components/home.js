//@flow
import React from "react"
import Grid from "@material-ui/core/Grid"
import FolderIcon from "@material-ui/icons/Folder"
import FolderOpenIcon from "@material-ui/icons/FolderOpen"
import Card from "@material-ui/core/Card"
import CardActions from "@material-ui/core/CardActions"
import CardHeader from "@material-ui/core/CardHeader"
import CardContent from "@material-ui/core/CardContent"
import Button from "@material-ui/core/Button"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardContent: {
    flexGrow: 1,
  },
  tableCard: {
    margin: "10px 0",
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
    <Card className={classes.card}>
      <CardHeader title={title} />
      <CardContent className={classes.cardContent}>
        <List>
          {folderTitles.map(folderTitle => {
            return (
              <ListItem button key={folderTitle}>
                {folderType === "published" ? <FolderIcon color="primary" /> : <FolderOpenIcon color="primary" />}
                <ListItemText primary={folderTitle} />
              </ListItem>
            )
          })}
        </List>
      </CardContent>
      <CardActions>
        <Button variant="outlined" color="primary">
          See all
        </Button>
      </CardActions>
    </Card>
  )
}

const Home = () => {
  const classes = useStyles()
  const draftCard = [
    {
      title: "Your draft submissions",
      folderType: "draft",
      submissions: ["Title1", "Title2", "Title3", "Title4", "Title5"],
    },
  ]
  const publisheCard = [
    {
      title: "Your published submissions",
      folderType: "published",
      submissions: ["Published1", "Published2", "Published3", "Published4", "Published5"],
    },
  ]
  return (
    <Grid
      container
      direction="column"
      justify="space-between"
      alignItems="stretch"
    >
      {draftCard.map(card => {
        return (
          <Grid item xs={12} key={card.title} className={classes.tableCard}>
            <SubmissionIndexCard
              title={card.title}
              folderType={card.folderType}
              folderTitles={card.submissions}
              key={card.title}
            />
          </Grid>
        )
      })}
      {publisheCard.map(card => {
        return (
          <Grid item xs={12} key={card.title} className={classes.tableCard}>
            <SubmissionIndexCard
              title={card.title}
              folderType={card.folderType}
              folderTitles={card.submissions}
              key={card.title}
            />
          </Grid>
        )
      })}
    </Grid>
  )
}

export default Home
