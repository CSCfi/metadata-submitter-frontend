import type { ElementRef } from "react"

export type ObjectDetails = {
  accessionId: string
  lastModified: string
  objectType: string
  status: string
  title: string
  submissionType: string
}

export type FolderId = {
  folderId: string
}

export type ObjectInsideFolder = {
  accessionId: string
  schema: string
}

export type ObjectTags = {
  submissionType?: string
  fileName?: string
  displayTitle?: string
}

export type ObjectInsideFolderWithTags = ObjectInsideFolder & { tags: ObjectTags }

export type FolderDetails = {
  name: string
  description: string
  published: boolean
  drafts: Array<ObjectInsideFolder>
  metadataObjects: Array<ObjectInsideFolder>
  allObjects?: Array<ObjectDetails>
}

export type FolderDetailsWithId = FolderId & FolderDetails

export type FolderDataFromForm = {
  name: string
  description: string
}

export type CreateFolderFormRef = ElementRef<any>

export type StatusDetails = {
  status: string
  response?: any
  helperText?: string
}
