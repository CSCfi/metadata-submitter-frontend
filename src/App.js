// @flow
import React from "react"
import Container from "@material-ui/core/Container"
import HomeIcon from "@material-ui/icons/Home"
import Typography from "@material-ui/core/Typography"
import CssBaseline from "@material-ui/core/CssBaseline"
import {
  AppBar,
  Toolbar,
  Card,
  CardActions,
  CardHeader,
  CardContent,
  Grid,
  Button,
  Link,
  IconButton,
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
  appBar: {
    position: "relative",
    borderBottom: `1px solid ${theme.palette.divider}`,
    alignItems: "center",
  },
  link: {
    margin: theme.spacing(1, 1.5),
    color: "inherit",
  },
}))

const App = () => {
  const classes = useStyles()

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar className={classes.appBar} elevation={1}>
        <Toolbar>
          <IconButton
            className={classes.HomeIcon}
            aria-label="go to frontpage"
            color="inherit"
          >
            <HomeIcon />
          </IconButton>
          <nav className={classes.nav}>
            <Link href="#" className={classes.link}>
              Open submissions
            </Link>
            <Link href="#" className={classes.link}>
              Submissions
            </Link>
            <Link variant="button" href="#" className={classes.link}>
              New submission
            </Link>
          </nav>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" component="main" justify="center">
        <Grid container direction="row" justify="center" alignItems="center">
          <Grid item>
            <Card>
              <CardHeader
                title="Submit study"
                subheader={"Upload an XML file"}
                titleTypographyProps={{ align: "center" }}
                subheaderTypographyProps={{ align: "center" }}
              />
              <CardContent>
                <div>
                  <Typography component="h2" variant="h3" color="textPrimary">
                    And man, some content man!
                  </Typography>
                </div>
              </CardContent>
              <CardActions>
                <Button fullWidth color="primary">
                  Paina nappulaa
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  )
}

export default App
