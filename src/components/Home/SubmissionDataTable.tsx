import React from "react"

import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import { GridColDef, GridRowParams, GridActionsCellItem, GridSortDirection } from "@mui/x-data-grid"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"

import DataTable from "components/DataTable"
import { SubmissionStatus } from "constants/wizardSubmission"
import { setSubmission } from "features/wizardSubmissionSlice"
import { useAppDispatch } from "hooks"
import submissionAPIService from "services/submissionAPI"
import { SubmissionRow } from "types"
import { getConvertedDate, pathWithLocale } from "utils"

type SubmissionDataTableProps = {
  submissionType: string
  rows: Array<SubmissionRow>
  page?: number
  itemsPerPage?: number
  totalItems?: number
  fetchItemsPerPage?: (items: number, submissionType: string) => void
  fetchPageOnChange?: (page: number) => Promise<void>
  onDeleteSubmission?: (submissionId: string, submissionType: string) => void
}

const SubmissionDataTable: React.FC<SubmissionDataTableProps> = props => {
  const {
    submissionType,
    page,
    itemsPerPage,
    totalItems,
    fetchPageOnChange,
    fetchItemsPerPage,
    rows,
    onDeleteSubmission,
  } = props
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("dataTable.name"),
      sortable: true,
    },
    {
      field: "dateCreated",
      headerName: t("dataTable.dateCreated"),
      type: "date",
      valueFormatter: value => {
        const { convertedDate } = value as Record<string, string>
        return convertedDate
      },
      valueGetter: value => ({
        convertedDate: getConvertedDate(value),
        timestamp: value,
      }),
      sortComparator: (v1, v2) => v2.timestamp - v1.timestamp,
    },
    {
      field: "lastModifiedBy",
      headerName: t("dataTable.lastModifiedBy"),
      sortable: true,
    },
    {
      field: "actions",
      type: "actions",
      getActions: (params: GridRowParams) =>
        params.row.submissionType === SubmissionStatus.unpublished
          ? [
              <>
                <GridActionsCellItem
                  key={params.id}
                  icon={<EditIcon color="primary" fontSize="large" />}
                  onClick={e => handleEditSubmission(e, params.id)}
                  label={t("edit")}
                  showInMenu
                  data-testid="edit-draft-submission"
                />
              </>,
              <>
                <GridActionsCellItem
                  key={params.id}
                  icon={<DeleteIcon color="primary" fontSize="large" />}
                  onClick={e => handleDeleteSubmission(e, params.id, params.row.submissionType)}
                  label={t("delete")}
                  data-testid="delete-draft-submission"
                  showInMenu
                />
              </>,
            ]
          : [],
    },
  ]

  const sortingModel = [
    {
      field: "dateCreated",
      sort: "asc" as GridSortDirection,
    },
  ]

  const handleEditSubmission = async (e, id) => {
    e.stopPropagation()
    const response = await submissionAPIService.getSubmissionById(id)
    dispatch(setSubmission(response.data))
    navigate({
      pathname: pathWithLocale(`submission/${id}`),
      search: `step=1`,
    })
  }

  const handleDeleteSubmission = async (e, id, submissionType) => {
    e.stopPropagation()
    onDeleteSubmission ? onDeleteSubmission(id, submissionType) : null
  }

  const handleItemsPerPageChange = (items: number) => {
    fetchItemsPerPage ? fetchItemsPerPage(items, submissionType) : null
  }

  return (
    <DataTable
      rows={rows}
      columns={columns}
      page={page}
      sortingModel={sortingModel}
      itemsPerPage={itemsPerPage}
      totalItems={totalItems}
      fetchPageOnChange={fetchPageOnChange}
      fetchItemsPerPage={handleItemsPerPageChange}
    />
  )
}

export default SubmissionDataTable
