import React from "react"

import { TableBody } from "@mui/material"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import { styled } from "@mui/material/styles"
import Table from "@mui/material/Table"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"

// import { setCurrentObject } from "features/wizardCurrentObjectSlice"

import WizardUploadXMLModal from "./WizardUploadXMLModal"

import { setXMLModalOpen, resetXMLModalOpen } from "features/wizardXMLModalSlice"
import { useAppDispatch, useAppSelector } from "hooks"

const StyledContainer = styled(Container)(() => ({
  padding: "4rem 6rem",
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  border: `1px solid ${theme.palette.secondary.lightest}`,
  "& th, td": {
    padding: "1.6rem 3.2rem",
    color: theme.palette.secondary.main,
  },
}))

const WizardXMLObjectPage = () => {
  const dispatch = useAppDispatch()
  const xmlObject = useAppSelector(state => state.currentObject)
  const openedXMLModal = useAppSelector(state => state.openedXMLModal)

  return (
    <StyledContainer disableGutters>
      <Typography variant="h4" role="heading" color="secondary" sx={{ pb: "2.5rem", fontWeight: 700 }}>
        {xmlObject.tags?.displayTitle}
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
              <TableCell>
                <Button variant="outlined" onClick={() => dispatch(setXMLModalOpen(true))}>
                  Replace
                </Button>
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
  )
}

export default WizardXMLObjectPage
