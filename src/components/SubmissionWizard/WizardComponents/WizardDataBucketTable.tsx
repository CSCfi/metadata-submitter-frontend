import React, { useState, useEffect } from "react"

import Box from "@mui/material/Box"
import Radio from "@mui/material/Radio"
import SvgIcon from "@mui/material/SvgIcon"
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
            {/* Use mdiPail path: MUI icons lack a corresponding icon */}
            <SvgIcon
              color="primary"
              fontSize="medium"
              sx={{ ml: "1rem", mr: "0.5rem" }}
              onClick={() => handleFilesView(params.row.name)}
            >
              <path d="M11.5 7.63C11.97 7.35 12.58 7.5 12.86 8C13.14 8.47 12.97 9.09 12.5 9.36L4.27 14.11C3.79 14.39 3.18 14.23 2.9 13.75C2.62 13.27 2.79 12.66 3.27 12.38L11.5 7.63M7 21L5.79 14.97L13.21 10.69C14 10.26 14.5 9.44 14.5 8.5C14.5 7.12 13.38 6 12 6C11.53 6 11.09 6.13 10.71 6.36L4.76 9.79L4 6H3V4H21V6H20L17 21H7Z" />
            </SvgIcon>
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
