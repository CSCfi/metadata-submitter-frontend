//@flow
import React from "react"

import Button from "@material-ui/core/Button"
import Alert from "@material-ui/lab/Alert"

/**
 * Show selection for object and submission types and correct form based on users choice.
 */
const WizardSavedObjectsList = ({ submissionType, submissions }: { submissionType: string, submissions: any }) => {
  const handleObjectDelete = id => {
    console.log(id)
  }

  return (
    <div>
      Submitted {submissionType} items
      {submissions.map(submission => {
        return (
          <Alert severity="success" key={submission.accessionId}>
            {submission.accessionId}
            <Button
              onClick={() => {
                handleObjectDelete(submission.accessionId)
              }}
            >
              x
            </Button>
          </Alert>
        )
      })}
    </div>
  )
}

export default WizardSavedObjectsList
