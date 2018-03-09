import { getSource } from "../../selectors"
import { State } from "../../api"
import { CompileOutput } from "../api"
import { DiagnosticCategory } from "lib/typescript"

const ACTUAL_HYPERAPP_IMPORT = "__ACTUAL__HYPERAPP__IMPORT__"
export const ACTUAL_HYPERAPP_PATH = "__ACTUAL__HYPERAPP__PATH__"
const HYPERAPP_IMPORT = "hyperapp"
const HYPERAPP_PATH = "dependencies/hyperapp/index.js"
export const DEBUGGER_PATH = "__DEBUGGER__PATH__"

const debuggerSource = `
import * as ha from "${ACTUAL_HYPERAPP_IMPORT}"
export const h = ha.h

function send(message) {
  window.parent.postMessage(JSON.stringify(message), window.location.origin)
}
const ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const SIZE = 16
const rand = () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]

export const guid = () =>
  Array.apply(null, Array(SIZE))
    .map(rand)
    .join("")

export function app(initialState, actionsTemplate, view, container) {
  const id = guid()
  function enhanceActions(actions, prefix) {
    var namespace = prefix ? prefix + "." : ""
    return Object.keys(actions || {}).reduce(function(otherActions, name) {
      var namedspacedName = namespace + name
      var action = actions[name]
      otherActions[name] =
        typeof action === "function"
          ? function(data) {
              return function(state, actions) {
                var result = action(data)
                result =
                  typeof result === "function" ? result(state, actions) : result
                send({
                  type: "ACTION",
                  id,
                  action: namedspacedName,
                  data: data,
                  result
                })
                return result
              }
            }
          : enhanceActions(action, namedspacedName)
      return otherActions
    }, {})
  }

  var enhancedActions = enhanceActions(actionsTemplate)

  send({
    type: "INITIALIZE",
    id,
    state: initialState
  })

  return ha.app(initialState, enhancedActions, view, container)
}
`

/*
{
    type: "INITIALIZED",
    state: state
  }
*/

export const debug = (state: State, result: CompileOutput): any => {
  return {
    name: "hyperstart-debug",
    resolveId(importee: string, importer: string): string {
      if (importee === HYPERAPP_IMPORT) {
        return DEBUGGER_PATH
      }
      if (importee === ACTUAL_HYPERAPP_IMPORT) {
        return ACTUAL_HYPERAPP_PATH
      }
    },
    load(id: string): string {
      if (id === DEBUGGER_PATH) {
        return debuggerSource
      }
      if (id === ACTUAL_HYPERAPP_PATH) {
        return getSource(state, HYPERAPP_PATH).content
      }
    }
  }
}
