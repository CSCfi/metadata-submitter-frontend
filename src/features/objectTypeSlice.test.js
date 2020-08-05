import objectTypeReducer, { initialState, setObjectType } from "./objectTypeSlice"

describe("objectType slices reducers, actions and selectors", () => {
  test("should return the initial state on first run", () => {
    const nextState = initialState
    const result = objectTypeReducer(undefined, {})
    expect(result).toEqual(nextState)
  })

  test("should properly set the state when objectType is changed", () => {
    const nextState = {
      objectType: "sample",
    }
    const result = objectTypeReducer(initialState, setObjectType("sample"))
    expect(result).toEqual(nextState)
  })
})
