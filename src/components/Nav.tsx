import React, { useEffect, useState } from "react"

import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import LanguageIcon from "@mui/icons-material/Language"
import LogoutIcon from "@mui/icons-material/Logout"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import PersonIcon from "@mui/icons-material/Person"
import AppBar from "@mui/material/AppBar"
import Button from "@mui/material/Button"
import Link from "@mui/material/Link"
import ListItemIcon from "@mui/material/ListItemIcon"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import { styled } from "@mui/material/styles"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"
import { Link as RouterLink, useLocation, useNavigate } from "react-router"

import i18n from "../i18n"
import logo from "../images/csc_logo.svg"

import WizardAlert from "./SubmissionWizard/WizardComponents/WizardAlert"

import { Locale } from "constants/locale"
import { PathsWithoutLogin } from "constants/paths"
import { setLocale } from "features/localeSlice"
import { fetchUser, resetUser } from "features/userSlice"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { resetSubmission } from "features/wizardSubmissionSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import { RootState } from "rootReducer"
import { pathWithLocale } from "utils"

const NavBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  boxShadow: "0 0.25em 0.25em 0 rgba(0, 0, 0,0.25)",
  zIndex: 1300,
  top: 0,
  left: 0,
  right: 0,
}))

const Logo = styled("img")(() => ({
  width: "6.4rem",
  height: "4rem",
  flexGrow: 1,
}))

const ServiceTitle = styled(Typography)(({ theme }) => ({
  whiteSpace: "nowrap", // prevent truncation
  flexGrow: 1,
  color: theme.palette.secondary.main,
  fontWeight: 700,
}))

const NavLinks = styled("nav")(({ theme }) => ({
  "& button": {
    color: theme.palette.primary.main,
    margin: theme.spacing(0, 1.5),
    padding: "0.4rem 1rem",
    fontSize: "1.4rem",
    "&:hover": { backgroundColor: theme.palette.primary.light },
  },
}))

type MenuItemProps = {
  currentLocale: string
}

const NavigationLinks = () => {
  const user = useAppSelector((state: RootState) => state.user)
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  useEffect(() => {
    dispatch(fetchUser())
  }, [dispatch])

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return user.name ? (
    <>
      <Button
        id="user-setting-button"
        aria-controls={open ? "user-setting-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        data-testid="user-setting-button"
      >
        <PersonIcon fontSize="large" />
        <Typography
          variant="subtitle2"
          color="primary"
          sx={{ ml: "1rem", mr: "0.65rem", fontWeight: 600 }}
        >
          {user.name}
        </Typography>
        {open ? <ExpandLess fontSize="large" /> : <ExpandMore fontSize="large" />}
      </Button>
      <Menu
        id="user-setting-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{ list: { "aria-labelledby": "user-setting-button" } }}
      >
        <MenuItem
          component="a"
          onClick={() => {
            handleClose
            dispatch(resetUser())
          }}
          href="/logout"
        >
          <Typography
            variant="subtitle2"
            color="text.primary"
            sx={{ mx: "1rem", fontWeight: 700 }}
            data-testid="logout"
          >
            {t("logout")}
          </Typography>
          <ListItemIcon>
            <LogoutIcon sx={{ color: "text.primary" }} />
          </ListItemIcon>
        </MenuItem>
      </Menu>
    </>
  ) : (
    <></>
  )
}

const LanguageSelector = (props: MenuItemProps) => {
  const { currentLocale } = props
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()
  const open = Boolean(anchorEl)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const chosenLanguage = t(`visibleLanguage.${currentLocale}`)

  const changeLang = (locale: string) => {
    const pathWithoutLocale = location.pathname.includes(`${currentLocale}`)
      ? location.pathname.split(`/${currentLocale}/`)[1]
      : location.pathname.replace("/", "")

    if (!PathsWithoutLogin.includes(location.pathname)) {
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
      >
        <LanguageIcon fontSize="large" />
        <Typography
          variant="subtitle2"
          color="primary"
          sx={{ ml: "1rem", mr: "0.65rem", fontWeight: 600 }}
        >
          {chosenLanguage}
        </Typography>
        {open ? <ExpandLess fontSize="large" /> : <ExpandMore fontSize="large" />}
      </Button>
      <Menu
        id="lang-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        slotProps={{ list: { "aria-labelledby": "lang-selector" } }}
      >
        <MenuItem onClick={() => changeLang("en")} data-testid="en-lang">
          <Typography
            variant="subtitle2"
            color="text.primary"
            sx={{ ml: "1rem", mr: "6rem", fontWeight: 700 }}
          >
            {t("inEnglish")}
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => changeLang("fi")} data-testid="fi-lang">
          <Typography
            variant="subtitle2"
            color="text.primary"
            sx={{ ml: "1rem", mr: "6rem", fontWeight: 700 }}
          >
            {t("inFinnish")}
          </Typography>
        </MenuItem>
      </Menu>
    </>
  )
}

const SupportSelector = ({ handleOpenKeyModal }) => {
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()
  const open = Boolean(anchorEl)

  const handleClick = (event: { currentTarget: HTMLElement }) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(undefined)
  }

  return (
    <>
      <Button
        data-testid="support-button"
        aria-controls="support-menu"
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        sx={{ textTransform: "capitalize" }}
      >
        <HelpOutlineIcon fontSize="large" />
        <Typography
          variant="subtitle2"
          color="primary"
          sx={{ ml: "1rem", mr: "0.65rem", fontWeight: 600 }}
        >
          {t("support")}
        </Typography>
        {open ? <ExpandLess fontSize="large" /> : <ExpandMore fontSize="large" />}
      </Button>
      <Menu
        id="support-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{ list: { "aria-labelledby": "suport-selector" } }}
      >
        <MenuItem sx={{ width: 1 }} onClick={() => handleClose()}>
          <Link
            href="https://docs.csc.fi/data/sensitive-data/"
            target="_blank"
            variant="subtitle2"
            underline="none"
          >
            <Typography
              variant="subtitle2"
              color="text.primary"
              sx={{ mx: "1rem", fontWeight: 700 }}
            >
              {t("userGuide")}
            </Typography>
          </Link>
          <ListItemIcon>
            <OpenInNewIcon sx={{ color: "text.primary" }} />
          </ListItemIcon>
        </MenuItem>
        <MenuItem sx={{ width: 1 }} onClick={() => handleClose()}>
          <Button onClick={handleOpenKeyModal}>
            <Typography variant="subtitle2" color="secondary" sx={{ fontWeight: 700 }}>
              {t("createAPIKeys")}
            </Typography>
          </Button>
        </MenuItem>
      </Menu>
    </>
  )
}

const NavigationMenu = ({ handleOpenKeyModal }) => {
  const location = useLocation()
  const currentLocale = useAppSelector(state => state.locale) || Locale.defaultLocale
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleAlert = (alertWizard: boolean) => {
    if (alertWizard) {
      navigate(pathWithLocale("home"))
      dispatch(resetObjectType())
      dispatch(resetSubmission())
    }
    setDialogOpen(false)
  }

  return (
    <>
      <NavLinks>
        {location.pathname.includes("/submission") && (
          <Button
            size="large"
            variant="outlined"
            onClick={() => setDialogOpen(true)}
            data-testid="save-submission"
          >
            {t("submission.save")}
          </Button>
        )}
        <LanguageSelector currentLocale={currentLocale} />
        {!PathsWithoutLogin.includes(location.pathname) && (
          <SupportSelector handleOpenKeyModal={handleOpenKeyModal} />
        )}
        {!PathsWithoutLogin.includes(location.pathname) && <NavigationLinks />}
      </NavLinks>
      {dialogOpen && (
        <WizardAlert onAlert={handleAlert} parentLocation="header" alertType={"save"}></WizardAlert>
      )}
    </>
  )
}

const NavToolBar = ({ handleOpenKeyModal }) => {
  const { t } = useTranslation()
  return (
    <Toolbar disableGutters>
      <Link to={pathWithLocale("home")} component={RouterLink} sx={{ m: "1.5rem 2rem" }}>
        <Logo src={logo} alt="CSC_logo" />
      </Link>
      <ServiceTitle variant="h5">{t("serviceTitle")}</ServiceTitle>
      <NavigationMenu handleOpenKeyModal={() => handleOpenKeyModal()} />
    </Toolbar>
  )
}
const Nav: React.FC<{ isFixed: boolean; handleOpenKeyModal: () => void }> = ({
  isFixed,
  handleOpenKeyModal,
}) => {
  return (
    <>
      {isFixed ? (
        <NavBar position="fixed">
          <NavToolBar handleOpenKeyModal={handleOpenKeyModal} />
        </NavBar>
      ) : (
        <NavBar position="relative">
          <NavToolBar handleOpenKeyModal={handleOpenKeyModal} />
        </NavBar>
      )}
    </>
  )
}

export default Nav
