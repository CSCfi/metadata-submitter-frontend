import { createSlice } from "@reduxjs/toolkit"

const initialState: Array<number> = []

const openedRowsSlice = createSlice({
  name: "objectsArraySlice",
  initialState,
  reducers: {
    addRow: (state, action) => state.concat(action.payload),
    removeRow: (state, action) => state.filter(item => item !== action.payload),
    resetRows: () => initialState,
  },
})

export const { addRow, removeRow, resetRows } = openedRowsSlice.actions
export default openedRowsSlice.reducer
