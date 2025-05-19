import React, { useEffect, useState } from "react"

import { Box, Checkbox, Typography } from "@mui/material"
import { GridColDef, GridSortDirection } from "@mui/x-data-grid"
import { useTranslation } from "react-i18next"

import DataTable from "components/DataTable"
import type { DataFolderRow } from "types"

type WizardRemsPoliciesProps = {
  policies: { id: number; title: string }[]
  selectedPolicies: number[]
  linkedPolicies: number[]
  handlePolicyChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const WizardRemsPolicies = (props: WizardRemsPoliciesProps) => {
  const { t } = useTranslation()
  const { policies, selectedPolicies, linkedPolicies, handlePolicyChange } = props

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("dacPolicies.policyTitle"),
      sortable: true,
      renderCell: params => (
        <Box display="flex" alignItems="center" height="100%">
          <Checkbox
            checked={selectedPolicies.includes(params.row.id)}
            onChange={handlePolicyChange}
            value={params.row.id}
            name={params.row.name}
            inputProps={{ "aria-label": params.row.name }}
            data-testid={params.row.id}
          />
          <Typography component="span">{params.row.name}</Typography>
        </Box>
      ),
    },
  ]

  const getRows = (): DataFolderRow[] => {
    return policies
      .filter(pol => !linkedPolicies.some(id => id === pol.id))
      .map(pol => {
        return {
          id: pol.id,
          name: pol.title,
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
    setTotalItems(policies.length)
  }, [policies.length])

  const fetchPageOnChange = (page: number) => {
    setPage(page)
  }

  return (
    <Box>
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

export default WizardRemsPolicies
