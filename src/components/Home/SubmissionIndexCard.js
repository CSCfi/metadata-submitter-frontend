//@flow
import React from "react"

import Button from "@material-ui/core/Button"
import Card from "@material-ui/core/Card"
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import CardHeader from "@material-ui/core/CardHeader"
import Grid from "@material-ui/core/Grid"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles } from "@material-ui/core/styles"
import FolderIcon from "@material-ui/icons/Folder"
import FolderOpenIcon from "@material-ui/icons/FolderOpen"

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
    "&:hover": {
      cursor: "pointer",
    },
  },
  cardContent: {
    flexGrow: 1,
    padding: 0,
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
}))

type ObjectInFolder = {
  accessionId: string,
  schema: string,
}

type Folder = {
  folderId: string,
  name: string,
  description: string,
  published: boolean,
  drafts: Array<ObjectInFolder>,
  metadataObjects: Array<ObjectInFolder>,
}

type SubmissionIndexCardProps = {
  folderType: string,
  folders: Array<Folder>,
  buttonTitle: string,
  onClickHeader?: () => void,
  onClickContent: (folderId: string, folderType: string) => Promise<void>,
  onClickButton: () => void,
}

const SubmissionIndexCard = (props: SubmissionIndexCardProps) => {
  const classes = useStyles()
  const { folderType, folders, buttonTitle, onClickHeader, onClickContent, onClickButton } = props

  return (
    <Card className={classes.card} variant="outlined">
      <CardHeader
        title={folderType === "published" ? "Your Published Submissions" : "Your Draft Submissions"}
        titleTypographyProps={{ variant: "subtitle1", fontWeight: "fontWeightBold" }}
        className={classes.cardTitle}
        onClick={onClickHeader}
      />
      <CardContent className={classes.cardContent}>
        <List>
          {folders.map((folder, index) => {
            return (
              <ListItem
                button
                key={index}
                dense
                className={classes.submissionsListItems}
                onClick={() => onClickContent(folder.folderId, folderType)}
              >
                <ListItemIcon className={classes.submissionsListIcon}>
                  {folderType === "published" ? <FolderIcon color="primary" /> : <FolderOpenIcon color="primary" />}
                </ListItemIcon>
                <ListItemText primary={folder.name} />
              </ListItem>
            )
          })}
        </List>
      </CardContent>
      <CardActions>
        {folders.length > 0 && (
          <Grid container alignItems="flex-start" justify="flex-end" direction="row">
            <Button variant="outlined" color="primary" aria-label="Open or Close folders list" onClick={onClickButton}>
              {buttonTitle}
            </Button>
          </Grid>
        )}
      </CardActions>
    </Card>
  )
}

export default SubmissionIndexCard
