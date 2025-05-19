import CardHeader from "@mui/material/CardHeader"
import { styled } from "@mui/material/styles"

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  ...theme.wizard.cardHeader,
  "& .MuiCardHeader-action": {
    margin: "0 !important",
  },
}))

const WizardStepContentHeader = ({ action }: { action?: React.ReactNode }) => (
  <StyledCardHeader action={action} />
)

export default WizardStepContentHeader
