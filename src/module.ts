import { addListener, create as createRouter, replace } from "lib/router"
import { initializeFirebase } from "lib/firebase"
import { ModuleImpl } from "lib/modules"

import { State, Actions, FetchProjectPayload } from "./api"
import { isLoading } from "./selectors"
import { bundles } from "bundles/module"
import { editor } from "editor/module"
import { logger } from "logger/module"
import { createProjects } from "projects/module"
import { createSearch } from "lib/search/module"
import { ui } from "ui/module"
import { users } from "users/module"
import { AuthListener } from "users"
import { COLLECTION, Owner } from "projects"
import { getWords } from "lib/search"
import { getProjectsStore } from "getProjectsStore"
import { createProject } from "projects/createProject"
import { createProject as create } from "./createProject"
import { logConfig, logEvent } from "analytics"
import { LOCAL_PROJECT_ID } from "projects/constants"

const router = createRouter()
const projectsStore = getProjectsStore()
const projects = createProjects(projectsStore)
const search = createSearch([{ name: "projects" }])

export const module: ModuleImpl<State, Actions> = {
  state: {
    bundles: bundles.state,
    editor: editor.state,
    logger: logger.state,
    projects: projects.state,
    router: router.state,
    search: search.state,
    ui: ui.state,
    users: users.state
  },
  actions: {
    bundles: bundles.actions,
    editor: editor.actions,
    logger: logger.actions,
    projects: projects.actions,
    router: router.actions,
    search: search.actions,
    ui: ui.actions,
    users: users.actions,

    getState: () => state => state,
    init: () => (_, actions) => {
      initializeFirebase()

      actions.router.init()
      actions.logger.init(actions)
      actions.bundles.init(actions)
      actions.users.init(actions)
      actions.projects.init(actions)
      actions.search.init(actions)
      actions.editor.init(actions)

      const authListener: AuthListener = user => {
        const state = actions.editor.getState()
        const project = state.project
        if (
          user &&
          project &&
          (!project.owner || project.owner.id === user.id)
        ) {
          // currently editing an artifact locally, save it on login
          actions.logger.log(
            actions.editor.setOwner({
              id: user.id,
              displayName: user.displayName
            })
          )
        } else if (!user && project && state.status === "editing") {
          // currently editing own artifact, switch to local mode.
          actions.logger.log(actions.editor.setOwner(null))
        }
      }
      actions.users.initAuthentication([authListener])

      const searchFn = (text, range) => {
        if (!text || text.trim() === "") {
          return projectsStore.query({
            collection: COLLECTION,
            where: [{ attribute: "hidden", op: "==", value: false }],
            first: range.value,
            limit: range.count
          })
        }

        const attribute = "searches." + getWords(text).join("-")
        return projectsStore.query({
          collection: COLLECTION,
          where: [{ attribute, op: ">", value: 0 }],
          orderBy: { attribute, descending: true },
          first: range.value,
          limit: range.count
        })
      }
      actions.search.setSearchFn(searchFn)
      actions.editor.ui.importProjectDialog.search.setSearchFn(searchFn)

      addListener("projects/:id", match => {
        const id = match.params.id
        if (actions.getState().editor.project) {
          return
        }
        if (id === LOCAL_PROJECT_ID) {
          const store = actions.editor.localStore.getState()
          if (store[id]) {
            actions.editor.open(store[id])
          } else {
            create(actions.getState(), actions, "hyperapp")
          }
        }
        actions.logger.log(actions.fetchProject({ id, open: true }))
      })

      addListener("*", match => {
        logConfig({ page_path: match.location })
      })
    },
    createProject: () => (state, actions) => {
      const template = state.ui.createProjectModal
        ? state.ui.createProjectModal.template
        : null
      if (!template) {
        return null
      }
      actions.ui.closeCreateProjectModal()
      const user = state.users.user
      const owner: Owner = user
        ? { id: user.id, displayName: user.displayName }
        : null

      const projectActions = state.users.user
        ? actions.projects
        : actions.editor.localStore

      return createProject({ fetch: actions.projects.fetch, template, owner })
        .then(project => {
          if (state.users.user) {
            return actions.projects.save(project)
          } else {
            return actions.editor.localStore.save(project)
          }
        })
        .then(project => {
          actions.editor.open(project)
          replace("/projects/" + project.details.id)
          logEvent("create_project", {
            event_category: "project",
            event_label: "Create" + template + "ProjectFromHeader"
          })
        })
    },
    fetchProject: (payload: FetchProjectPayload) => (state, actions) => {
      if (isLoading(state)) {
        return
      }
      if (state.editor.project && state.editor.project.id === payload.id) {
        return
      }

      return actions.projects.fetch(payload.id).then(project => {
        if (payload.open) {
          actions.editor.open(project)
        }

        return project
      })
    }
  }
}
