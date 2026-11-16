import React, { useState } from "react"

import FolderIcon from "@mui/icons-material/Folder"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { GridColDef } from "@mui/x-data-grid"
import type { GridSortDirection } from "@mui/x-data-grid"
import { uniqBy } from "lodash"
import { useTranslation } from "react-i18next"

import DataTable from "components/DataTable"
import type { DataFileRow, BucketFile } from "types"
import { formatBytes, isBucketFile } from "utils"

type FilesTableProps = {
  currentFilePath: string
  files: BucketFile[]
  handleClickFileRow: (path: string, name: string) => void
}

/*
 * Render a table of files inside shared buckets received from SD Connect
 */
const FilesTable: React.FC<FilesTableProps> = props => {
  const { currentFilePath, files, handleClickFileRow } = props
  const { t } = useTranslation()

  const [page, setPage] = useState<number>(0)

  const sortingModel = [
    {
      field: "name",
      sort: "asc" as GridSortDirection,
    },
  ]

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("dataTable.name"),
      sortable: true,
      renderCell: params => {
        return (
          <Box
            display="flex"
            alignItems="center"
            height="100%"
            onClick={() => handleClickFileRow(params.row.id, params.row.name)}
          >
            {!isBucketFile(files, params.row.id) && (
              <FolderIcon color="primary" fontSize="medium" sx={{ mr: "0.5rem" }} />
            )}
            <Typography component="span">{params.row.name}</Typography>
          </Box>
        )
      },
    },
    {
      field: "size",
      headerName: t("dataTable.size"),
      type: "number",
      sortable: true,
      valueFormatter: (value: number) => formatBytes(value),
    },
    {
      field: "lastModified",
      headerName: t("dataTable.lastModified"),
      sortable: true, // TODO when backend is ready
    },
  ]

  const getDisplayingFiles = (): (BucketFile & { name: string })[] | [] => {
    const pathPrefix = `${currentFilePath}/`
    const displayingFiles = currentFilePath
      ? files
          .filter(file => file.path.startsWith(pathPrefix))
          .map(file => {
            const name = file.path.slice(pathPrefix.length).split("/")[0]
            const path = `${pathPrefix}${name}`
            return { ...file, path, name }
          })
      : []
    return uniqBy(displayingFiles, "path")
  }

  const getRows = (): DataFileRow[] => {
    const displayingFiles = getDisplayingFiles()
    return displayingFiles.map(file => {
      return {
        id: file.path,
        name: file.name,
        size: file.bytes,
        lastModified: "TBD",
      }
    })
  }

  const fetchPageOnChange = (page: number) => {
    setPage(page)
  }

  return (
    <DataTable
      rows={getRows()}
      columns={columns}
      page={page}
      sortingModel={sortingModel}
      totalItems={getDisplayingFiles().length}
      fetchPageOnChange={fetchPageOnChange}
    />
  )
}

export default FilesTable
