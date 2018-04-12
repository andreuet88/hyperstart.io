import { editor } from "monaco-editor"
import { h } from "hyperapp"

import monaco from "./monaco"

const EDITOR = "__EDITOR"
const RESIZE_LISTENER = "__RESIZE_LISTENER"

const hasEditor = e => !!e[EDITOR]
const getEditor = e => e[EDITOR] as editor.IEditor

const createEditor = (e: HTMLElement, props: MonacoEditorProps) => {
  if (monaco && !hasEditor(e)) {
    const { getOptions, getOverrides } = props
    const editor = monaco.editor.create(
      e,
      getOptions(),
      getOverrides ? getOverrides() : undefined
    )

    editor.onDidChangeModelContent(() => {
      if (props.onModelContentChanged) {
        props.onModelContentChanged(editor)
      }
    })
    e[EDITOR] = editor

    e[RESIZE_LISTENER] = () => editor.layout()
    window.addEventListener("resize", e[RESIZE_LISTENER])

    updateModel(e, props)
  }
}

const updateModel = (e: HTMLElement, props: MonacoEditorProps) => {
  const editor = getEditor(e)
  const model = props.model || null
  if (model !== editor.getModel()) {
    editor.setModel(model)
    if (props.onModelChanged) {
      props.onModelChanged(editor, model)
    }
  }
}

const destroyEditor = (e: HTMLElement, props: MonacoEditorProps) => {
  if (props.onEditorDeleted) {
    props.onEditorDeleted(e[EDITOR], e)
  }
  e[EDITOR].dispose()
  delete e[EDITOR]
  window.removeEventListener("resize", e[RESIZE_LISTENER])
  delete e[RESIZE_LISTENER]
}

export interface MonacoEditorProps {
  getOptions(): editor.IEditorConstructionOptions
  getOverrides?: () => editor.IEditorOverrideServices
  onEditorCreated?: (editor: editor.IEditor, e: HTMLElement) => void
  onEditorDeleted?: (editor: editor.IEditor, e: HTMLElement) => void
  onModelChanged?: (editor: editor.IEditor, oldModel: editor.IModel) => void
  onModelContentChanged?: (editor: editor.IEditor) => void
  model?: editor.IModel
  key?: string
  /**
   * Defaults to "monaco-editor"
   */
  className?: string
}

export const MonacoEditor = (props: MonacoEditorProps) => {
  const { key = "monaco-editor", className = "monaco-editor" } = props

  const oncreate = (e: HTMLElement) => {
    // if (monaco) fails
    if (window["monaco"]) {
      createEditor(e, props)
    }
  }
  const onupdate = (e: HTMLElement) => {
    if (window["monaco"]) {
      if (hasEditor(e)) {
        updateModel(e, props)
      } else {
        createEditor(e, props)
      }
    }
  }
  const ondestroy = (e: HTMLElement) => {
    destroyEditor(e, props)
  }

  return (
    <div
      key={key}
      class={className}
      oncreate={oncreate}
      onupdate={onupdate}
      ondestroy={ondestroy}
    />
  )
}
