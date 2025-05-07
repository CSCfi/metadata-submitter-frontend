import React, { useEffect, useState } from "react"

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

import UserDraftTemplateActions from "./UserDraftTemplateActions"

import { setTemplateAccessionIds } from "features/templateAccessionIdsSlice"
import { getTemplates } from "features/templateSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import { ObjectInsideSubmissionWithTags } from "types"
import { formatDisplayObjectType, getItemPrimaryText, getUserTemplates } from "utils"

const UserDraftTemplates: React.FC = () => {
  const dispatch = useAppDispatch()

  const projectId = useAppSelector(state => state.projectId)
  const templates: Array<ObjectInsideSubmissionWithTags> | [] = useAppSelector(
    state => state.templates,
  )
  const objectTypesArray = useAppSelector(state => state.objectTypesArray)
  const templateAccessionIds = useAppSelector(state => state.templateAccessionIds)

  const displayTemplates = getUserTemplates(templates, objectTypesArray)
  type TemplateGroupProps = { draft: { [schema: string]: ObjectInsideSubmissionWithTags[] } }

  useEffect(() => {
    dispatch(getTemplates(projectId))
  }, [dispatch])

  // Render when there is user's draft template(s)
  const DraftList = () => {
    return (
      <React.Fragment>
        {displayTemplates.map(
          (draft: { [key: string]: ObjectInsideSubmissionWithTags[] }, index: number) => (
            <TemplateGroup key={index} draft={draft} />
          ),
        )}
      </React.Fragment>
    )
  }

  const TemplateGroup = (props: TemplateGroupProps) => {
    const { draft } = props

    const [checkedItems, setCheckedItems] = useState<string[]>(templateAccessionIds)

    const handleChange = (accessionId: string) => {
      let items = [...checkedItems]

      checkedItems.find((item: string) => item === accessionId)
        ? (items = items.filter(item => item !== accessionId))
        : items.push(accessionId)

      setCheckedItems(items)
      dispatch(setTemplateAccessionIds(items))
    }

    const schema = Object.keys(draft)[0]
    const [open, setOpen] = useState(true)

    return (
      <FormControl
        key={schema}
        sx={{
          m: 8,
          borderBottom: theme => `0.1rem solid ${theme.palette.secondary.main}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        }}
        data-testid={`form-${schema}`}
      >
        <FormLabel
          sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
          onClick={() => setOpen(!open)}
        >
          <Typography display="inline" variant="subtitle1" color="textPrimary">
            {formatDisplayObjectType(schema)}
          </Typography>
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </FormLabel>

        <Collapse
          sx={{
            borderTop: theme => `0.125rem solid ${theme.palette.secondary.main}`,
            p: 8,
            borderRadius: "0.125rem",
            display: "flex",
            flexDirection: "column",
          }}
          in={open}
          timeout={{ enter: 150, exit: 150 }}
          unmountOnExit
        >
          {draft[schema].map((item: ObjectInsideSubmissionWithTags) => {
            return (
              <Grid
                sx={{
                  display: "flex",
                  flex: "1 0 auto",
                  p: 0,
                  m: 8,
                  borderBottom: theme => `solid 0.1rem ${theme.palette.secondary.main}`,
                  "&:last-child": {
                    border: "none",
                  },
                }}
                container
                key={item.accessionId}
                data-testid={`${item.schema}-item`}
              >
                <Grid>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          checkedItems.find((element: string) => element === item.accessionId) !==
                          undefined
                        }
                        onClick={() => handleChange(item.accessionId)}
                        color="primary"
                        name={item.accessionId}
                        value={item.accessionId}
                      />
                    }
                    label={
                      <ListItemText
                        primary={getItemPrimaryText(item)}
                        secondary={item.accessionId}
                        data-schema={item.schema}
                      />
                    }
                  />
                </Grid>
                <Grid>
                  <UserDraftTemplateActions item={item} />
                </Grid>
              </Grid>
            )
          })}
        </Collapse>
      </FormControl>
    )
  }

  // Renders when user has no draft templates
  const EmptyList = () => (
    <CardContent>
      <Typography align="center" variant="body2">
        Currently there are no draft templates.
      </Typography>
    </CardContent>
  )

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        b: "none",
        p: 0,
      }}
    >
      <CardHeader
        title={"Your Draft Templates"}
        titleTypographyProps={{ variant: "subtitle1", fontWeight: "fontWeightBold" }}
        subheader="You could choose which draft(s) you would like to reuse when creating a new submission."
        sx={{
          fontSize: "0.5em",
          p: 0,
          mt: 8,
          mb: 8,
        }}
      />
      {templates?.length > 0 ? <DraftList /> : <EmptyList />}
    </Card>
  )
}

export default UserDraftTemplates
