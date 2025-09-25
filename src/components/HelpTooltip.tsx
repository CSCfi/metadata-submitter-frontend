import { useState } from "react"

import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import { styled } from "@mui/material/styles"
import Tooltip, { TooltipProps } from "@mui/material/Tooltip"
import { useTranslation } from "react-i18next"

/*
 * Custom help Tooltip with icon
 */

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} placement="right" arrow classes={{ popper: className }} />
))(({ theme }) => ({
  "& .MuiTooltip-tooltip": {
    padding: "2rem",
    backgroundColor: theme.palette.common.white,
    color: theme.palette.secondary.main,
    fontSize: "1.4rem",
    boxShadow: "0 0.25rem 0.625rem rgba(0, 0, 0, 0.2)",
    border: `0.1rem solid ${theme.palette.secondary.light}`,
    maxWidth: "25rem",
    whiteSpace: "pre-line",
  },
  "& .MuiTooltip-arrow": {
    "&:before": {
      border: `0.1rem solid ${theme.palette.secondary.light}`,
    },
    color: theme.palette.common.white,
  },
}))

const StyledHelpOutlinedIcon = styled(HelpOutlineIcon)(({ theme }) => ({
  marginLeft: "1rem",
  paddingTop: "0.025rem",
  color: theme.palette.primary.main,
}))

const DisplayDescription = ({
  description,
  shortTextLength,
  children,
}: {
  description: string
  shortTextLength: number
  children?: React.ReactElement<unknown>
}) => {
  const { t } = useTranslation()
  const [isReadMore, setIsReadMore] = useState(description.length > shortTextLength)

  const toggleReadMore = () => {
    setIsReadMore(!isReadMore)
  }

  const ReadmoreText = styled("span")(({ theme }) => ({
    fontWeight: 700,
    textDecoration: "underline",
    display: "block",
    marginTop: "0.5rem",
    color: theme.palette.primary.main,
    "&:hover": { cursor: "pointer" },
  }))

  return (
    <p>
      {isReadMore ? `${description.slice(0, shortTextLength)}...` : description}
      {!isReadMore && children}
      {description?.length >= shortTextLength && (
        <ReadmoreText onClick={toggleReadMore}>
          {isReadMore ? t("readMore") : t("readLess")}
        </ReadmoreText>
      )}
    </p>
  )
}

const HelpTooltip = props => {
  const { helpText, placement, shortTextLength = 60 } = props

  return (
    <StyledTooltip
      title={<DisplayDescription description={helpText} shortTextLength={shortTextLength} />}
      placement={placement}
    >
      <StyledHelpOutlinedIcon />
    </StyledTooltip>
  )
}

export default HelpTooltip
