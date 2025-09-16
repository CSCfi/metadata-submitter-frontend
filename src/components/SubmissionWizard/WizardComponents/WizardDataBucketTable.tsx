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
import type { DataBucketRow } from "types"

type DataBucketTableProps = {
  selectedBucket: string
  bucket: string
  handleBucketChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleFilesView: (bucketName: string) => void
}

/*
 * Render a table of shared buckets received from SD Connect
 */
const WizardDataBucketTable: React.FC<DataBucketTableProps> = props => {
  const { selectedBucket, bucket, handleBucketChange, handleFilesView } = props
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
            {!bucket && (
              <Radio
                checked={selectedBucket === params.row.name}
                onChange={handleBucketChange}
                value={params.row.name}
                name="radio-buttons"
                inputProps={{ "aria-label": params.row.name }}
              />
            )}
            <FolderIcon
              color="primary"
              fontSize="medium"
              sx={{ ml: "1rem", mr: "0.5rem" }}
              onClick={() => handleFilesView(params.row.name)}
            />
            <Typography component="span" onClick={() => handleFilesView(params.row.name)}>
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
    !bucket ? setTotalItems(getBucketNames().length) : setTotalItems(1)
  }, [bucket])

  const getRows = (): DataBucketRow[] => {
    const bucketNames = getBucketNames()
    return bucketNames
      .filter(bucketName => (!!bucket ? bucketName === bucket : bucketName))
      .map(bucketName => {
        const currentFiles = files.filter(file => file.path.includes(`/${bucketName}/`))
        const totalSize = currentFiles.reduce((acc, currentFile) => acc + currentFile["bytes"], 0)
        return {
          id: bucketName,
          name: bucketName,
          size: totalSize,
          items: currentFiles.length,
        }
      })
  }

  const getBucketNames = () => [...new Set(files.map(file => file["path"].split("/")[1]))]

  const sortingModel = [
    {
      field: "name",
      sort: "asc" as GridSortDirection,
    },
  ]

  const [page, setPage] = useState<number>(0)
  const [totalItems, setTotalItems] = useState<number>(0)

  const fetchPageOnChange = (page: number) => {
    setPage(page)
  }

  return (
    <DataTable
      rows={getRows()}
      columns={columns}
      page={page}
      sortingModel={sortingModel}
      totalItems={totalItems}
      fetchPageOnChange={fetchPageOnChange}
    />
  )
}

export default WizardDataBucketTable
