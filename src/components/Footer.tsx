import React from "react"

import Box from "@mui/material/Box"
import Grid, { GridProps } from "@mui/material/Grid"
import Link from "@mui/material/Link"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router"

const withFixedFooter = ["/", "/error400", "/error404", "/error401", "/error403", "/error500"]

type FooterContainerProps = GridProps & {
  isfixed?: boolean
}

const FooterContainer = styled(Grid, {
  shouldForwardProp: prop => prop !== "isfixed",
})<FooterContainerProps>(({ isfixed, theme }) => ({
  backgroundColor: theme.palette.secondary.light,
  width: "100%",
  padding: "2.5rem 3.75rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  ...(isfixed && {
    position: "fixed",
    bottom: 0,
  }),
}))

const FooterContent = styled(Box)(() => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
  padding: "2.5rem 3.75rem",
}))

const FooterStart = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  color: theme.palette.text.primary,
  fontSize: "1.5714rem",
  "& > *:not(:last-child)": {
    marginBottom: "1rem",
  },
}))

const FooterEnd = styled(Box)(() => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  width: "50%",
}))

const FooterItem = styled(Box)(() => ({
  padding: "0.5rem",
  display: "flex",
  alignItems: "center",
}))

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.secondary.main,
  "&:hover": {
    backgroundColor: theme.palette.accent.light,
  },
}))

const FooterLinkStart = styled(FooterLink)(({ theme }) => ({
  color: theme.palette.text.primary,
}))

const Footer: React.FC = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const isfixed = withFixedFooter.includes(location.pathname)

  return (
    <FooterContainer container data-testid="footer" isfixed={isfixed}>
      <FooterContent>
        <FooterStart>
          <Typography variant="subtitle2" fontWeight="700" data-testid="footer-name">
            {t("footer.sdSubmit")}
          </Typography>
          <Typography variant="subtitle2" fontWeight="400" data-testid="footer-name">
            <FooterLinkStart
              href="https://csc.fi"
              target="_blank"
              color="secondary"
              underline="hover"
              variant="subtitle2"
              data-testid="footer-link"
              style={{ margin: 0 }}
            >
              {t("footer.csc")}
            </FooterLinkStart>
          </Typography>
        </FooterStart>
        <FooterEnd>
          <FooterItem>
            <FooterLink
              href="https://research.csc.fi/sensitive-data"
              target="_blank"
              color="secondary"
              underline="hover"
              variant="subtitle2"
              data-testid="footer-link"
            >
              {t("footer.serviceDescription")}
            </FooterLink>
          </FooterItem>
          <FooterItem>
            <FooterLink
              href="https://sd-connect.sd.csc.fi/accessibility"
              target="_blank"
              color="secondary"
              underline="hover"
              variant="subtitle2"
              data-testid="footer-link"
            >
              {t("footer.accessibility")}
            </FooterLink>
          </FooterItem>
          <FooterItem>
            <FooterLink
              href="https://csc.fi/customer-register-privacy-policy"
              target="_blank"
              color="secondary"
              underline="hover"
              variant="subtitle2"
              data-testid="footer-link"
            >
              {t("footer.privacy")}
            </FooterLink>
          </FooterItem>
          <FooterItem>
            <FooterLink
              href="https://research.csc.fi/sensitive-data"
              target="_blank"
              color="secondary"
              underline="hover"
              variant="subtitle2"
              data-testid="footer-link"
            >
              {t("footer.aboutSensitiveDataServices")}
            </FooterLink>
          </FooterItem>
        </FooterEnd>
      </FooterContent>
    </FooterContainer>
  )
}

export default Footer
