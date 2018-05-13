import { Searches } from "lib/search"
import { Bundle } from "lib/bundle"

import * as users from "users"
import { ModuleActions } from "api"

// # Files

export interface File {
  edits: number
  content: string
}

export interface Files {
  [path: string]: File
}

// # Project

export type Template = "hyperapp" | "blank"

export interface ProjectOwner {
  id: string
  displayName?: string
  anonymous?: boolean
}

export interface ProjectDetails {
  id: string
  name: string
  hidden: boolean
  searches: any
  mainPath: string
  owner: ProjectOwner
  filesUrls: string
}

export interface Project {
  details: ProjectDetails
  files: Files
}

// # State

export interface State {
  [projectId: string]: Project | "loading"
}

// # Actions

export interface Actions extends ModuleActions<State> {
  // ## Project
  fetch(id: string): Promise<Project>
  save(project: Project): Promise<Project>
}

export interface _SetProjectPayload {
  id: string
  project?: Project | "loading"
}

export interface InternalActions extends Actions {
  _users: users.Actions
  _setProject(payload: _SetProjectPayload)
}
