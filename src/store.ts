import { configureStore } from "@reduxjs/toolkit"

import rootReducer from "rootReducer"

const store = configureStore({
  reducer: rootReducer,
})

export const setupStore = () => {
  return store
}

if (process.env.NODE_ENV === "development" && module.hot) {
  module.hot.accept("./rootReducer", async () => {
    const newRootReducer = await (await import("./rootReducer")).default
    store.replaceReducer(newRootReducer)
  })
}

export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore["dispatch"]
