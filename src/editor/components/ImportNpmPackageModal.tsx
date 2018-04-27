import { h } from "hyperapp"

import { State, Actions } from "../api"
import { LogFn } from "logger"

import "./ImportNpmPackageModal.scss"
import { FormField, ModalForm } from "lib/form"
import { getErrorMessage } from "lib/utils"

export interface ImportNpmPackageModalProps {
  state: State
  actions: Actions
  log: LogFn
}

export function ImportNpmPackageModal(props: ImportNpmPackageModalProps) {
  const { state, actions, log } = props
  const modal = state.ui.importNpmPackageModal
  const modalActions = actions.ui.importNpmPackageModal
  if (!modal) {
    return <div />
  }

  const oncancel = e => {
    e.preventDefault()
    actions.ui.closeImportNpmPackageModal()
  }

  const submit = () => {
    const name = modal["name"].value
    if (name === "") {
      modalActions.setField({
        field: "name",
        error: "The name cannot be empty"
      })
      return
    }

    const version = modal["version"].value
    log(
      actions.importNpmPackage({ name, version }).then(() => {
        actions.ui.closeImportNpmPackageModal()
      })
    )
  }

  const options = modal.version.options
  return ModalForm({
    state: modal,
    actions: modalActions,
    active: true,
    close: actions.ui.closeImportNpmPackageModal,
    title: "Import package from npm",
    submit,
    fields: [
      {
        type: "text",
        name: "name",
        label: "Name",
        onchange: actions.computeImportingNpmPackageVersions
      },
      {
        type: "radio",
        label: "Version",
        name: "latest",
        onchange: actions.computeImportingNpmPackageVersions
      },
      {
        type: "select",
        name: "version",
        disabled: options.length === 0 || modal.latest.value === "latest"
      }
    ],
    canSubmit: () => options && options.length > 0,
    horizontal: false
  })

  // return (
  //   <div class="modal active import-npm-package-modal">
  //     <a
  //       href="#"
  //       class="modal-overlay"
  //       aria-label="Close"
  //       onclick={actions.ui.closeImportNpmPackageModal}
  //     />
  //     <div class="modal-container">
  //       <div class="modal-header">
  //         <a
  //           href="#"
  //           class="btn btn-clear float-right"
  //           aria-label="Close"
  //           onclick={actions.ui.closeImportProjectDialog}
  //         />
  //         <h3 class="modal-title">Add Npm Package</h3>
  //       </div>
  //       <div class="modal-body">

  //       </div>
  //       <div class="modal-footer">
  //         <button
  //           class={
  //             "btn btn-primary float-right" /*+ (modal.selected ? "" : " disabled")*/
  //           }
  //           onclick={onsubmit}
  //         >
  //           Add
  //         </button>
  //         <button class="btn btn-secondary float-right" onclick={oncancel}>
  //           Cancel
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // )
}
