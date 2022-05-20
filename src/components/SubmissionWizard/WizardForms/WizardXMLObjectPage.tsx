import React from "react"

import Box from "@mui/material/Box"
// import CardHeader from "@mui/material/CardHeader"
import Container from "@mui/material/Container"
import Link from "@mui/material/Link"
import { styled } from "@mui/material/styles"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"

import WizardStepContentHeader from "../WizardComponents/WizardStepContentHeader"

import WizardUploadXMLModal from "./WizardUploadXMLModal"

import { setXMLModalOpen, resetXMLModalOpen } from "features/wizardXMLModalSlice"
import { useAppDispatch, useAppSelector } from "hooks"

const StyledContainer = styled(Container)(() => ({
  padding: "4rem 6rem !important",
  height: "100%",
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  border: `1px solid ${theme.palette.secondary.lightest}`,
  "& th, td": {
    padding: "1.6rem 3.2rem",
    color: theme.palette.secondary.main,
  },
  "& th": { fontSize: "1.4rem" },
  "& td": { fontSize: "1.6rem" },
}))

const WizardXMLObjectPage = () => {
  const dispatch = useAppDispatch()
  const xmlObject = useAppSelector(state => state.currentObject)
  const openedXMLModal = useAppSelector(state => state.openedXMLModal)

  return (
    <>
      <WizardStepContentHeader />
      <StyledContainer disableGutters>
        <Typography variant="h4" role="heading" color="secondary" sx={{ pb: "2.5rem", fontWeight: 700 }}>
          {xmlObject.tags?.fileName}
        </Typography>
        <TableContainer component={Box}>
          <Table>
            <TableHead>
              <StyledTableRow>
                <TableCell width={"25%"}>Name</TableCell>
                <TableCell width={"25%"}>Size</TableCell>
                <TableCell></TableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              <StyledTableRow>
                <TableCell>{xmlObject.tags?.fileName}</TableCell>
                <TableCell>{xmlObject.tags?.fileSize}</TableCell>
                <TableCell align="right">
                  <Link
                    onClick={() => dispatch(setXMLModalOpen(true))}
                    sx={{ mr: "4rem", "&:hover": { cursor: "pointer" } }}
                  >
                    Replace
                  </Link>
                </TableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <WizardUploadXMLModal
          open={openedXMLModal}
          handleClose={() => {
            dispatch(resetXMLModalOpen())
          }}
          currentObject={xmlObject}
        />
      </StyledContainer>
    </>
  )
}

export default WizardXMLObjectPage
