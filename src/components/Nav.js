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
import { Link as RouterLink, useLocation } from "react-router-dom"

import logo from "../csc_logo.svg"

const useStyles = makeStyles(theme => ({
  appBar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    backgroundColor: "white",
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
  let location = useLocation()
  if (location.pathname === "/") {
    return null
  }
  return (
    <nav className={classes.nav}>
      <IconButton
        component={RouterLink}
        to="/"
        className={classes.HomeIcon}
        aria-label="go to frontpage"
        color="inherit"
      >
        <HomeIcon />
      </IconButton>
      <Link href="#" className={classes.link}>
        Open submissions
      </Link>
      <Link href="#" className={classes.link}>
        Submissions
      </Link>
      <Link component={RouterLink} aria-label="Create Submission" to="/newdraft">
        <Button color="primary" variant="contained" className={classes.linkButton}>
          Create Submission
        </Button>
      </Link>
    </nav>
  )
}

const Nav = () => {
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
