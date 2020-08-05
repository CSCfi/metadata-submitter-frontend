//@flow
import React from "react"
import { useDispatch, useSelector } from "react-redux"

import Tabs from "@material-ui/core/Tabs"
import Tab from "@material-ui/core/Tab"
import { makeStyles } from "@material-ui/core/styles"
import { setObjectType } from "features/objectTypeSlice"

const useStyles = makeStyles(theme => ({
  index: {
    alignSelf: "flex-start",
    marginBottom: theme.spacing(2),
  },
  tab: {
    border: `1px solid ${theme.palette.divider}`,
    textTransform: "none",
    color: theme.palette.common.black,
    fontWeight: "bold",
    marginTop: theme.spacing(1),
    boxShadow: `0 1px 1px 1px ${theme.palette.grey[200]}`,
  },
}))

/**
 * Render tabs for choosing which object type to add.
 */
const ObjectIndexTabs = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { objectType } = useSelector(state => state.objectType)
  const objectTypes = ["study", "sample", "experiment", "run", "analysis", "dac", "policy", "dataset"]

  return (
    <div className={classes.index}>
      <Tabs
        orientation="vertical"
        value={objectType === "" ? false : objectType}
        indicatorColor="primary"
        textColor="primary"
        onChange={(_, type) => dispatch(setObjectType(type))}
      >
        {objectTypes.map(type => {
          const typeCapitalized = type[0].toUpperCase() + type.substring(1)
          return <Tab label={typeCapitalized} value={type} key={type} className={classes.tab} />
        })}
      </Tabs>
    </div>
  )
}

export default ObjectIndexTabs
