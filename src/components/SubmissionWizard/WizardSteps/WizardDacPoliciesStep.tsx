import React, { useEffect, useState } from "react"

import { Box, Button, Typography } from "@mui/material"
import { SelectChangeEvent } from "@mui/material/Select"
import { styled } from "@mui/system"
import { useForm, Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

import WizardRemsDAC from "components/SubmissionWizard/WizardComponents/WizardRemsDAC"
import WizardRemsOrganization from "components/SubmissionWizard/WizardComponents/WizardRemsOrganization"
import WizardRemsPolicies from "components/SubmissionWizard/WizardComponents/WizardRemsPolicies"
import WizardStepContentHeader from "components/SubmissionWizard/WizardComponents/WizardStepContentHeader"
import { ResponseStatus } from "constants/responseStatus"
import { updateStatus } from "features/statusMessageSlice"
import { addRemsToSubmission } from "features/wizardSubmissionSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import submissionAPIService from "services/submissionAPI"
import { DacPoliciesData } from "types"

const Form = styled("form")({
  "& .MuiTextField-root": {
    margin: "1rem 0",
  },
})

const SectionTitle = ({ children }: { children: string[] }) => (
  <Typography
    variant="h5"
    gutterBottom
    component="div"
    fontWeight="700"
    sx={{ color: "secondary.main", pt: "3rem", pb: "1rem" }}
  >
    {children}
  </Typography>
)

/**
 * Define React Hook Form for adding new submission. Ref is added to RHF so submission can be triggered outside this component.
 */
const DacPoliciesForm = () => {
  const dispatch = useAppDispatch()
  const { submissionId } = useAppSelector(state => state.submission)
  const remsInfo = useAppSelector(state => state.remsInfo)

  const { t } = useTranslation()

  const organizations = remsInfo.map(org => ({ id: org.id, name: org.name }))

  const [selectedRems, setSelectedRems] = useState<{
    organizationId: string
    workflowId: null | number
    licenses: number[]
  }>({
    organizationId: "",
    workflowId: null,
    licenses: [],
  })

  const dacs = selectedRems.organizationId
    ? remsInfo
        .filter(org => org["id"] === selectedRems.organizationId)[0]
        ["workflows"].map(
          (wf: { id: number; title: string; licenses: { id: number; title: string }[] }) => {
            const policies = wf.licenses.map(lic => ({
              id: lic.id,
              title: lic.title,
            }))
            return {
              id: wf.id,
              title: wf.title,
              policies: policies,
            }
          }
        )
    : []

  const policies = selectedRems.organizationId
    ? remsInfo.filter(org => org["id"] === selectedRems.organizationId)[0]["licenses"]
    : []

  const linkedPolicies =
    dacs.length && selectedRems.workflowId
      ? dacs.filter(dac => dac.id === selectedRems.workflowId)[0]["policies"].map(pol => pol.id)
      : []

  useEffect(() => {
    let isMounted = true
    const getSubmissionRems = async () => {
      if (isMounted) {
        try {
          const response = await submissionAPIService.getSubmissionById(submissionId)
          if (response.data.rems) {
            setSelectedRems(response.data.rems)
            setValue("organizationId", response.data.rems["organizationId"])
          }
        } catch (error) {
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: error,
              helperText: "snackbarMessages.error.helperText.fetchSubmission",
            })
          )
        }
      }
    }

    getSubmissionRems()
    return () => {
      isMounted = false
    }
  }, [remsInfo])

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
    setValue,
  } = useForm()
  const onSubmit = async data => {
    const remsData = { ...data, licenses: data.licenses.concat(linkedPolicies) }
    dispatch(addRemsToSubmission(submissionId, remsData))
      .then(() => {
        dispatch(
          updateStatus({
            status: ResponseStatus.success,
            helperText: "snackbarMessages.success.rems.saved",
          })
        )
      })
      .catch(error =>
        dispatch(
          updateStatus({
            status: ResponseStatus.error,
            response: error,
            helperText: "snackbarMessages.error.helperText.submitRems",
          })
        )
      )
  }

  const SaveButton = (
    <Button
      disabled={!selectedRems.organizationId || !selectedRems.workflowId || isSubmitting}
      variant="contained"
      aria-label={t("ariaLabels.saveDAC")}
      size="small"
      type="submit"
      data-testid="form-ready"
    >
      {t("save")}
    </Button>
  )

  return (
    <Form onSubmit={handleSubmit(async data => onSubmit(data as DacPoliciesData))}>
      <WizardStepContentHeader action={SaveButton} />
      <Box sx={{ p: "4rem" }}>
        <Typography variant="h4" gutterBottom component="div" color="secondary" fontWeight="700">
          {t("add")} {t("dacPolicies.title")}
        </Typography>
        <SectionTitle>1. {t("dacPolicies.selectOrganization")}</SectionTitle>
        <Controller
          control={control}
          name="organizationId"
          defaultValue={selectedRems.organizationId}
          render={({ field }) => {
            const handleOrgChange = (e: SelectChangeEvent) => {
              field.onChange(e.target.value)
              setSelectedRems({
                organizationId: e.target.value,
                workflowId: null,
                licenses: [],
              })
              // reset licenses field when org is changed
              setValue("licenses", [])
            }

            return (
              <WizardRemsOrganization
                {...field}
                organizations={organizations}
                selectedOrgId={selectedRems.organizationId}
                handleOrgChange={handleOrgChange}
              />
            )
          }}
          rules={{ required: true }}
        />
        {selectedRems.organizationId && (
          <>
            <SectionTitle>2. {t("dacPolicies.selectDAC")}</SectionTitle>
            <Controller
              control={control}
              name="workflowId"
              defaultValue={selectedRems.workflowId}
              render={({ field }) => {
                const handleDACChange = e => {
                  field.onChange(parseInt(e.target.value))
                  setSelectedRems({
                    ...selectedRems,
                    workflowId: parseInt(e.target.value),
                  })
                  // reset licenses field when workflow is changed
                  setValue("licenses", [])
                }

                return (
                  <WizardRemsDAC
                    {...field}
                    dacs={dacs}
                    selectedDAC={selectedRems.workflowId}
                    handleDACChange={handleDACChange}
                  />
                )
              }}
              rules={{ required: true }}
            />
            <SectionTitle>3. {t("dacPolicies.selectAdditionalPolicies")}</SectionTitle>
            <Controller
              control={control}
              name="licenses"
              defaultValue={selectedRems.licenses}
              render={({ field }) => {
                const handlePolicyChange = e => {
                  let checkedItems = [...selectedRems.licenses]
                  const checked = parseInt(e.target.value)
                  if (selectedRems.licenses.includes(checked)) {
                    checkedItems.filter(item => item !== checked)
                  } else {
                    checkedItems.push(checked)
                  }

                  field.onChange(checkedItems)
                  setSelectedRems({
                    ...selectedRems,
                    licenses: checkedItems,
                  })
                }
                return (
                  <WizardRemsPolicies
                    {...field}
                    policies={policies}
                    selectedPolicies={selectedRems.licenses}
                    linkedPolicies={linkedPolicies}
                    handlePolicyChange={handlePolicyChange}
                  />
                )
              }}
            />
          </>
        )}
      </Box>
    </Form>
  )
}

const WizardDacPoliciesStep = () => <DacPoliciesForm />

export default WizardDacPoliciesStep
