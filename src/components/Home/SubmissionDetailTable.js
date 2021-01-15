//@flow
import React from "react"

import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardHeader from "@material-ui/core/CardHeader"
import { makeStyles } from "@material-ui/core/styles"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace"

const useStyles = makeStyles(theme => ({
  backIcon: {
    "&:hover": {
      cursor: "pointer",
    },
  },
  card: {
    border: "none",
    padding: theme.spacing(0),
  },
  cardHeader: {
    fontSize: "0.5em",
    padding: 0,
    marginTop: theme.spacing(1),
    "&:hover": {
      cursor: "pointer",
    },
  },
}))

const headRows = ["Title", "Object type", "Status", "Last modified", "", "", "", ""]

type SubmissionDetailTableProps = {
  bodyRows: Array<any>,
  folderType: string,
  onClickBackIcon: () => void,
}

const SubmissionDetailTable = (props: SubmissionDetailTableProps) => {
  const classes = useStyles()

  return (
    <Card className={classes.card} variant="outlined">
      <CardHeader
        className={classes.cardHeader}
        avatar={<KeyboardBackspaceIcon className={classes.backIcon} onClick={props.onClickBackIcon} />}
        title={`Your ${props.folderType} folders`}
        titleTypographyProps={{ variant: "subtitle1", fontWeight: "fontWeightBold" }}
      />
      <CardContent>
        <TableContainer>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                {headRows.map((row, index) => (
                  <TableCell key={index}>{row}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {props.bodyRows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {row.title}
                  </TableCell>
                  <TableCell>{row.objectType}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.lastModified}</TableCell>
                  <TableCell>View</TableCell>
                  <TableCell>Edit</TableCell>
                  <TableCell>Delete</TableCell>
                  <TableCell>Show details</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default SubmissionDetailTable
