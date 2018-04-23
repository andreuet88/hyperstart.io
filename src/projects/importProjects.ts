import { guid, StringMap } from "lib/utils"

import { File } from "./api"
import { DEPENDENCIES_FOLDER_NAME, DEPENDENCIES_FOLDER_PATH } from "./constants"
import { FileNode, FileTree, getFileTree } from "./fileTree"

interface IdMap {
  [id: string]: string
}

const importFiles = (
  existing: StringMap<File>,
  files: StringMap<File>,
  root?: string
): void => {
  const idMap: IdMap = {}

  // add the files
  Object.keys(files).forEach(fId => {
    const id = idMap[fId] ? idMap[fId] : (idMap[fId] = guid())
    const file = files[fId]
    const created: File = {
      id,
      type: file.type,
      name: file.name
    }
    if (file.parent) {
      created.parent = idMap[file.parent]
        ? idMap[file.parent]
        : (idMap[file.parent] = guid())
    } else if (root) {
      created.parent = root
    }
    if (file.content) {
      created.content = file.content
    }

    existing[id] = created
  })
}

const ATTRS = ["type", "content", "url", "projectId"]

function areFilesEquals(file1: File, file2: File): boolean {
  for (const attr of ATTRS) {
    if (file1[attr] !== file2[attr]) {
      return false
    }
  }
  return true
}

function importFile(
  existing: StringMap<File>,
  tree: FileTree,
  targets: StringMap<File>,
  path: string,
  toImport: File
): File {
  const id = tree.byPath[path]
  if (id) {
    const file = existing[id]
    if (areFilesEquals(file, toImport)) {
      // re-use file
      targets[id] = file
      return file
    } else {
      // create new, re-use ID
      targets[id] = { ...toImport, id }
      return targets[id]
    }
  } else {
    // create new
    const id = guid()
    targets[id] = { ...toImport, id }
    return targets[id]
  }
}

function importFileRecursive(
  existing: StringMap<File>,
  tree: FileTree,
  targets: StringMap<File>,
  path: string,
  toImport: FileNode,
  toImportFiles: StringMap<File>,
  toImportTree: FileTree,
  parentId?: string
) {
  const fileToImport = toImportFiles[toImport.id]
  const imported = importFile(existing, tree, targets, path, fileToImport)
  if (parentId) {
    imported.parent = parentId
  }

  if (toImport.type === "folder") {
    toImport.children.forEach(childId => {
      const child = toImportTree.byId[childId]
      importFileRecursive(
        existing,
        tree,
        targets,
        path + "/" + child.name,
        child,
        toImportFiles,
        toImportTree,
        imported.id
      )
    })
  }
}

function getProjectFolder(
  project: ImportedProject,
  name: string,
  parent: string
): File {
  const result: File = {
    id: null,
    name: name,
    type: "folder",
    parent
  }
  return result
}

export interface ImportedProject {
  id: string
  name: string
  files: StringMap<File>
  storageUrl?: string
  mainFile?: string
  version?: string
}

export const importProjects = (
  files: StringMap<File>,
  imports: ImportedProject[]
): StringMap<File> => {
  const result: StringMap<File> = {}

  const tree = getFileTree(files)
  console.log("Existing tree", tree)
  const dependencies = importFile(
    files,
    tree,
    result,
    DEPENDENCIES_FOLDER_PATH,
    {
      id: null,
      name: DEPENDENCIES_FOLDER_NAME,
      type: "folder"
    }
  )

  const foldersToExclude = []

  imports.forEach(project => {
    const names = project.name.split("/")
    let path = DEPENDENCIES_FOLDER_PATH
    let root = dependencies
    for (const name of names) {
      path += "/" + name
      root = importFile(
        files,
        tree,
        result,
        path,
        getProjectFolder(project, name, root.id)
      )
    }
    // set project info.
    root.project = {
      id: project.id,
      mainFile: project.mainFile,
      version: project.version
      // storageUrl: project.storageUrl
    }
    foldersToExclude.push(path)

    const toImportTree = getFileTree(project.files)
    toImportTree.roots.forEach(fileId => {
      const toImport = toImportTree.byId[fileId]

      importFileRecursive(
        files,
        tree,
        result,
        path + "/" + toImport.path,
        toImport,
        project.files,
        toImportTree,
        root.id
      )
    })
  })

  // copy non conflicting files
  Object.keys(files).forEach(id => {
    const file = tree.byId[id]
    for (const toExclude of foldersToExclude) {
      if (file.path.startsWith(toExclude)) {
        return
      }
    }
    result[id] = files[id]
  })

  return result
}
