import React, { ReactElement } from "react"

import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined"
import Alert from "@mui/material/Alert"
import Avatar from "@mui/material/Avatar"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import { styled } from "@mui/system"

import logo from "../images/csc_logo.svg"

type ErrorPageProps = {
  children: (ReactElement[] | ReactElement)
  errorType: string
  title: string
}

type ErrorTypeProps = {
  errorType: string
}

const MainContainer = styled(Container)({
  width: "100%",
  marginTop: 10,
})

const MUIAlert = styled(Alert, {
  shouldForwardProp: prop => prop !== "errorType",
})<ErrorTypeProps>(({ theme, errorType }) => ({
  color: theme.palette.common.black,
  backgroundColor: theme.palette.common.white,
  border: errorType === "warning" ? `1px solid ${theme.palette.warning.main}` : `1px solid ${theme.palette.error.main}`,
}))

const ErrorIcon = styled(ErrorOutlineOutlinedIcon, {
  shouldForwardProp: prop => prop !== "errorType",
})<ErrorTypeProps>(({ theme, errorType }) => ({
  color: errorType === "warning" ? theme.palette.warning.main : theme.palette.error.main,
}))

const ErrorPage: React.FC<ErrorPageProps> = (props: ErrorPageProps) => {
  const { children, errorType, title } = props

  const errorIcon = <ErrorIcon errorType={errorType} />

  const logoStyles = { backgroundColor: "transparent", width: "6vw", height: "auto", margin: "1vh auto" }
  return (
    <MainContainer maxWidth={false}>
      <Grid container direction="column" justifyContent="center" alignItems="center">
        <Grid item xs={3}>
          <Card sx={{ p: "2vw" }}>
            <Avatar variant="square" sx={logoStyles}>
              <img style={logoStyles} src={logo} alt="CSC" />
            </Avatar>
            <MUIAlert icon={errorIcon} errorType={errorType}>
              <strong>{title}</strong>
            </MUIAlert>
            <CardContent>{children}</CardContent>
          </Card>
        </Grid>
      </Grid>
    </MainContainer>
  )
}

export default ErrorPage
