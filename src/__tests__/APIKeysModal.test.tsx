import { screen, fireEvent, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { vi } from "vitest"

import APIKeysModal from "components/APIKeysModal"
import { renderWithProviders } from "utils/test-utils"

type KeyProps = {
  key_id: string
  created_at: string
}

const handleClose = vi.fn()

const mockKeys: KeyProps[] = [
  { key_id: "apiTestKey1", created_at: "2025-06-23T10:27:55.640849" },
  { key_id: "apiTestKey2", created_at: "2025-06-23T08:09:30.747808" },
  { key_id: "apiTestKey3", created_at: "2025-06-23T08:09:42.110383" },
  { key_id: "apiTestKey4", created_at: "2025-06-23T12:21:32.887708" },
  { key_id: "apiTestKey5", created_at: "2025-06-23T10:27:55.640849" },
  { key_id: "apiTestKey6", created_at: "2025-06-23T12:22:20.554955" },
  { key_id: "apiTestKey7", created_at: "2025-06-23T12:24:17.838602" },
]

const restHandlers = [
  http.get("/v1/api/keys", () => {
    return HttpResponse.json(mockKeys)
  }),
  http.delete("/v1/api/keys", ({ params }) => {
    const key_name = params.key_id
    return HttpResponse.json(mockKeys.filter(item => item.key_id !== key_name))
  }),
  http.post("/v1/api/keys", async () => {
    return HttpResponse.json("a030151a32ca.itPXpPwFfSYnN9Yx2")
  }),
]

const server = setupServer(...restHandlers)

describe("APIKeysModal", () => {
  beforeAll(() => server.listen())

  beforeEach(async () => {
    renderWithProviders(<APIKeysModal open={true} onClose={handleClose} />)
  })

  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  test("shpuld render the modal", async () => {
    expect(screen.getByText("Create SD Submit API keys")).toBeVisible()
    expect(screen.getByTestId("api-key-create-button")).toHaveTextContent("Create key")
    expect(screen.getByTestId("no-api-keys")).toBeVisible()
  })

  test("should list existing API keys", async () => {
    const keyRows = await waitFor(() => screen.getAllByTestId("api-key-delete"))
    expect(keyRows).toHaveLength(7)
  })

  test("should create a new API key", async () => {
    const apikeyNameField = screen.getByPlaceholderText("Key name")
    const createButton = screen.getByTestId("api-key-create-button")

    fireEvent.change(apikeyNameField, { target: { value: "apiTestKey0" } })
    expect(apikeyNameField).toHaveValue("apiTestKey0")

    await waitFor(() => {
      fireEvent.click(createButton)
      expect(screen.getByTestId("api-key-table")).toHaveTextContent("apiTestKey0")
      expect(screen.getByTestId("api-key-copy")).toBeVisible
      expect(screen.getByTestId("new-key-value")).toHaveTextContent(
        "a030151a32ca.itPXpPwFfSYnN9Yx2"
      )
    })
  })

  test("should delete an existing API key", async () => {
    const buttons = await waitFor(() => screen.getAllByTestId("api-key-delete"))
    expect(buttons.length).toBe(7)

    await waitFor(() => {
      fireEvent.click(buttons[6])
      expect(screen.getAllByTestId("api-key-delete").length).toBe(6)
    })
  })
})
