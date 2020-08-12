//@flow
import React, { useState } from "react"
//import { useDispatch, useSelector } from "react-redux"

import { makeStyles } from "@material-ui/core/styles"
//import { setObjectType } from "features/objectTypeSlice"
import MuiAccordion from "@material-ui/core/Accordion"
import MuiAccordionSummary from "@material-ui/core/AccordionSummary"
import MuiAccordionDetails from "@material-ui/core/AccordionDetails"
import { withStyles } from "@material-ui/core/styles"
import NoteAddIcon from "@material-ui/icons/NoteAdd"

const useStyles = makeStyles(theme => ({
  index: {
    alignSelf: "flex-start",
    marginBottom: theme.spacing(2),
    width: theme.spacing(30),
  },
}))

// Customized accordion from https://material-ui.com/components/accordion/#customized-accordions
const Accordion = withStyles({
  root: {
    border: "1px solid rgba(0, 0, 0, .125)",
    boxShadow: "none",
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      margin: "auto",
    },
  },
  expanded: {},
})(MuiAccordion)

const AccordionSummary = withStyles(theme => ({
  root: {
    backgroundColor: theme.palette.grey["800"],
    borderBottom: "1px solid rgba(0, 0, 0, .125)",
    height: 56,
    marginBottom: -1,
    "&$expanded": {
      minHeight: 56,
    },
  },
  content: {
    color: "white",
    fontWeight: "bold",
    "&$expanded": {
      margin: `${theme.spacing(2)} 0`,
    },
    "& .MuiSvgIcon-root": {
      marginRight: theme.spacing(2),
    },
  },
  expanded: {},
}))(MuiAccordionSummary)

const AccordionDetails = withStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiAccordionDetails)

/**
 * Render tabs for choosing which object type to add.
 */
const ObjectIndex = () => {
  const classes = useStyles()
  //const dispatch = useDispatch()
  //const objectType = useSelector(state => state.objectType)
  const objectTypes = ["study", "sample", "experiment", "run", "analysis", "dac", "policy", "dataset"]

  const [expanded, setExpanded] = useState("")

  const handleChange = panel => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false)
  }

  return (
    <div className={classes.index}>
      {objectTypes.map(type => {
        const typeCapitalized = type[0].toUpperCase() + type.substring(1)
        return (
          <Accordion key={type} square expanded={expanded === type} onChange={handleChange(type)}>
            <AccordionSummary aria-controls="type-content" id="type-header">
              <NoteAddIcon /> {typeCapitalized}
            </AccordionSummary>
            <AccordionDetails>1 2 3</AccordionDetails>
          </Accordion>
        )
      })}
    </div>
  )
}

export default ObjectIndex
