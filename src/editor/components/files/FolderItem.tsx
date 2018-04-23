import { h } from "hyperapp"

import { Icon } from "lib/components"
import { FolderNode } from "projects/fileTree"
import { DEPENDENCIES_FOLDER } from "projects/constants"

import { State, Actions } from "../../api"
import { isDependenciesFolder } from "./utils"

function stopPropagation(e: Event) {
  e.stopPropagation()
}

interface FolderDropdownProps {
  state: State
  actions: Actions
  item: FolderNode
}

function FolderDropdown(props: FolderDropdownProps) {
  const actions = props.actions.ui
  return (
    <div class="dropdown dropdown-right float-right" onclick={stopPropagation}>
      <a href="#" class="dropdown-toggle">
        <Icon name="bars" class="actions float-right" />
      </a>
      <ul class="menu">
        <li class="menu-item">
          <a
            href="#"
            onclick={() =>
              actions.openCreateFileModal({ type: "file", parent: props.item })
            }
          >
            New File
          </a>
        </li>
        <li class="menu-item">
          <a
            href="#"
            onclick={() =>
              actions.openCreateFileModal({
                type: "folder",
                parent: props.item
              })
            }
          >
            New Folder
          </a>
        </li>
        <li class="divider" />
        <li class="menu-item">
          <a href="#" onclick={() => actions.openDeleteFileModal(props.item)}>
            Delete
          </a>
        </li>
      </ul>
    </div>
  )
}

function FolderVersion(props: FolderItemProps) {
  const { item } = props
  if (item.version) {
    return <span class="folder-version">@{item.version}</span>
  }
  return null
}

function DependenciesFolderDropdown(props: FolderItemProps) {
  const actions = props.actions.ui
  return (
    <div class="dropdown dropdown-right float-right" onclick={stopPropagation}>
      <a href="#" class="dropdown-toggle">
        <Icon name="bars" class="actions float-right" />
      </a>
      <ul class="menu">
        <li class="menu-item">
          <a href="#" onclick={actions.openImportProjectDialog}>
            Add Dependency
          </a>
        </li>{" "}
        <li class="menu-item">
          <a href="#" onclick={actions.openImportNpmPackageModal}>
            Add Npm Package
          </a>
        </li>
      </ul>
    </div>
  )
}

function DependenciesFolderItem(props: FolderItemProps) {
  const { state, actions, item } = props

  return (
    <div class="file c-hand">
      <Icon name={item.expanded ? "folder-open-o" : "folder-o"} /> {item.name}{" "}
      <span
        class="tooltip tooltip-bottom"
        data-tooltip={`This folder contains all the dependencies for
this project. The dependencies may be other 
Hyperstart projects or npm packages.
You may import them in your source, e.g.:
import { app, h } from "hyperapp"`}
      >
        <i class="fa fa-question-circle-o preview" aria-hidden="true" />
      </span>
      {DependenciesFolderDropdown(props)}
    </div>
  )
}

// ## Folder

export interface FolderItemProps {
  state: State
  actions: Actions
  item: FolderNode
}

export function FolderItem(props: FolderItemProps) {
  const { state, actions, item } = props

  if (isDependenciesFolder(item)) {
    return DependenciesFolderItem(props)
  }

  return (
    <div class="file c-hand">
      <Icon name={item.expanded ? "folder-open-o" : "folder-o"} /> {item.name}
      {FolderVersion(props)} {FolderDropdown(props)}
    </div>
  )
}
