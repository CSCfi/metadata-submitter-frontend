//@flow
import React, { useState } from "react"

import AppBar from "@material-ui/core/AppBar"
import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import Link from "@material-ui/core/Link"
import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"
import { makeStyles } from "@material-ui/core/styles"
import Toolbar from "@material-ui/core/Toolbar"
import Typography from "@material-ui/core/Typography"
import HomeIcon from "@material-ui/icons/Home"
import i18n from "i18next"
import { useDispatch, useSelector } from "react-redux"
import { Link as RouterLink, useLocation, useHistory } from "react-router-dom"

import logo from "../csc_logo.svg"

import { Locale } from "constants/locale"
import { setLocale } from "features/localeSlice"
import { resetUser } from "features/userSlice"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { resetFolder } from "features/wizardSubmissionFolderSlice"
import { pathWithLocale } from "utils"

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
  languageSelector: {
    marginLeft: theme.spacing(1),
    textTransform: "capitalize",
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

type MenuItemProps = {
  currentLocale: string,
}

const NavigationLinks = (props: MenuItemProps) => {
  const { currentLocale } = props

  const classes = useStyles()
  const dispatch = useDispatch()

  const resetWizard = () => {
    dispatch(resetObjectType())
    dispatch(resetFolder())
  }

  return (
    <React.Fragment>
      <IconButton
        component={RouterLink}
        to={`/${currentLocale}/home`}
        className={classes.HomeIcon}
        aria-label="go to frontpage"
        color="inherit"
      >
        <HomeIcon />
      </IconButton>
      <Link component={RouterLink} to={pathWithLocale("home/drafts")} className={classes.link}>
        Open submissions
      </Link>
      <Link component={RouterLink} to={pathWithLocale("home/published")} className={classes.link}>
        Submissions
      </Link>
      <Link component={RouterLink} aria-label="Create Submission" to={pathWithLocale("newdraft?step=0")}>
        <Button
          color="primary"
          variant="contained"
          className={classes.linkButton}
          onClick={() => {
            resetWizard()
          }}
        >
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
    </React.Fragment>
  )
}

const LanguageSelector = (props: MenuItemProps) => {
  const { currentLocale } = props

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const classes = useStyles()
  const dispatch = useDispatch()

  const history = useHistory()

  const changeLang = (locale: string) => {
    const pathWithoutLocale = location.pathname.split(`/${currentLocale}/`)[1]

    if (location.pathname !== "/") history.push(`/${locale}/${pathWithoutLocale}`)

    dispatch(setLocale(locale))

    i18n.changeLanguage(locale).then(t => {
      t("key")
      handleClose()
    })
  }

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <Button
        id="lang-selector"
        aria-controls="lang-menu"
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        className={classes.languageSelector}
      >
        {currentLocale}
      </Button>
      <Menu
        id="lang-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "lang-selector",
        }}
      >
        <MenuItem onClick={() => changeLang("en")}>En</MenuItem>
        <MenuItem onClick={() => changeLang("fi")}>Fi</MenuItem>
      </Menu>
    </>
  )
}

const NavigationMenu = () => {
  const classes = useStyles()

  let location = useLocation()

  const currentLocale = useSelector(state => state.locale) || Locale.defaultLocale

  return (
    <nav className={classes.nav}>
      {location.pathname !== "/" && <NavigationLinks currentLocale={currentLocale} />}
      <LanguageSelector currentLocale={currentLocale} />
    </nav>
  )
}

const Nav = (): React$Element<typeof AppBar> => {
  const classes = useStyles()
  return (
    <AppBar className={classes.appBar} elevation={1}>
      <Toolbar className={classes.toolbar}>
        <Link to={pathWithLocale("home")} component={RouterLink} className={classes.brandLink}>
          <img className={classes.logo} src={logo} alt="CSC" />
        </Link>
        <Typography variant="h6" noWrap className={classes.title}>
          Metadata Submitter
        </Typography>
        <NavigationMenu />
      </Toolbar>
    </AppBar>
  )
}

export default Nav
