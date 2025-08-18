import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import Button from "@mui/material/Button"
import { GridColDef, GridRowParams, GridActionsCellItem, GridSortDirection } from "@mui/x-data-grid"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"

import DataTable from "components/DataTable"
import { SubmissionStatus } from "constants/wizardSubmission"
import { SubmissionRow } from "types"
import { getConvertedDate, pathWithLocale } from "utils"

type SubmissionDataTableProps = {
  submissionType: string
  rows: Array<SubmissionRow>
  page?: number
  itemsPerPage?: number
  totalItems?: number
  fetchPageOnChange?: (page: number) => Promise<void>
  onDeleteSubmission?: (submissionId: string, submissionType: string) => void
}

const SubmissionDataTable: React.FC<SubmissionDataTableProps> = props => {
  const { submissionType, page, totalItems, fetchPageOnChange, rows, onDeleteSubmission } = props
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
              <Button>
                <GridActionsCellItem
                  key={params.id}
                  icon={<EditIcon color="primary" fontSize="large" />}
                  onClick={e => handleEditSubmission(e, params.id)}
                  label={t("edit")}
                  showInMenu
                  data-testid="edit-draft-submission"
                />
              </Button>,
              <Button>
                <GridActionsCellItem
                  key={params.id}
                  icon={<DeleteIcon color="primary" fontSize="large" />}
                  onClick={e => handleDeleteSubmission(e, params.id, params.row.submissionType)}
                  label={t("delete")}
                  data-testid="delete-draft-submission"
                  showInMenu
                />
              </Button>,
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
    navigate({
      pathname: pathWithLocale(`submission/${id}`),
      search: `step=1`,
    })
  }

  const handleDeleteSubmission = async (e, id, submissionType) => {
    e.stopPropagation()
    onDeleteSubmission ? onDeleteSubmission(id, submissionType) : null
  }

  return (
    <DataTable
      key={submissionType}
      rows={rows}
      columns={columns}
      page={page}
      sortingModel={sortingModel}
      totalItems={totalItems}
      fetchPageOnChange={fetchPageOnChange}
    />
  )
}

export default SubmissionDataTable
