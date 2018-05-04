import * as api from "./api"
import { Project, Files, NEW_PROJECT_ID } from "projects"

import { configureFor } from "./monaco"
import { PROJECT_TAB_ID } from "./constants"
import { State } from "./api"

import { debug } from "./debug/module"
import { ui } from "./ui/module"
import { getFileTree } from "./getFileTree"

function getStatus(project: Project, actions: api.InternalActions): api.Status {
  const details = project.details
  if (details.id === NEW_PROJECT_ID) {
    return "local-only"
  }
  const user = actions._users.getCurrentUserSync()
  if (user && user.id === details.owner.id) {
    return "editing"
  }

  return "read-only"
}

export function openProject(
  state: api.State,
  actions: api.InternalActions,
  project: Project
): Partial<State> {
  if (state.project && state.project.details.id !== project.details.id) {
    actions.close()
  }

  configureFor(project.files, true)

  const mainPath = project.details.mainPath
  const index = project.files[mainPath]

  const result: State = {
    ...state,
    original: project,
    project,
    selectedSources: index ? [mainPath] : [],
    openedSources: index ? [mainPath] : [],
    status: getStatus(project, actions),
    expandedFolders: { "/": true },
    ui: {
      selectedViewPaneTab: PROJECT_TAB_ID,
      projectName: project.details.name
    }
  }

  result.fileTree = getFileTree(result)

  return result
}
