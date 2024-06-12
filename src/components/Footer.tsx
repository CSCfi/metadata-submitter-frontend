import React from "react"

import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"

const FooterContainer = styled(Grid)(() => ({
  backgroundColor: "#dfe1e3",
  width: "100%",
  padding: "2.5rem 3.75rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}))

const FooterContent = styled(Box)(() => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  width: "100%",
  padding: "2.5rem 3.75rem",
}))

const FooterStart = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  color: "#2E3438",
  fontSize: "1.5714rem",
  "& > *:not(:last-child)": {
    marginBottom: "1rem",
  },
}))

const FooterEnd = styled(Box)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  width: "50%",
})

const FooterItem = styled(Box)({
  padding: "0.5rem",
  display: "flex",
  alignItems: "center",
})

const FooterLink = styled("a")(({ theme }) => ({
  color: theme.palette.text.secondary,
  textDecoration: "none",
  cursor: "pointer",
  margin: "0 1.5rem",
  fontSize: "1.4331rem",
  fontWeight: "400",
  "&:hover": {
    color: "#025B97",
    backgroundColor: "#CCF4F0",
    textDecoration: "underline",
  },
}))

const FooterLinkStart = styled(FooterLink)({
  color: "#2E3438",
  "&:hover": {
    color: "#2E3438",
    backgroundColor: "#CCF4F0",
  },
})

const Footer: React.FC = () => {
  const { t } = useTranslation()

  return (
    <FooterContainer container data-testid="footer">
      <FooterContent>
        <FooterStart>
          <Typography variant="subtitle2" fontWeight="700" data-testid="footer-name">
            {t("footer.sdSubmit")}
          </Typography>
          <Typography variant="subtitle2" fontWeight="400" data-testid="footer-name">
            <FooterLinkStart
              href="https://csc.fi"
              target="_blank"
              className="linktext"
              data-testid="footer-link"
              style={{ margin: 0 }}
            >
              {t("footer.csc")}
            </FooterLinkStart>
          </Typography>
        </FooterStart>
        <FooterEnd>
          <FooterItem>
            <FooterLink href="https://research.csc.fi/sensitive-data" data-testid="footer-link">
              {t("footer.serviceDescription")}
            </FooterLink>
          </FooterItem>
          <FooterItem>
            <FooterLink href="https://sd-connect.sd.csc.fi/accessibility" data-testid="footer-link">
              {t("footer.accessibility")}
            </FooterLink>
          </FooterItem>
          <FooterItem>
            <FooterLink
              href="https://csc.fi/customer-register-privacy-policy"
              data-testid="footer-link"
            >
              {t("footer.privacy")}
            </FooterLink>
          </FooterItem>
          <FooterItem>
            <FooterLink href="https://research.csc.fi/sensitive-data" data-testid="footer-link">
              {t("footer.aboutSensitiveDataServices")}
            </FooterLink>
          </FooterItem>
        </FooterEnd>
      </FooterContent>
    </FooterContainer>
  )
}

export default Footer
