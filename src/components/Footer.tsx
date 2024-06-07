import React from "react"

import { styled } from "@mui/material/styles"

const StyledFooter = styled("footer")({
  padding: "40px 60px",
  backgroundColor: "#dfe1e3", // $csc-lightest-grey
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
})

const FooterContainer = styled("div")({
  display: "flex",
  width: "100%",
  justifyContent: "space-between",
  alignItems: "center",
})

const FooterStart = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
})

const FooterEnd = styled("div")({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-around",
  width: "60%",
})

const LargeText = styled("span")({
  fontStyle: "normal",
  fontWeight: 600,
  fontSize: "16px",
  lineHeight: "19px",
  color: "#2E3438", // $csc-dark
  marginBottom: "4px",
})

const SmallText = styled("div")({
  fontStyle: "normal",
  fontWeight: 400,
  fontSize: "14px",
  lineHeight: "18px",
  color: "#595959", // $csc-grey
})

const LinkText = styled("a")({
  color: "#595959", // $csc-grey
  fontWeight: 400,
  "&:hover": {
    backgroundColor: "#ccf4f0",
    textDecoration: "underline",
  },
})

const Footer: React.FC = () => {
  return (
    <StyledFooter>
      <FooterContainer>
        <FooterStart>
          <LargeText>SD Submit</LargeText>
          <SmallText>
            <LinkText href="#" target="_blank">
              Service provider
            </LinkText>
          </SmallText>
        </FooterStart>
        <FooterEnd>
          <SmallText>
            <LinkText href="#" target="_blank">
              Item 1
            </LinkText>
          </SmallText>
          <SmallText>
            <LinkText href="/accessibility" target="_blank">
              Item 2
            </LinkText>
          </SmallText>
          <SmallText>
            <LinkText href="#" target="_blank">
              Item 3
            </LinkText>
          </SmallText>
          <SmallText>
            <LinkText href="#" target="_blank">
              Item 4
            </LinkText>
          </SmallText>
        </FooterEnd>
      </FooterContainer>
    </StyledFooter>
  )
}

export default Footer
