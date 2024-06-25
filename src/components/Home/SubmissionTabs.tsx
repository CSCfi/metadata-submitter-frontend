import * as React from "react"

import { styled } from "@mui/material/styles"
import MuiTab from "@mui/material/Tab"
import MuiTabs from "@mui/material/Tabs"

const Tabs = styled(MuiTabs)(({ theme }) => ({
  border: `2px solid ${theme.palette.primary.main}`,
  borderRadius: 4,
  backgroundColor: theme.palette.common.white,
}))

const Tab = styled(MuiTab, { shouldForwardProp: prop => prop !== "index" })<{
  index: number
}>(({ theme, index }) => ({
  "&.MuiTab-root": {
    color: theme.palette.primary.main,
    fontWeight: 700,
    fontSize: "1.6rem",
  },
  "&.Mui-selected": {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
  },
  borderRight: index !== 2 ? `1px solid ${theme.palette.primary.main}` : "none",
}))

type SubmissionTabsProps = {
  tabsAriaLabel: string
  tabs: Array<{ label: string; value: string, testId: string }>
  tabValue: string
  handleChangeTab: (e: React.SyntheticEvent, newTabValue: string) => void
}

const SubmissionTabs: React.FC<SubmissionTabsProps> = props => {
  const { tabsAriaLabel, tabs, tabValue, handleChangeTab } = props
  return (
    <Tabs
      value={tabValue}
      onChange={handleChangeTab}
      aria-label={tabsAriaLabel}
      textColor="primary"
      variant="fullWidth"
    >
      {tabs.map((tab, index) => (
        <Tab
          key={index}
          disableRipple
          disableFocusRipple
          index={index}
          label={tab.label}
          value={tab.value}
          data-testid={tab.testId}
        />
      ))}
    </Tabs>
  )
}
export default SubmissionTabs
