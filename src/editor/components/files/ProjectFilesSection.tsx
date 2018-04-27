import { h } from "hyperapp"

import { File, FileNode, FolderNode, SourceNode } from "projects"
import { LogFn } from "logger"

import { State, Actions } from "../../api"
import { getPreviewedFile } from "../../selectors"
import { CreateFileModal } from "./CreateFileModal"
import { DeleteFileModal } from "./DeleteFileModal"
import { FileTree } from "./FileTree"
import { FilePreview } from "./FilePreview"
import { HeaderMenu } from "./HeaderMenu"

import "./ProjectFilesSection.scss"
import { logEvent } from "analytics"

export interface ProjectFilesSectionProps {
  state: State
  actions: Actions
  log: LogFn
}

export const ProjectFilesSection = (props: ProjectFilesSectionProps) => {
  const { state, actions, log } = props
  const file = getPreviewedFile(state)

  function createFile(type: "file" | "folder", name: string, parent?: File) {
    logEvent("create_file", {
      event_category: "project",
      event_label: "Create " + type
    })
    log(actions.createFile({ type, name, parent }))
  }
  function onDeleteFile(file: FileNode) {
    logEvent("delete_file", {
      event_category: "project",
      event_label: "Delete"
    })
    log(actions.deleteFile(file))
  }

  return (
    <div class="m-2 project-files">
      <h2>Files {HeaderMenu(props)}</h2>
      {file ? FilePreview({ state, actions, file }) : FileTree(props)}
      <DeleteFileModal
        deleting={state.ui.deletingFile}
        close={actions.ui.closeDeleteFileModal}
        confirm={onDeleteFile}
      />
      <CreateFileModal state={state} actions={actions} confirm={createFile} />
    </div>
  )
}
