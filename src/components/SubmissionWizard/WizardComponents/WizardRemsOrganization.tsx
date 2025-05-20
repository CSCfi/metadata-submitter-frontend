import React from "react"

import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import { SelectChangeEvent } from "@mui/material/Select"
import { useTranslation } from "react-i18next"

import { HandlerRef } from "types"

type WizardRemsOrganizationProps = {
  organizations: { id: string; name: string }[]
  selectedOrgId: string
  handleOrgChange: (event: SelectChangeEvent) => void
}

const WizardRemsOrganization = React.forwardRef(function WizardRemsOrganization(
  props: WizardRemsOrganizationProps,
  ref: HandlerRef
) {
  const { t } = useTranslation()
  const { organizations, selectedOrgId, handleOrgChange } = props

  return (
    <Box ref={ref}>
      <FormControl fullWidth>
        <InputLabel id="select-organization">{t("dacPolicies.selectOrganization")}</InputLabel>
        <Select
          labelId="select-organization"
          id="organizationId"
          value={selectedOrgId}
          label="Select organization"
          onChange={handleOrgChange}
          data-testid="organizationId"
        >
          {organizations.map((org, index) => (
            <MenuItem value={org.id} key={index} sx={{ p: "1rem" }} data-testid={org.id}>
              {org.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
})

export default WizardRemsOrganization
