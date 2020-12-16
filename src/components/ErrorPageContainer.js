//@flow
import React from "react"

import Avatar from "@material-ui/core/Avatar"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"
import { makeStyles } from "@material-ui/core/styles"
import ErrorOutlineOutlinedIcon from "@material-ui/icons/ErrorOutlineOutlined"
import Alert from "@material-ui/lab/Alert"

import logo from "../csc_logo.svg"

type ErrorPageProps = {
  children: any,
  errorType: string,
  title: string,
}

const useStyles = makeStyles(theme => ({
  errorContainer: {
    width: "100%",
    marginTop: theme.spacing(10),
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
    backgroundColor: props =>
      props.errorType === "warning"
        ? theme.palette.errors.yellowErrorBackground
        : theme.palette.errors.redErrorBackground,
    color: props =>
      props.errorType === "warning" ? theme.palette.errors.yellowErrorText : theme.palette.errors.redErrorText,
  },
  errorIcon: {
    color: props =>
      props.errorType === "warning" ? theme.palette.errors.yellowErrorText : theme.palette.errors.redErrorText,
  },
}))

const ErrorPage = ({ title, children, errorType }: ErrorPageProps) => {
  const classes = useStyles({ errorType })
  const errorIcon = <ErrorOutlineOutlinedIcon className={classes.errorIcon} />

  return (
    <Container component="main" maxWidth={false} className={classes.errorContainer}>
      <Grid container direction="column" justify="center" alignItems="center">
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
