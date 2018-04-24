import { Searches } from "lib/search"

import { ModuleActions } from "api"
import { Bundle } from "lib/bundler"

// # Files

export type FileType = "file" | "folder"

// export interface FileProject {
//   id: string
//   version?: string
//   mainFile?: string
//   // storageUrl?: string  // TODO later!
// }

export interface File {
  id: string
  type: FileType
  name: string
  parent?: string
  // files
  content?: string
  url?: string
  // folders
  // project?: FileProject
}

export interface Files {
  [id: string]: File
}

// # Project

export type Template = "hyperapp" | "blank"

export interface Owner {
  id: string
  displayName: string
  url?: string
}

export interface Details {
  id: string
  name: string
  searches: Searches
  hidden: boolean
  owner?: Owner
  mainFile?: string
  url?: string
  version?: string
}

export interface Status {
  loading?: boolean
  error?: string
}

export interface Project {
  details: Details
  status: Status
  files?: Files
}

// # State

export interface State {
  [id: string]: Project
}

// # Actions

export interface UpdatedProject {
  id: string
  owner?: Owner
  name?: string
}

export interface AddFilesPayload {
  id: string
  files: File[]
}

export interface FileUpdate {
  id: string
  name?: string
  content?: string
}

export interface UpdateFilesPayload {
  id: string
  files: FileUpdate[]
}

export interface DeleteFilesPayload {
  id: string
  files: string[]
}

export interface ImportedProject {
  id: string
  name: string
  version?: string
  files: Files
}

export interface ImportProjectsPayload {
  id: string
  projects: ImportedProject[]
}

export interface ImportBundlePayload {
  id: string
  bundle: Bundle
}

export interface Actions extends ModuleActions<State> {
  // ## Projects
  save(project: Project): Promise<Project>
  update(project: UpdatedProject): Promise<Project>
  fetch(id: string): Promise<Project>
  // ## Files
  addFiles(payload: AddFilesPayload): Promise<void>
  updateFiles(payload: UpdateFilesPayload): Promise<void>
  deleteFiles(payload: DeleteFilesPayload): Promise<void>
  importProjects(payload: ImportProjectsPayload): Promise<void>
  importBundle(payload: ImportBundlePayload): Promise<void>
}
