//@flow
import React from "react"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import Button from "@material-ui/core/Button"
import Link from "@material-ui/core/Link"
import IconButton from "@material-ui/core/IconButton"
import HomeIcon from "@material-ui/icons/Home"
import { makeStyles } from "@material-ui/core/styles"
import { Link as RouterLink } from "react-router-dom"

const useStyles = makeStyles(theme => ({
  appBar: {
    position: "relative",
    borderBottom: `1px solid ${theme.palette.divider}`,
    alignItems: "flex-end",
    color: theme.palette.text.primary,
    backgroundColor: "white",
  },
  link: {
    margin: theme.spacing(1, 1.5),
    color: "inherit",
  },
  linkButton: {
    margin: theme.spacing(1, 1.5),
  },
}))

const Nav = () => {
  const classes = useStyles()
  return (
    <AppBar className={classes.appBar} elevation={1}>
      <Toolbar>
        <IconButton
          component={RouterLink}
          to="/"
          className={classes.HomeIcon}
          aria-label="go to frontpage"
          color="inherit"
        >
          <HomeIcon />
        </IconButton>
        <nav className={classes.nav}>
          <Link href="#" className={classes.link}>
            Open submissions
          </Link>
          <Link href="#" className={classes.link}>
            Submissions
          </Link>
          <Link
            component={RouterLink}
            aria-label="Create new draft"
            to="/newdraft"
          >
            <Button
              color="primary"
              variant="contained"
              className={classes.linkButton}
            >
              Create new draft
            </Button>
          </Link>
        </nav>
      </Toolbar>
    </AppBar>
  )
}

export default Nav
