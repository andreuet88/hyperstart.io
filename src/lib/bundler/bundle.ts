import semver from "semver"

import { get } from "lib/unpkg"
import { resolveId } from "./resolveId"
import { Bundle, Package, PackageJson } from "./api"

// # Remove comments
const commentsRegex = /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm

function removeComments(code: string): string {
  return code.replace(commentsRegex, "$1")
}

// # Get Esm Imports

const esmRegex = /[import|export]\s+([\s{}\w-\*,$]+)\s+from\s+["|']([\w-\./]+)["|']\s*/g

function getEsmImports(code: string): string[] {
  const result = []
  let exec
  while ((exec = esmRegex.exec(code)) !== null) {
    if (!exec || !exec[2]) {
      break
    }
    result.push(exec[2])
  }

  return result
}

// # Get Commonjs Imports

const requireRegex = /require\(["|']([\w-\./]+)["|']\)/g

function getCommonJsImports(code: string): string[] {
  const result = []
  let exec
  while ((exec = requireRegex.exec(code)) !== null) {
    if (!exec || !exec[1]) {
      break
    }
    result.push(exec[1])
  }

  return result
}

// # Utils

function addPkg(bundle: Bundle, json: PackageJson): Package {
  if (!bundle.packages[json.name]) {
    bundle.packages[json.name] = {}
  }
  const packages = bundle.packages[json.name]

  if (packages[json.version]) {
    return packages[json.version]
  }

  packages[json.version] = {
    json,
    mainFile: null,
    files: {},
    dependencies: {},
    peerDependencies: {},
    unresolved: {}
  }

  return packages[json.version]
}

function inferVersion(semver: string): string | null {
  let result = semver.trim()
  if (result.startsWith("v")) {
    result = result.substr(1)
  }

  // not supported
  if (result === "*" || result.startsWith(">") || result.includes("x")) {
    return null
  }

  if (result.startsWith("<=")) {
    return result.substr(2)
  }

  if (result.startsWith("^") || result.startsWith("~")) {
    return result.substr(1)
  }

  return result
}

export function getPkg(
  bundle: Bundle,
  name: string,
  version: string
): Package | null {
  const versions = bundle.packages[name]
  if (!versions) {
    return null
  }
  for (const v of Object.keys(versions)) {
    if (semver.satisfies(v, version)) {
      return versions[v]
    }
  }
  return null
}

function inferMainFile(json: PackageJson): string | null {
  if (json.module) {
    return json.module
  } else if (json.main) {
    return json.main
  } else {
    if (json.files.length > 0) {
      const candidates: string[] = []
      for (const file of json.files) {
        if (file === "index.js") {
          return file
        }
        if (file.endsWith(".js")) {
          candidates.push(file)
        }
      }

      if (candidates.length === 1) {
        return candidates[0]
      }
    }
  }
  return null
}

interface ResolvedDependency {
  name: string
  version: string
  isPeer: boolean
  file?: string
}

function createResolved(
  name: string,
  version: string,
  isPeer: boolean,
  file?: string
): ResolvedDependency {
  const result: ResolvedDependency = {
    name,
    version,
    isPeer
  }
  if (file) {
    result.file = !file.endsWith(".js") ? file + ".js" : file
  }

  return result
}

function resolveDependency(
  pkg: PackageJson,
  dependency: string,
  file?: string
): ResolvedDependency {
  if (pkg.peerDependencies && pkg.peerDependencies[dependency]) {
    const version = pkg.peerDependencies[dependency]
    return createResolved(dependency, version, true, file)
  }
  if (pkg.dependencies && pkg.dependencies[dependency]) {
    const version = pkg.dependencies[dependency]
    return createResolved(dependency, version, false, file)
  }

  if (!dependency.includes("/")) {
    return null
  }

  const segments = dependency.split("/")
  const last = segments.pop()

  return resolveDependency(
    pkg,
    segments.join("/"),
    file ? last + "/" + file : last
  )
}

// # Crawl

function crawl(result: Bundle, pkg: PackageJson, file: string): Promise<any> {
  file = file.startsWith("/") ? file : "/" + file

  // check if already crawled
  const currentPkg = getPkg(result, pkg.name, pkg.version)
  if (currentPkg.files[file] !== undefined) {
    return Promise.resolve()
  }

  // console.log(`Crawling "${file}" in package ${pkg.name}@${pkg.version}...`)

  // set dummy content the start of the get() to avoid multiple downloads
  currentPkg.files[file] = "loading"
  return get({ pkg: pkg.name, version: pkg.version, file }).then(res => {
    // console.log(`Downloaded "${file}" in package ${pkg.name}@${pkg.version}...`)

    // update the bundles
    currentPkg.files[file] = res.content

    // stop recursion for non javascript sources
    if (!file.endsWith(".js")) {
      return Promise.resolve([])
    }

    // recursive call
    const rawCode = removeComments(res.content)
    const deps = getEsmImports(rawCode)
    if (deps.length === 0) {
      // a package is either only es2015 or only commonjs
      deps.push(...getCommonJsImports(rawCode))
    }
    return Promise.all(
      deps.map(dep => {
        const resolved = resolveId(dep, file)
        // console.log(
        //   `Found dependency "${dep}" in file "${file}" resolved to "${resolved}"`
        // )

        if (resolved.startsWith("/")) {
          // file in the same package
          return crawl(result, pkg, resolved)
        } else {
          // dependency to another package
          const dep = resolveDependency(pkg, resolved)

          if (!dep) {
            currentPkg.unresolved[resolved] = "*"
          } else if (dep.isPeer) {
            currentPkg.peerDependencies[dep.name] = dep.version
          } else {
            currentPkg.dependencies[dep.name] = dep.version
            return bundle(dep.name, dep.version, result, dep.file)
          }
          return Promise.resolve()
        }
      })
    )
  })
}

// # Bundle

export function bundle(
  pkg: string,
  version?: string,
  bundle: Bundle = {
    name: pkg,
    version,
    packages: {}
  },
  file?: string
): Promise<Bundle> {
  return get({ pkg, version, file: "package.json" })
    .then(res => {
      const json: PackageJson = JSON.parse(res.content)
      bundle.version = json.version
      const packaged = addPkg(bundle, json)

      const mainFile = packaged.mainFile || inferMainFile(json)
      if (!mainFile) {
        throw new Error(
          `Could not infer the main file for package ${json.name}@${
            json.version
          }`
        )
      }
      packaged.mainFile = mainFile

      return crawl(bundle, json, file || mainFile)
    })
    .then(() => bundle)
}
