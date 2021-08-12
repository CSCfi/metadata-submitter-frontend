//@flow
import React from "react"

import Typography from "@material-ui/core/Typography"

import ErrorPageContainer from "../../components/ErrorPageContainer"

const Page500 = (): React$Element<typeof ErrorPageContainer> => {
  const errorLink = "https://github.com/CSCfi/metadata-submitter/issues"

  return (
    <ErrorPageContainer title="500 Internal Server Error" errorType="error">
      <Typography variant="body2">
        Oops, this means our server caused some sort of error we have not thought of.{" "}
      </Typography>
      <Typography variant="body2">
      We would like to fix the issue, so could you create an issue in <a href={errorLink}>our github repo</a>?
      </Typography>
    </ErrorPageContainer>
  )
}

export default Page500
