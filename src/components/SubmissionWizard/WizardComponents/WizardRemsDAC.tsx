import React, { useEffect, useState } from "react"

import { Box, Radio, Typography } from "@mui/material"
import { GridColDef, GridSortDirection } from "@mui/x-data-grid"
import { useTranslation } from "react-i18next"

import DataTable from "components/DataTable"
import type { DataFolderRow } from "types"

type WizardRemsDACProps = {
  dacs: { id: number; title: string; policies: { id: number; title: string }[] }[]
  selectedDAC: number | null
  handleDACChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const WizardRemsDAC = (props: WizardRemsDACProps) => {
  const { t } = useTranslation()
  const { dacs, selectedDAC, handleDACChange } = props

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("dacPolicies.dacTitle"),
      sortable: true,
      renderCell: params => (
        <Box display="flex" alignItems="center" height="100%">
          <Radio
            checked={selectedDAC === params.row.id}
            onChange={handleDACChange}
            value={params.row.id}
            inputProps={{ "aria-label": params.row.name }}
            data-testid={params.row.id}
          />
          <Typography component="span">{params.row.name}</Typography>
        </Box>
      ),
    },
    {
      field: "policies",
      headerName: t("dacPolicies.linkedPolicies"),
      type: "string",
    },
  ]

  const getRows = (): DataFolderRow[] => {
    return dacs.map(dac => {
      const linkedPolicies = dac.policies.map(pol => pol.title).join(",")
      return {
        id: dac.id,
        name: dac.title,
        policies: linkedPolicies,
      }
    })
  }

  const sortingModel = [
    {
      field: "name",
      sort: "asc" as GridSortDirection,
    },
  ]

  const [page, setPage] = useState<number>(0)
  const [totalItems, setTotalItems] = useState<number>(0)

  useEffect(() => {
    setTotalItems(dacs.length)
  }, [dacs.length])

  const fetchPageOnChange = (page: number) => {
    setPage(page)
  }

  return (
    <Box data-testid="dacs">
      <DataTable
        rows={getRows()}
        columns={columns}
        page={page}
        sortingModel={sortingModel}
        totalItems={totalItems}
        fetchPageOnChange={fetchPageOnChange}
      />
    </Box>
  )
}

export default WizardRemsDAC
