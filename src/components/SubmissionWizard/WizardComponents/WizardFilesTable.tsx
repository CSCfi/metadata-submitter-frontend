import React, { useState } from "react"

import FolderIcon from "@mui/icons-material/Folder"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { GridColDef } from "@mui/x-data-grid"
import type { GridSortDirection } from "@mui/x-data-grid"
import { uniqBy, upperFirst } from "lodash"
import { useTranslation } from "react-i18next"

import DataTable from "components/DataTable"
import type { DataFileRow, File } from "types"
import { isFile } from "utils"

type FilesTableProps = {
  currentFilePath: string
  files: File[]
  handleClickFileRow: (path: string, name: string) => void
}

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
            {!isFile(files, params.row.id) && (
              <FolderIcon color="primary" fontSize="medium" sx={{ mr: "0.5rem" }} />
            )}
            <Typography component="span">{upperFirst(params.row.name)}</Typography>
          </Box>
        )
      },
    },
    {
      field: "size",
      headerName: t("dataTable.size"),
      type: "number",
      sortable: true, // TODO: need to convert sizes to humanreadable bytes
    },
    {
      field: "lastModified",
      headerName: t("dataTable.lastModified"),
      sortable: true, // TODO when backend is ready
    },
  ]

  const getDisplayingFiles = () => {
    const displayingFiles = currentFilePath
      ? files
          .filter(file => file.path.includes(currentFilePath))
          .map(file => {
            let newName = ""
            let newPath = ""
            if (file.path.length > currentFilePath.length) {
              newName = file.path.split(currentFilePath)[1].split("/")[1]
              newPath = `${currentFilePath}/${newName}`
            } else {
              newName = file.name
              newPath = file.path
            }
            return { ...file, path: newPath, name: newName }
          })
      : files
    return uniqBy(displayingFiles, "path")
  }

  const getRows = (): DataFileRow[] => {
    const displayingFiles = getDisplayingFiles()
    return displayingFiles
      .map(file => {
        return {
          id: file.path,
          name: file.name,
          size: file.bytes,
          lastModified: "",
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
