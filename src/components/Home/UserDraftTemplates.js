//@flow
import React, { useState } from "react"

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardHeader from "@mui/material/CardHeader"
import Checkbox from "@mui/material/Checkbox"
import Collapse from "@mui/material/Collapse"
import FormControl from "@mui/material/FormControl"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormLabel from "@mui/material/FormLabel"
import Grid from "@mui/material/Grid"
import ListItemText from "@mui/material/ListItemText"
import Typography from "@mui/material/Typography"
import { makeStyles } from "@mui/styles"
import { useSelector, useDispatch } from "react-redux"

import UserDraftTemplateActions from "./UserDraftTemplateActions"

import { setTemplateAccessionIds } from "features/templatesSlice"
import { formatDisplayObjectType, getUserTemplates, getItemPrimaryText, Pagination } from "utils"

const useStyles = makeStyles(theme => ({
  card: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    border: "none",
    padding: theme.spacing(0),
  },
  cardTitle: {
    fontSize: "0.5em",
    padding: 0,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  form: { display: "flex", flexDirection: "column" },
  formControl: {
    margin: theme.spacing(1),
    borderBottom: `0.1rem solid ${theme.palette.secondary.main}`,
    boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
  },
  formLabel: { display: "flex", justifyContent: "space-between", padding: theme.spacing(2) },
  collapse: {
    borderTop: `0.125rem solid ${theme.palette.secondary.main}`,
    padding: theme.spacing(1),
    borderRadius: "0.125rem",
    display: "flex",
    flexDirection: "column",
  },
  formControlLabel: {
    display: "flex",
    flex: "1 0 auto",
    padding: 0,
    margin: theme.spacing(1, 0),
    borderBottom: `solid 0.1rem ${theme.palette.secondary.main}`,
    "&:last-child": {
      border: "none",
    },
  },
}))

const UserDraftTemplates = (): React$Element<any> => {
  const classes = useStyles()
  const user = useSelector(state => state.user)
  const objectTypesArray = useSelector(state => state.objectTypesArray)
  const templateAccessionIds = useSelector(state => state.templateAccessionIds)

  const dispatch = useDispatch()
  const templates = user.templates ? getUserTemplates(user.templates, objectTypesArray) : []

  // Render when there is user's draft template(s)
  const DraftList = () => {
    const [checkedItems, setCheckedItems] = useState(templateAccessionIds)

    const handleChange = (accessionId: string) => {
      let items = [...checkedItems]

      checkedItems.find(item => item === accessionId)
        ? (items = items.filter(item => item !== accessionId))
        : items.push(accessionId)

      setCheckedItems(items)
      dispatch(setTemplateAccessionIds(items))
    }

    return templates.map(draft => {
      const schema = Object.keys(draft)[0]
      const [open, setOpen] = useState(true)
      // Control Pagination
      const [page, setPage] = useState(0)
      const [itemsPerPage, setItemsPerPage] = useState(10)

      const handleChangePage = (e: any, page: number) => {
        setPage(page)
      }

      const handleItemsPerPageChange = (e: any) => {
        setItemsPerPage(e.target.value)
        setPage(0)
      }

      return (
        <FormControl key={schema} className={classes.formControl} data-testid={`form-${schema}`}>
          <FormLabel className={classes.formLabel} onClick={() => setOpen(!open)}>
            <Typography display="inline" variant="subtitle1" color="textPrimary">
              {formatDisplayObjectType(schema)}
            </Typography>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </FormLabel>

          <Collapse className={classes.collapse} in={open} timeout={{ enter: 150, exit: 150 }} unmountOnExit>
            {draft[schema].slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage).map(item => {
              return (
                <Grid
                  container
                  key={item.accessionId}
                  className={classes.formControlLabel}
                  data-testid={`${item.schema}-item`}
                >
                  <Grid item xs>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checkedItems.find(element => element === item.accessionId) !== undefined}
                          onClick={() => handleChange(item.accessionId)}
                          color="primary"
                          name={item.accessionId}
                          value={item.accessionId}
                        />
                      }
                      label={
                        <ListItemText
                          className={classes.listItemText}
                          primary={getItemPrimaryText(item)}
                          secondary={item.accessionId}
                          data-schema={item.schema}
                        />
                      }
                    />
                  </Grid>
                  <Grid item xs="auto">
                    <UserDraftTemplateActions item={item} />
                  </Grid>
                </Grid>
              )
            })}

            <Pagination
              totalNumberOfItems={draft[schema].length}
              page={page}
              itemsPerPage={itemsPerPage}
              handleChangePage={handleChangePage}
              handleItemsPerPageChange={handleItemsPerPageChange}
            />
          </Collapse>
        </FormControl>
      )
    })
  }

  // Renders when user has no draft templates
  const EmptyList = () => (
    <CardContent className={classes.cardContent}>
      <Typography align="center" variant="body2">
        Currently there are no draft templates.
      </Typography>
    </CardContent>
  )

  return (
    <Card className={classes.card} variant="outlined">
      <CardHeader
        className={classes.cardTitle}
        title={"Your Draft Templates"}
        titleTypographyProps={{ variant: "subtitle1", fontWeight: "fontWeightBold" }}
        subheader="You could choose which draft(s) you would like to reuse when creating a new folder."
      />
      {templates?.length > 0 ? <DraftList /> : <EmptyList />}
    </Card>
  )
}

export default UserDraftTemplates
