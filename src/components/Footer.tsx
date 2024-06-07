import React from "react"

import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"

const FooterContainer = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.light,
  width: "100%",
  padding: "2.5rem 3.75rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "sticky",
  bottom: 0,
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
  return (
    <FooterContainer container>
      <FooterStart>
        <Typography variant="subtitle2" fontWeight="700">
          SD Submit
        </Typography>
        <Typography variant="subtitle2" fontWeight="400">
          CSC - IT Center for Science Ltd.
        </Typography>
        <Typography variant="subtitle2" fontWeight="400">
          P.O. Box 405 FI-02101 Espoo, Finland
        </Typography>
      </FooterStart>
      <FooterEnd>
        <FooterItem>
          <FooterLink href="https://www.csc.fi">Service description</FooterLink>
        </FooterItem>
        <FooterItem>
          <FooterLink href="https://www.csc.fi">Accessibility</FooterLink>
        </FooterItem>
        <FooterItem>
          <FooterLink href="https://www.csc.fi">Privacy</FooterLink>
        </FooterItem>
        <FooterItem>
          <FooterLink href="https://www.csc.fi">About Sensitive Data services</FooterLink>
        </FooterItem>
      </FooterEnd>
    </FooterContainer>
  )
}

export default Footer
