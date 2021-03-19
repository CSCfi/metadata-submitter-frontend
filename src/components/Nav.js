//@flow
import React from "react"

import AppBar from "@material-ui/core/AppBar"
import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import Link from "@material-ui/core/Link"
import { makeStyles } from "@material-ui/core/styles"
import Toolbar from "@material-ui/core/Toolbar"
import Typography from "@material-ui/core/Typography"
import HomeIcon from "@material-ui/icons/Home"
import { useDispatch } from "react-redux"
import { Link as RouterLink, useLocation } from "react-router-dom"

import logo from "../csc_logo.svg"

import { resetUser } from "features/userSlice"

const useStyles = makeStyles(theme => ({
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.default,
  },
  logo: {
    height: "auto",
    maxHeight: "2.5rem",
    maxWidth: "100%",
  },
  brandLink: {
    padding: theme.spacing(0.5, 0.75),
  },
  link: {
    margin: theme.spacing(1, 1.5),
    color: "inherit",
  },
  linkButton: {
    margin: theme.spacing(1, 1.5),
  },
  toolbar: {
    flexWrap: "wrap",
  },
  title: {
    flexGrow: 1,
  },
}))

const Menu = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  let location = useLocation()
  if (location.pathname === "/") {
    return null
  }

  return (
    <nav className={classes.nav}>
      <IconButton
        component={RouterLink}
        to="/home"
        className={classes.HomeIcon}
        aria-label="go to frontpage"
        color="inherit"
      >
        <HomeIcon />
      </IconButton>
      <Link component={RouterLink} to="/home/drafts" className={classes.link}>
        Open submissions
      </Link>
      <Link component={RouterLink} to="/home/published" className={classes.link}>
        Submissions
      </Link>
      <Link component={RouterLink} aria-label="Create Submission" to="/newdraft">
        <Button color="primary" variant="contained" className={classes.linkButton}>
          Create Submission
        </Button>
      </Link>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => {
          dispatch(resetUser())
        }}
        href="/logout"
      >
        Log out
      </Button>
    </nav>
  )
}

const Nav = (): React$Element<typeof AppBar> => {
  const classes = useStyles()
  return (
    <AppBar className={classes.appBar} elevation={1}>
      <Toolbar className={classes.toolbar}>
        <Link to="/home" component={RouterLink} className={classes.brandLink}>
          <img className={classes.logo} src={logo} alt="CSC" />
        </Link>
        <Typography variant="h6" noWrap className={classes.title}>
          Metadata Submitter
        </Typography>
        <Menu />
      </Toolbar>
    </AppBar>
  )
}

export default Nav
