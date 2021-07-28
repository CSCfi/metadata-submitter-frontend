//@flow
import React from "react"

import Button from "@material-ui/core/Button"
import Card from "@material-ui/core/Card"
import CardActions from "@material-ui/core/CardActions"
import CardContent from "@material-ui/core/CardContent"
import CardHeader from "@material-ui/core/CardHeader"
import Grid from "@material-ui/core/Grid"
import Link from "@material-ui/core/Link"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles } from "@material-ui/core/styles"
import TablePagination from "@material-ui/core/TablePagination"
import Typography from "@material-ui/core/Typography"
import FolderIcon from "@material-ui/icons/Folder"
import FolderOpenIcon from "@material-ui/icons/FolderOpen"
import { Link as RouterLink } from "react-router-dom"

import { FolderSubmissionStatus } from "constants/wizardFolder"
import type { FolderDetailsWithId } from "types"

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
  },
  cardContent: {
    flexGrow: 1,
    padding: 0,
  },
  submissionsListItems: {
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: 3,
    margin: theme.spacing(1, 0),
    boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
    alignItems: "flex-start",
    color: theme.palette.font.main,
  },
  submissionsListIcon: {
    minWidth: 35,
  },
}))

type SubmissionIndexCardProps = {
  folderType: string,
  folders: Array<FolderDetailsWithId>,
  location?: string,
  displayButton?: boolean,
  rowsPerPage: number,
  page: number,
  fetchItemsPerPage: (items: number, folderType: string) => Promise<void>,
  fetchPageOnChange: (page: number, folderType: string) => Promise<void>,
}

const SubmissionIndexCard = (props: SubmissionIndexCardProps): React$Element<typeof Card> => {
  const classes = useStyles()
  const {
    folderType,
    folders,
    location = "",
    displayButton,
    fetchItemsPerPage,
    fetchPageOnChange,
    page,
    rowsPerPage,
  } = props

  const handleChangePage = (e: any, page: number) => {
    fetchPageOnChange(page, folderType)
  }

  const handleItemsPerPageChange = (e: any) => {
    fetchItemsPerPage(e.target.value, folderType)
  }

  const Pagination = () => (
    <TablePagination
      rowsPerPageOptions={[20, 60, 100]}
      count={623}
      rowsPerPage={rowsPerPage}
      page={page}
      labelRowsPerPage="Items per page"
      onChangePage={handleChangePage}
      onChangeRowsPerPage={handleItemsPerPageChange}
    />
  )
  // Renders when there is folder list
  const FolderList = () => (
    <>
      <CardContent className={classes.cardContent}>
        <List>
          {folders.map((folder, index) => {
            return (
              <Link key={index} component={RouterLink} to={`/home/${location}/${folder.folderId}`} underline="none">
                <ListItem button dense className={classes.submissionsListItems}>
                  <ListItemIcon className={classes.submissionsListIcon}>
                    {folderType === FolderSubmissionStatus.published ? (
                      <FolderIcon color="primary" />
                    ) : (
                      <FolderOpenIcon color="primary" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary={folder.name} />
                </ListItem>
              </Link>
            )
          })}
        </List>
        {!displayButton && <Pagination />}
      </CardContent>
      {displayButton && (
        <CardActions>
          <Grid container alignItems="flex-start" justify="flex-end" direction="row">
            <Link component={RouterLink} to={`/home/${location}`}>
              <Button variant="outlined" color="primary" aria-label="Open or Close folders list">
                View all
              </Button>
            </Link>
          </Grid>
        </CardActions>
      )}
    </>
  )

  // Renders when there is no folders in the list
  const EmptyList = () => (
    <CardContent className={classes.cardContent}>
      <Typography align="center" variant="body2">
        Currently there are no {folderType} submissions
      </Typography>
    </CardContent>
  )

  return (
    <Card className={classes.card} variant="outlined">
      <CardHeader
        title={
          folderType === FolderSubmissionStatus.published ? "Your Published Submissions" : "Your Draft Submissions"
        }
        titleTypographyProps={{ variant: "subtitle1", fontWeight: "fontWeightBold" }}
        className={classes.cardTitle}
      />
      {folders.length > 0 ? <FolderList /> : <EmptyList />}
    </Card>
  )
}

export default SubmissionIndexCard
