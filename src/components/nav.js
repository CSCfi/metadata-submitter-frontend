//@flow
import React from "react"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import Button from "@material-ui/core/Button"
import Link from "@material-ui/core/Link"
import IconButton from "@material-ui/core/IconButton"
import HomeIcon from "@material-ui/icons/Home"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
  appBar: {
    position: "relative",
    borderBottom: `1px solid ${theme.palette.divider}`,
    alignItems: "flex-end",
    color: "rgb(72,72,72)",
    backgroundColor: "white",
  },
  link: {
    margin: theme.spacing(1, 1.5),
    color: "inherit",
  },
  linkButton: {
    margin: theme.spacing(1, 1.5),
    color: "white",
    padding: "10px 20px",
    backgroundColor: "rgb(121, 131, 204)",
    borderRadius: "20px",
  },
}))

const Nav = () => {
  const classes = useStyles()
  return (
    <AppBar className={classes.appBar} elevation={1}>
      <Toolbar>
        <IconButton
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
          <Button>
            <Link href="#" className={classes.linkButton}>
              New submission
            </Link>
          </Button>
        </nav>
      </Toolbar>
    </AppBar>
  )
}

export default Nav
