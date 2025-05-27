import Typography from "@mui/material/Typography"

type DraftHeaderProps = {
  headerText: string
}

/**
 * Render header component for wizards.
 */
const WizardHeader: React.FC<DraftHeaderProps> = ({ headerText }: DraftHeaderProps) => {
  return (
    <Typography
      sx={{
        fontWeight: "bold",
        color: "#FFF",
        width: "100%",
        p: 2,
        bgcolor: theme => theme.palette.primary.light,
      }}
      component="h1"
      variant="h6"
      align="center"
    >
      {headerText}
    </Typography>
  )
}

export default WizardHeader
