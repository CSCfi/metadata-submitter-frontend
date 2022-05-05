import React from "react"

import { styled } from "@mui/material/styles"

const Badge = styled(props => <span {...props} />)(() => ({
  color: "blue",
}))

const WizardObjectStatusBadge = (props: { status: "draft" | "ready" }) => {
  const { status } = props
  return <Badge> {status}</Badge>
}

export default WizardObjectStatusBadge
