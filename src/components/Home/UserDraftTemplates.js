//@flow
import React, { useState } from "react"

import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardHeader from "@material-ui/core/CardHeader"
import Checkbox from "@material-ui/core/Checkbox"
import Collapse from "@material-ui/core/Collapse"
import FormControl from "@material-ui/core/FormControl"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import FormLabel from "@material-ui/core/FormLabel"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp"
import { useForm, FormProvider, useFormContext, Controller } from "react-hook-form"
import { useSelector, useDispatch } from "react-redux"

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

  const methods = useForm()

  const ConnectForm = ({ children }) => {
    const methods = useFormContext()
    return children({ ...methods })
  }

  // Render when there is user's draft template(s)
  const DraftList = () => {
    const [checkedItems, setCheckedItems] = useState(templateAccessionIds)

    const handleChange = () => {
      const checkedItems = Object.values(methods.getValues()).filter(item => item)
      setCheckedItems(checkedItems)
      dispatch(setTemplateAccessionIds(checkedItems))
    }

    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit} onChange={handleChange} className={classes.form}>
          <ConnectForm>
            {({ register }) => {
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
                      <Controller
                        name={"Collapse"}
                        render={() => {
                          return draft[schema]
                            .slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage)
                            .map(item => {
                              const { ref, ...rest } = register(item.accessionId)
                              return (
                                <FormControlLabel
                                  key={item.accessionId}
                                  className={classes.formControlLabel}
                                  control={
                                    <Checkbox
                                      checked={checkedItems.find(element => element === item.accessionId) !== undefined}
                                      color="primary"
                                      name={item.accessionId}
                                      value={item.accessionId}
                                      inputRef={ref}
                                      {...rest}
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
                              )
                            })
                        }}
                      />

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
            }}
          </ConnectForm>
        </form>
      </FormProvider>
    )
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
