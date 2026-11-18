import { screen, fireEvent, waitFor, within } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"

import WizardDataBucketStep from "components/SubmissionWizard/WizardSteps/WizardDataBucketStep"
import type { BucketFile } from "types"
import { addApiPrefix } from "utils/getConfig"
import { renderWithProviders } from "utils/test-utils"

const bucketsPath: string = await addApiPrefix("/v1/buckets")

const mockBuckets: string[] = ["bucket2", "bucket1"]

const mockFiles: BucketFile[] = [
  { path: "S3://bucket1/file1.txt", bytes: 100 },
  { path: "S3://bucket1/folder1/file2.txt", bytes: 200 },
]

const requests: string[] = []

const restHandlers = [
  http.get(bucketsPath, () => HttpResponse.json(mockBuckets)),
  http.head(`${bucketsPath}/:bucketName`, ({ params }) => {
    requests.push(`HEAD ${params.bucketName}`)
    return new HttpResponse(null, { status: 200 })
  }),
  http.put(`${bucketsPath}/:bucketName`, ({ params }) => {
    requests.push(`PUT ${params.bucketName}`)
    return new HttpResponse(null, { status: 200 })
  }),
  http.get(`${bucketsPath}/:bucketName/files`, ({ params }) => {
    requests.push(`GET ${params.bucketName}/files`)
    return HttpResponse.json(mockFiles)
  }),
]

const server = setupServer(...restHandlers)

describe("Buckets", () => {
  beforeAll(() => server.listen())
  beforeEach(() => {
    renderWithProviders(<WizardDataBucketStep />)
  })
  afterEach(() => {
    server.resetHandlers()
    requests.length = 0
  })
  afterAll(() => server.close())

  test("should list the project's buckets", async () => {
    expect(await screen.findByText("bucket1")).toBeInTheDocument()
    expect(screen.getByText("bucket2")).toBeInTheDocument()
    expect(screen.queryByTestId("folder-breadcrumb")).not.toBeInTheDocument()
  })

  test("should enable link button after selecting a bucket", async () => {
    const linkButton = await screen.findByTestId("link-data-bucket")
    expect(linkButton).toBeDisabled()

    const bucketRadio = screen.getByRole("radio", { name: "bucket1" })
    fireEvent.click(bucketRadio)

    expect(bucketRadio).toBeChecked()
    expect(linkButton).toBeEnabled()
  })

  test("should list files and folders when clicking a bucket", async () => {
    fireEvent.click(await screen.findByText("bucket1"))

    expect(await screen.findByText("file1.txt")).toBeInTheDocument()
    expect(screen.getByText("folder1")).toBeInTheDocument()
    expect(screen.queryByText("bucket2")).not.toBeInTheDocument()

    const breadcrumbs = screen.getByTestId("folder-breadcrumb")
    expect(within(breadcrumbs).getByText("All buckets")).toBeInTheDocument()
    expect(within(breadcrumbs).getByText("bucket1")).toBeInTheDocument()

    expect(requests).toEqual(["HEAD bucket1", "GET bucket1/files"])
  })

  test("should navigate into a folder and back to bucket list via breadcrumbs", async () => {
    fireEvent.click(await screen.findByText("bucket1"))
    fireEvent.click(await screen.findByText("folder1"))

    expect(await screen.findByText("file2.txt")).toBeInTheDocument()
    expect(screen.queryByText("file1.txt")).not.toBeInTheDocument()

    fireEvent.click(screen.getByText("All buckets"))

    await waitFor(() => expect(screen.queryByTestId("folder-breadcrumb")).not.toBeInTheDocument())
    expect(screen.getByText("bucket2")).toBeInTheDocument()
  })

  test("should grant bucket access when access check returns 403", async () => {
    server.use(
      http.head(`${bucketsPath}/:bucketName`, ({ params }) => {
        requests.push(`HEAD ${params.bucketName}`)
        return new HttpResponse(null, { status: 403 })
      })
    )

    fireEvent.click(await screen.findByText("bucket1"))

    expect(await screen.findByText("file1.txt")).toBeInTheDocument()
    expect(requests).toEqual(["HEAD bucket1", "PUT bucket1", "GET bucket1/files"])
  })
})
