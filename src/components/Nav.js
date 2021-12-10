//@flow
import React, { useState } from "react"

import HomeIcon from "@mui/icons-material/Home"
import AppBar from "@mui/material/AppBar"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Link from "@mui/material/Link"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import { styled } from "@mui/material/styles"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import { makeStyles } from "@mui/styles"
import i18n from "i18next"
import { useDispatch, useSelector } from "react-redux"
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom"

import logo from "../images/csc_logo.svg"

import { Locale } from "constants/locale"
import { setLocale } from "features/localeSlice"
import { resetUser } from "features/userSlice"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { resetFolder } from "features/wizardSubmissionFolderSlice"
import { pathWithLocale } from "utils"

const useStyles = makeStyles(theme => ({
  link: {
    margin: theme.spacing(1, 1.5),
    color: theme.palette.secondary.main,
  },
  languageSelector: {
    marginLeft: theme.spacing(1),
    textTransform: "capitalize",
  },
  linkButton: {
    margin: theme.spacing(1, 1.5),
  },
}))

const NavBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  boxShadow: "0 0.25em 0.25em 0 rgba(0, 0, 0,0.25)",
}))

const Logo = styled("img")(() => ({
  width: "4em",
  height: "2.5em",
}))

const ServiceTitle = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  color: theme.palette.secondary.main,
  fontWeight: 700,
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
        size="large"
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

  const dispatch = useDispatch()

  const navigate = useNavigate()

  const changeLang = (locale: string) => {
    const pathWithoutLocale = location.pathname.split(`/${currentLocale}/`)[1]

    if (location.pathname !== "/") {
      navigate({ pathname: `/${locale}/${pathWithoutLocale}`, search: location.search })
    }

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
        sx={{ ml: "spacing(1)", textTransform: "capitalize" }}
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
  return (
    <NavBar>
      <Toolbar>
        <Link to={pathWithLocale("home")} component={RouterLink} sx={{ m: "1.5vh 1vw 1.5vh 2.5vw" }}>
          <Logo src={logo} alt="CSC_logo" />
        </Link>
        <ServiceTitle variant="h6" noWrap>
          Sensitive Data Services - SD Submit
        </ServiceTitle>
        <NavigationMenu />
      </Toolbar>
    </NavBar>
  )
}

export default Nav
