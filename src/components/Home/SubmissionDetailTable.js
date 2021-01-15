//@flow
import React from "react"

// import { makeStyles } from "@material-ui/core/styles"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableContainer from "@material-ui/core/TableContainer"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"

// const useStyles = makeStyles(theme => ({}))

type SubmissionDetailTableProps = {
  headRows: Array<string>,
  bodyRows: Array<string>,
}

const SubmissionDetailTable = (props: SubmissionDetailTableProps) => {
  //   const classes = useStyles()

  return (
    <TableContainer>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            {props.headRows.map((row, index) => (
              <TableCell key={index}>{row}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {props.bodyRows.map((row, index) => (
            <TableRow key={index}>
              <TableCell component="th" scope="row">
                {row}
              </TableCell>
              <TableCell>{row}</TableCell>
              <TableCell>{row}</TableCell>
              <TableCell>{row}</TableCell>
              <TableCell>{row}</TableCell>
              <TableCell>View</TableCell>
              <TableCell>Edit</TableCell>
              <TableCell>Delete</TableCell>
              <TableCell>Show details</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default SubmissionDetailTable
