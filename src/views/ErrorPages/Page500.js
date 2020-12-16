//@flow
import React from "react"

import Typography from "@material-ui/core/Typography"

import ErrorPageContainer from "../../components/ErrorPageContainer"

const Page500 = () => {
  const errorLink = "https://github.com/CSCfi/metadata-submitter/issues"

  return (
    <ErrorPageContainer title="500 Internal Server Error">
      <Typography variant="body2">
        Oops, this means our server caused some sort of error we have not thought of.{" "}
      </Typography>
      <Typography variant="body2">
        We would like to fix the error, so could you maybe drop us a line in <a href={errorLink}>our github repo</a>?
      </Typography>
    </ErrorPageContainer>
  )
}

export default Page500
