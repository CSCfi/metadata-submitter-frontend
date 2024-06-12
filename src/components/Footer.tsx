import React from "react"

import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"

const FooterContainer = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.light,
  width: "100%",
  padding: "2.5rem 3.75rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}))

const FooterStart = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  marginRight: "auto",
  padding: "0.5rem 0.75rem",
  color: theme.palette.text.secondary,
}))

const FooterEnd = styled(Box)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-around",
  marginLeft: "auto",
  width: "50%",
})

const FooterItem = styled(Box)({
  padding: "0.5rem 0.75rem",
  display: "flex",
  alignItems: "center",
})

const FooterLink = styled("a")(({ theme }) => ({
  color: theme.palette.text.secondary,
  textDecoration: "none",
  cursor: "pointer",
  margin: "0.5rem 1rem",
  fontSize: "1.2739rem",
  "&:hover": {
    backgroundColor: "#CCF4F0",
    textDecoration: "underline",
  },
}))

const Footer: React.FC = () => {
  const { t } = useTranslation()

  return (
    <FooterContainer container data-testid="footer">
      <FooterStart>
        <Typography variant="subtitle2" fontWeight="700" data-testid="footer-name">
          {t("footer.sdSubmit")}
        </Typography>
        <Typography variant="subtitle2" fontWeight="400" data-testid="footer-name">
          {t("footer.serviceProvider")}
        </Typography>
        <Typography variant="subtitle2" fontWeight="400" data-testid="footer-name">
          {t("footer.csc")}
        </Typography>
      </FooterStart>
      <FooterEnd>
        <FooterItem>
          <FooterLink href="https://www.csc.fi" data-testid="footer-link">
            {t("footer.serviceDescription")}
          </FooterLink>
        </FooterItem>
        <FooterItem>
          <FooterLink href="https://www.csc.fi" data-testid="footer-link">
            {t("footer.accessibility")}
          </FooterLink>
        </FooterItem>
        <FooterItem>
          <FooterLink href="https://www.csc.fi" data-testid="footer-link">
            {t("footer.privacy")}
          </FooterLink>
        </FooterItem>
        <FooterItem>
          <FooterLink href="https://www.csc.fi" data-testid="footer-link">
            {t("footer.aboutSensitiveDataServices")}
          </FooterLink>
        </FooterItem>
      </FooterEnd>
    </FooterContainer>
  )
}

export default Footer
