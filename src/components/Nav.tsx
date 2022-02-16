import React, { useState } from "react"

import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"
import PersonIcon from "@mui/icons-material/Person"
import AppBar from "@mui/material/AppBar"
import Button from "@mui/material/Button"
import Link from "@mui/material/Link"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import { styled } from "@mui/material/styles"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import * as i18n from "i18next"
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom"

import logo from "../images/csc_logo.svg"

import { Locale } from "constants/locale"
import { setLocale } from "features/localeSlice"
import { resetUser } from "features/userSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import { RootState } from "rootReducer"
import { pathWithLocale } from "utils"

const NavBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  boxShadow: "0 0.25em 0.25em 0 rgba(0, 0, 0,0.25)",
}))

const Logo = styled("img")(() => ({
  width: "6.4rem",
  height: "4rem",
  flexGrow: 1,
}))

const ServiceTitle = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  color: theme.palette.secondary.main,
  fontWeight: 700,
}))

type MenuItemProps = {
  currentLocale: string
}

const NavigationLinks = () => {
  const user = useAppSelector((state: RootState) => state.user)
  const dispatch = useAppDispatch()

  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <React.Fragment>
      <Button
        id="user-setting-button"
        aria-controls={open ? "user-setting-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        data-testid="user-setting-button"
      >
        <PersonIcon fontSize="large" />
        <Typography variant="subtitle2" color="secondary" sx={{ ml: "0.65em", mr: "1.9em", fontWeight: 700 }}>
          {user.name}
        </Typography>
        {open ? <ExpandLess color="secondary" /> : <ExpandMore color="secondary" fontSize="large" />}
      </Button>
      <Menu
        id="user-setting-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "user-setting-button",
        }}
      >
        <MenuItem
          component="a"
          onClick={() => {
            dispatch(resetUser())
            handleClose
          }}
          href="/logout"
        >
          <Typography variant="subtitle2" color="secondary" sx={{ ml: "0.65em", mr: "1.9em", fontWeight: 700 }}>
            Log out
          </Typography>
        </MenuItem>
      </Menu>
    </React.Fragment>
  )
}

const LanguageSelector = (props: MenuItemProps) => {
  const { currentLocale } = props

  const [anchorEl, setAnchorEl] = useState<HTMLElement>()
  const open = Boolean(anchorEl)
  const dispatch = useAppDispatch()

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

  const handleClick = (event: { currentTarget: HTMLElement }) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(undefined)
  }

  return (
    <>
      <Button
        data-testid="lang-selector"
        aria-controls="lang-menu"
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        sx={{ ml: 3, textTransform: "capitalize" }}
      >
        <Typography variant="subtitle2" color="primary" fontWeight="700">
          {currentLocale}
        </Typography>
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
        <MenuItem onClick={() => changeLang("en")} data-testid="en-lang">
          En
        </MenuItem>
        <MenuItem onClick={() => changeLang("fi")} data-testid="fi-lang">
          Fi
        </MenuItem>
      </Menu>
    </>
  )
}

const NavigationMenu = () => {
  const location = useLocation()
  const currentLocale = useAppSelector(state => state.locale) || Locale.defaultLocale

  return (
    <nav>
      {location.pathname !== "/" && <NavigationLinks />}
      <LanguageSelector currentLocale={currentLocale} />
    </nav>
  )
}

const Nav: React.FC = () => {
  return (
    <NavBar>
      <Toolbar>
        <Link to={pathWithLocale("home")} component={RouterLink} sx={{ m: "1.5rem 4rem" }}>
          <Logo src={logo} alt="CSC_logo" />
        </Link>
        <ServiceTitle variant="h5" noWrap>
          Sensitive Data Services - SD Submit
        </ServiceTitle>
        <NavigationMenu />
      </Toolbar>
    </NavBar>
  )
}

export default Nav
