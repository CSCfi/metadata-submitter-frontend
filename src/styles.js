//@flow
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
  appBar: {
    position: "relative",
    borderBottom: `1px solid ${theme.palette.divider}`,
    alignItems: "flex-end",
    color: "rgb(72,72,72)",
    backgroundColor: "white",
  },
  link: {
    margin: theme.spacing(1, 1.5),
    color: "inherit",
  },
  linkButton: {
    margin: theme.spacing(1, 1.5),
    color: "white",
    padding: "10px 20px",
    backgroundColor: "rgb(121, 131, 204)",
    borderRadius: "20px",
  },
}))

export default useStyles
