//@flow
import React from "react"

import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardHeader from "@material-ui/core/CardHeader"
import Grid from "@material-ui/core/Grid"

const Page500 = () => {
  const errorLink = "https://github.com/CSCfi/metadata-submitter/issues"
  return (
    <Grid container direction="row" justify="center" alignItems="stretch">
      <Grid item xs={6}>
        <Card>
          <CardHeader title="500 Error" />
          <CardContent>
            Oops, this means our server caused some sort of error we have not thought of. We would like to fix the
            error, so could you maybe drop us a line in <a href={errorLink}>our github repo</a>?
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Page500
