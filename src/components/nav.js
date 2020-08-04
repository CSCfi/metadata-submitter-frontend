//@flow
import React from "react"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import Button from "@material-ui/core/Button"
import Link from "@material-ui/core/Link"
import Typography from '@material-ui/core/Typography';
import IconButton from "@material-ui/core/IconButton"
import HomeIcon from "@material-ui/icons/Home"
import { makeStyles } from "@material-ui/core/styles"
import { Link as RouterLink } from "react-router-dom"

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
    padding: ".5rem .75rem",
  },
  link: {
    margin: theme.spacing(1, 1.5),
    color: "inherit",
  },
  linkButton: {
    margin: theme.spacing(1, 1.5),
  },
  toolbar: {
    flexWrap: 'wrap',
  },
  title: {
    flexGrow: 1,
  },
}))

const Nav = () => {
  const classes = useStyles()
  const preventDefault = (event) => event.preventDefault();
  return (
    <AppBar className={classes.appBar} elevation={1}>
      <Toolbar className={classes.toolbar}>
        <Link href="#" onClick={preventDefault} className={classes.brandLink}>
            <img className={classes.logo}
              src="csc_logo.svg"
              alt="CSC" />
          </Link>
        <Typography variant="h6" noWrap className={classes.title}>
          Metadata Submitter
          </Typography>
        <nav className={classes.nav}>
          <IconButton
            component={RouterLink}
            to="/"
            className={classes.HomeIcon}
            aria-label="go to frontpage"
            color="inherit"
          >
            <HomeIcon />
            Main Page
          </IconButton>
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
