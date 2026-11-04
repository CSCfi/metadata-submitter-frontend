import axios, { type AxiosInstance, type AxiosResponse } from "axios"

import { errorMonitor } from "./errorMonitor"

const createApiClient = (baseURL: string): AxiosInstance => {
  const apiClient = axios.create({ baseURL })

  apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    error => {
      errorMonitor(error)
      return Promise.reject(error)
    }
  )

  return apiClient
}

export default createApiClient
