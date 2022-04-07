import React, { ReactElement } from "react"

import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined"
import { CustomTheme } from "@mui/material"
import Alert from "@mui/material/Alert"
import Avatar from "@mui/material/Avatar"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import { makeStyles } from "@mui/styles"

import logo from "../images/csc_logo.svg"

type ErrorPageProps = {
  children: (string | ReactElement)[]
  errorType: string
  title: string
}

type ErrorTypeProps = {
  errorType: string
}

const useStyles = makeStyles((theme: CustomTheme) => ({
  errorContainer: {
    width: "100%",
    marginTop: 10,
  },
  card: {
    padding: "2vw",
  },
  logo: {
    backgroundColor: "transparent",
    width: "6vw",
    height: "auto",
    margin: "1vh auto",
  },
  errorTitle: {
    color: theme.palette.common.black,
    backgroundColor: theme.palette.common.white,
    border: (props: ErrorTypeProps) =>
      props.errorType === "warning"
        ? `1px solid ${theme.palette.warning.main}`
        : `1px solid ${theme.palette.error.main}`,
  },
  errorIcon: {
    color: (props: ErrorTypeProps) =>
      props.errorType === "warning" ? theme.palette.warning.main : theme.palette.error.main,
  },
}))

const ErrorPage: React.FC<ErrorPageProps> = (props: ErrorPageProps) => {
  const { children, errorType, title } = props

  const classes = useStyles({ errorType })
  const errorIcon = <ErrorOutlineOutlinedIcon className={classes.errorIcon} />

  return (
    <Container component="main" maxWidth={false} className={classes.errorContainer}>
      <Grid container direction="column" justifyContent="center" alignItems="center">
        <Grid item xs={3}>
          <Card className={classes.card}>
            <Avatar variant="square" className={classes.logo}>
              <img className={classes.logo} src={logo} alt="CSC" />
            </Avatar>
            <Alert icon={errorIcon} className={classes.errorTitle}>
              <strong>{title}</strong>
            </Alert>
            <CardContent>{children}</CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default ErrorPage
