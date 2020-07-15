//@flow
import React from "react"

import Grid from "@material-ui/core/Grid"
import { useSelector } from "react-redux"
import ObjectIndexCard from "components/objectIndexCard"
import ObjectAddCard from "components/objectAddCard"

const NewDraftCard = () => {
  const { objectType } = useSelector(state => state.objectType)
  return (
    <Grid
      container
      direction="row"
      justify="center"
      alignItems="stretch"
      spacing={10}
    >
      <Grid item xs={8}>
        {objectType === "" ? <ObjectIndexCard /> : <ObjectAddCard />}
      </Grid>
    </Grid>
  )
}

export default NewDraftCard
