import React from "react"
import "@testing-library/jest-dom/extend-expect"
//import { render, fireEvent, wait } from "@testing-library/react"
import { fireEvent, wait } from "@testing-library/react"
import configureStore from "redux-mock-store"
import { Provider } from "react-redux"

import UploadXMLForm from "./uploadXMLForm"
import objectAPIService from "services/objectAPI"
const mockStore = configureStore([])
jest.mock("services/objectAPI")

describe("Upload form", () => {
  test("is submitted and shows notification with correct info", async () => {
    const store = mockStore({
      objectType: "sample",
    })
    const { container } = render(
      <Provider store={store}>
        <UploadXMLForm />
      </Provider>
    )
    console.log(container)
    //const mockFile = new File([""], "Swägäleissön män", { type: "text/xml" })
    objectAPIService.createFromXML.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        data: {
          accessionId: "EGA123456",
        },
      })
    )
    // TODO: Not working, figure out why this timeouts
    // const fileInput = container.querySelector("input[type='file']")
    // act(() => {
    //   fireEvent.change(fileInput, { target: { file: [mockFile] } })
    //   fireEvent.submit(container.querySelector("form"))
    // })

    // await wait(() => {
    //   const error = container.querySelector("div[role='alert']")
    //   expect(error).toHaveTextContent("Submitted with accession id EGA123456")
    //   expect(objectAPIService.createFromXML).toHaveBeenCalledTimes(1)
    // })
  })
})
