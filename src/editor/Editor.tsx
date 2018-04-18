import { h } from "hyperapp"

import { SplitPane } from "lib/components"
import { addInterceptor, removeInterceptor } from "lib/router"

import { getEditorUrl } from "utils"
import { User } from "users"

import { DebuggerPane, SourcesPane, ViewsPane } from "./components"
import { hasDirtySources, isDebuggable } from "./selectors"
import { State, Actions } from "./api"
import { LogFn } from "logger"

export interface EditorProps {
  state: State
  actions: Actions
  currentUser: User | null
  log: LogFn
  loading: boolean
}

const INTERCEPTOR = "__INTERCEPTOR"
const IFRAME_LISTENER = "__IFRAME_LISTENER"
const UNLOAD = "__UNLOAD"
const SHORTCUTS_LISTENER = "__SHORTCUTS_LISTENER"

function isCtrlKeyDown(event: KeyboardEvent, code: number): boolean {
  return (event.metaKey || event.ctrlKey) && event.keyCode === code
}

export function Editor(props: EditorProps) {
  const { state, actions, log } = props

  if (!state.project) {
    return <div />
  }

  // ## oncreate
  const oncreate = (e: HTMLElement) => {
    // ### Confirm on exit
    e[INTERCEPTOR] = (url: string) => {
      if (
        !url.includes(getEditorUrl(state.project)) &&
        hasDirtySources(state)
      ) {
        return confirm(
          "This project has unsaved changes, are you sure you want to leave this page?"
        )
      }
      return true
    }
    addInterceptor(e[INTERCEPTOR])

    e[UNLOAD] = (e: BeforeUnloadEvent) => {
      if (hasDirtySources(state)) {
        e.returnValue =
          "This project has unsaved changes, are you sure you want to leave this page?"
      }
    }
    window.addEventListener("beforeunload", e[UNLOAD])

    // ### Debugger
    e[IFRAME_LISTENER] = (e: MessageEvent) => {
      const iframe = document.getElementById(
        "preview-iframe"
      ) as HTMLIFrameElement
      if (
        iframe &&
        e.origin === window.location.origin &&
        iframe.contentWindow === e.source &&
        typeof e.data === "string"
      ) {
        const data = JSON.parse(e.data)
        data.timestamp = new Date().getTime()

        switch (data.type) {
          case "INITIALIZE":
            actions.debug.logInit({
              runId: data.id,
              state: data.state,
              timestamp: new Date().getTime()
            })
            break
          case "ACTION_START":
            actions.debug.logAction({
              runId: data.id,
              callDone: false,
              action: data.action,
              data: data.data
            })
            break
          case "ACTION_DONE":
            actions.debug.logAction({
              runId: data.id,
              callDone: true,
              action: data.action,
              result: data.result
            })
            break
        }
      }
    }
    window.addEventListener("message", e[IFRAME_LISTENER])

    // ### Keyboard shortcuts
    e[SHORTCUTS_LISTENER] = (event: KeyboardEvent) => {
      if (isCtrlKeyDown(event, 83)) {
        // CTRL+S or CMD+S -> save sources
        const state = actions.getState()
        if (state.status === "editing") {
          log(actions.saveAllSources())
        }
        event.preventDefault()
      }
      if (isCtrlKeyDown(event, 82)) {
        // CTRL+R or CMD+R -> run project
        const state = actions.getState()
        if (state.status === "editing" || state.status === "read-only") {
          log(actions.run(false))
        }
        event.preventDefault()
      }
      if (isCtrlKeyDown(event, 68)) {
        // CTRL+D or CMD+D -> debug project
        const state = actions.getState()
        if (
          state.status === "editing" ||
          (state.status === "read-only" && isDebuggable(state))
        ) {
          log(actions.run(true))
        }
        event.preventDefault()
      }
    }
    window.addEventListener("keydown", e[SHORTCUTS_LISTENER])
  }

  const ondestroy = (e: HTMLElement) => {
    actions.close()
    removeInterceptor(e[INTERCEPTOR])
    window.removeEventListener("beforeunload", e[UNLOAD])
    window.removeEventListener("message", e[IFRAME_LISTENER])
    window.removeEventListener("keydown", e[SHORTCUTS_LISTENER])
  }

  return (
    <SplitPane
      key="project-editor-div"
      oncreate={oncreate}
      ondestroy={ondestroy}
    >
      {state.debug.paneShown ? DebuggerPane(props) : SourcesPane(props)}
      {ViewsPane(props)}
    </SplitPane>
  )
}
