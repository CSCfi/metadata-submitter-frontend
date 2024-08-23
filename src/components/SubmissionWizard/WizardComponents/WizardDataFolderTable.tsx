import React, { useState, useEffect } from "react"

import FolderIcon from "@mui/icons-material/Folder"
import Box from "@mui/material/Box"
import Radio from "@mui/material/Radio"
import Typography from "@mui/material/Typography"
import { GridColDef } from "@mui/x-data-grid"
import type { GridSortDirection } from "@mui/x-data-grid"
import { upperFirst } from "lodash"
import { useTranslation } from "react-i18next"

import { files } from "../../../../playwright/fixtures/files_response" // MOCK files array

import DataTable from "components/DataTable"
import { ResponseStatus } from "constants/responseStatus"
import { updateStatus } from "features/statusMessageSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import filesAPIService from "services/filesAPI"
import type { DataFolderRow } from "types"

type DataFolderTableProps = {
  selectedFolder: string
  linkedFolder: string
  handleFolderChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const DataFolderTable: React.FC<DataFolderTableProps> = props => {
  const { selectedFolder, linkedFolder, handleFolderChange } = props
  const projectId = useAppSelector(state => state.projectId)
  const dispatch = useAppDispatch()

  const { t } = useTranslation()

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: t("dataTable.name"),
      sortable: true,
      renderCell: params => {
        return (
          <Box display="flex" alignItems="center" height="100%">
            {!linkedFolder && (
              <Radio
                checked={selectedFolder === params.row.name}
                onChange={handleFolderChange}
                value={params.row.name}
                name="radio-buttons"
                inputProps={{ "aria-label": params.row.name }}
              />
            )}
            <FolderIcon color="primary" fontSize="large" sx={{ ml: "1rem", mr: "0.5rem" }} />
            <Typography component="span" onClick={handleFilesView}>
              {upperFirst(params.row.name)}
            </Typography>
          </Box>
        )
      },
    },
    {
      field: "items",
      headerName: t("dataTable.totalItems"),
      type: "number",
    },
    {
      field: "size",
      headerName: t("dataTable.size"),
      sortable: true, // TODO: need to convert sizes to humanreadable bytes
    },
  ]

  useEffect(() => {
    let isMounted = true
    const getFiles = async () => {
      if (isMounted) {
        try {
          const response = await filesAPIService.getProjectFiles(projectId)
          const files = response.data
          sessionStorage.setItem("files", JSON.stringify(files))
          // TODO: consider saving files in redux instead of sessionStorage if needed
        } catch (error) {
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: error,
              helperText: "",
            })
          )
        }
      }
    }
    getFiles()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    !linkedFolder ? setTotalItems(getFolderNames().length) : setTotalItems(1)
  }, [linkedFolder])

  const getRows = (): DataFolderRow[] => {
    const folderNames = getFolderNames()
    return folderNames
      .filter(folderName => (!!linkedFolder ? folderName === linkedFolder : folderName))
      .map(folderName => {
        const currentFiles = files.filter(file => file.path.includes(`/${folderName}/`))
        const totalSize = currentFiles.reduce((acc, currentFile) => acc + currentFile["bytes"], 0)
        return {
          id: folderName,
          name: folderName,
          size: totalSize,
          items: currentFiles.length,
        }
      })
  }

  const getFolderNames = () => [...new Set(files.map(file => file["path"].split("/")[1]))]

  const sortingModel = [
    {
      field: "name",
      sort: "asc" as GridSortDirection,
    },
  ]

  const [page, setPage] = useState<number>(0)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [itemsPerPage, setItemsPerPage] = useState<number>(5)

  const handleFilesView = () => {
    // TODO: show files inside each folder
  }

  const fetchPageOnChange = (page: number) => {
    setPage(page)
  }

  const fetchItemsPerPage = (numberOfItems: number) => {
    setItemsPerPage(numberOfItems)
    setPage(0)
  }

  return (
    <DataTable
      rows={getRows()}
      columns={columns}
      page={page}
      sortingModel={sortingModel}
      itemsPerPage={itemsPerPage}
      totalItems={totalItems}
      fetchPageOnChange={fetchPageOnChange}
      fetchItemsPerPage={fetchItemsPerPage}
    />
  )
}

export default DataFolderTable
