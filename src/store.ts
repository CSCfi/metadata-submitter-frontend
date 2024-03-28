import { configureStore } from "@reduxjs/toolkit"

import rootReducer from "rootReducer"

const store = configureStore({
  reducer: rootReducer,
})

export const setupStore = () => {
  return store
}

if (import.meta.env.NODE_ENV === "development" && import.meta.hot) {
  import.meta.hot.accept("./rootReducer", async () => {
    const newRootReducer = await (await import("./rootReducer")).default
    store.replaceReducer(newRootReducer)
  })
}

export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore["dispatch"]
