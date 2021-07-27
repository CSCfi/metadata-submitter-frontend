//@flow
import React from "react"

import Typography from "@material-ui/core/Typography"

import ErrorPageContainer from "../../components/ErrorPageContainer"

const Page400 = (): React$Element<typeof ErrorPageContainer> => {
  const errorLink = "https://github.com/CSCfi/metadata-submitter/issues"

  return (
    <ErrorPageContainer title="400 Bad Request" errorType="error">
      <Typography variant="body2">
        Oops, this means we cannot process the request that was made to our server, either due to a bad request, unsupported media type or an entity.{" "}
      </Typography>
      <Typography variant="body2">
        We would like to fix the issue, so could you create an issue in <a href={errorLink}>our github repo</a>?
      </Typography>
    </ErrorPageContainer>
  )
}

export default Page400
