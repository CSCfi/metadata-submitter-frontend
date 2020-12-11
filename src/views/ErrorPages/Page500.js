//@flow
import React from "react"

import ErrorPageContainer from "../../components/ErrorPageContainer"

const Page500 = () => {
  const errorLink = "https://github.com/CSCfi/metadata-submitter/issues"
  return (
    <ErrorPageContainer title="500 Error">
      Oops, this means our server caused some sort of error we have not thought of. We would like to fix the error, so
      could you maybe drop us a line in <a href={errorLink}>our github repo</a>?
    </ErrorPageContainer>
  )
}

export default Page500
