//@flow
import React from "react"
import useStyles from "../styles"
import { AppBar, Toolbar, Button, Link, IconButton } from "@material-ui/core"
import HomeIcon from "@material-ui/icons/Home"

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
