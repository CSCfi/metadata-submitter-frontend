import React, { ReactElement } from "react"

import { Divider } from "@mui/material"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Container from "@mui/material/Container"
import { styled } from "@mui/system"

type ErrorPageProps = {
  children: ReactElement<unknown>[] | ReactElement<unknown>
  title: string
}

const MainContainer = styled(Container)({
  display: "flex",
  minHeight: "92vh",
  minWidth: "97vh",
  maxWidth: "70rem",
  justifyContent: "center",
  flexDirection: "column",
})

const ErrorCard = styled(Card)(({ theme }) => ({
  fontSize: "1.6rem",
  color: theme.palette.secondary.main,
  minHeight: "56rem",
  minWidth: "88rem",
  padding: "1.5rem",
}))

const ErrorCardDivider = styled(Divider)(({ theme }) => ({
  width: "4rem",
  borderWidth: "0.2rem",
  borderRadius: 3,
  background: theme.palette.primary.main,
  marginTop: "1rem",
  marginBottom: "1rem",
}))

const ErrorCardContent = styled(CardContent)(({ theme }) => ({
  padding: 0,
  textTransform: "none",
  color: theme.palette.text.primary,
}))

/*
 * Render a customizable error page based on error codes such as 400, 401
 */
const ErrorPage: React.FC<ErrorPageProps> = (props: ErrorPageProps) => {
  const { children, title } = props

  return (
    <MainContainer>
      <ErrorCard>
        {title}
        <ErrorCardDivider />
        <ErrorCardContent>{children}</ErrorCardContent>
      </ErrorCard>
    </MainContainer>
  )
}

export default ErrorPage
