import { h } from "hyperapp"

import { Link } from "lib/router"
import { Button } from "lib/components"
import { SearchField } from "lib/search/SearchField"

import { Status, LogFn } from "logger"
import { State, Actions } from "api"
import { isLoading } from "selectors"
import { hasDirtySources, isDebuggable } from "editor/selectors"
import { UserIconButton } from "users/UserIconButton"

import "./Header.scss"

export interface HeaderProps {
  state: State
  actions: Actions
  log: LogFn
}

function CreateButton({ state, actions }: HeaderProps) {
  if (isLoading(state) || state.editor.project) {
    return null
  }

  return Button({
    onclick: actions.ui.openCreateProject,
    text: "create",
    class: "button"
  })
}

function SaveButton({ state, actions }: HeaderProps) {
  const status = state.editor.status
  if (status !== "editing" && status !== "loading") {
    return null
  }

  return Button({
    disabled:
      hasDirtySources(state.editor) || isLoading(state) || status === "loading",
    onclick: actions.editor.saveAllSources,
    text: "Save",
    class: "button"
  })
}

function RunButton({ state, actions }: HeaderProps) {
  const status = state.editor.status
  const project: any = state.editor.project || {}
  if (status === "closed" || !project.mainFile) {
    return null
  }

  return Button({
    disabled: isLoading(state) || status === "loading",
    onclick: () => actions.editor.run(false),
    text: "Run",
    class: "button"
  })
}

function DebugButton({ state, actions }: HeaderProps) {
  const status = state.editor.status
  const project: any = state.editor.project || {}
  if (status === "closed" || !project.mainFile || !isDebuggable(state.editor)) {
    return null
  }

  const debugState = state.editor.debug
  return (
    <div class="btn-group btn-group-block button">
      <Button
        disabled={isLoading(state)}
        onclick={() => actions.editor.run(true)}
        text="Debug"
      />
      <Button
        disabled={isLoading(state) || !state.editor.compilationOutput}
        active={debugState.paneShown}
        onclick={() => actions.editor.debug.showPane(!debugState.paneShown)}
        icon="caret-down"
      />
    </div>
  )
}

export function Header(props: HeaderProps) {
  const { state, actions, log } = props
  return (
    <header class="header navbar bg-dark">
      <section class="navbar-section">
        <Link href="/" class="navbar-brand mr-2 text-light">
          Hyperstart
        </Link>
        {CreateButton(props)}
        {SaveButton(props)}
        {RunButton(props)}
        {DebugButton(props)}
      </section>
      <section class="navbar-section">
        {Status({ state: state.logger, actions: actions.logger })}
      </section>
      <section class="navbar-section">
        {SearchField({
          state: state.search,
          actions: actions.search,
          log,
          name: "projects"
        })}
        {UserIconButton({ state: state.users, actions: actions.users })}
      </section>
    </header>
  )
}
