import { h } from "hyperapp"

import { Icon } from "lib/components"
import { FolderNode } from "projects/fileTree"
import { DEPENDENCIES_FOLDER } from "projects/constants"

import { State, Actions } from "../../api"

function stopPropagation(e: Event) {
  e.stopPropagation()
}

interface FolderDropdownProps {
  state: State
  actions: Actions
  item: FolderNode
}

const FolderDropdown = (props: FolderDropdownProps) => {
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

// ## Folder

export interface FolderItemProps {
  state: State
  actions: Actions
  item: FolderNode
}

export const FolderItem = (props: FolderItemProps) => {
  const { state, actions, item } = props

  const Tooltip =
    item.name === DEPENDENCIES_FOLDER && !item.parent ? (
      <span
        class="tooltip tooltip-bottom"
        data-tooltip={`This folder contains all the projects that \nhave been imported (via File's dropdown \nmenu). All projects in this folder can be \nimported from inside your sources.`}
      >
        <i class="fa fa-question-circle-o preview" aria-hidden="true" />
      </span>
    ) : null
  return (
    <div class="file c-hand">
      <Icon name={item.expanded ? "folder-open-o" : "folder-o"} /> {item.name}{" "}
      {Tooltip}
      {FolderDropdown(props)}
    </div>
  )
}
