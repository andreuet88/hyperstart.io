import { Searches } from "lib/search"

import { ModuleActions } from "api"

// # Files

export type FileType = "file" | "folder"

export interface File {
  id: string
  type: FileType
  name: string
  parent?: string
  content?: string
  url?: string
  artifactId?: string
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
  owner?: Owner
  mainFile?: string
  hidden?: boolean
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

export interface FileUpdate {
  projectId: string
  id: string
  name?: string
  content?: string
}

export interface DeletedFile {
  projectId: string
  fileId: string
}

export interface DeletePayload {
  files: DeletedFile[]
}

export interface ImportedProject {
  importerId: string
  importedName: string
  files: Files
}

export interface Actions extends ModuleActions<State> {
  // ## Projects
  // TODO createAndSave() and add() are kind of duplicate, we should remove createAndSave()
  createAndSave(template: Template): Promise<Project>
  add(project: Project): Promise<Project>
  update(project: UpdatedProject): Promise<void>
  fetch(id: string): Promise<Project>
  // ## Files
  addFiles(files: File[]): Promise<void>
  updateFiles(updates: FileUpdate[]): Promise<void>
  deleteFiles(files: DeletedFile[]): Promise<void>
  importProjects(projects: ImportedProject[]): Promise<void>
}
