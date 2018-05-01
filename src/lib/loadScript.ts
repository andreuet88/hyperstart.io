import { StringMap } from "./utils"

const cache: StringMap<Promise<any>> = {}

/**
 * Load an external script.
 *
 * @param {string} url Absolute URL of script to load
 * @param {string=} name Name of global variable that the script is expected to define
 * @return {Promise}
 */
export function loadScript(url: string, name: string): Promise<any> {
  let promise

  if (cache[url]) {
    promise = cache[url]
  } else {
    promise = new Promise((resolve, reject) => {
      let script = document.createElement("script")
      script.onerror = event => reject(new Error(`Failed to load '${url}'`))
      script.onload = resolve
      script.async = true
      script.src = url

      if (document.currentScript) {
        document.currentScript.parentNode.insertBefore(
          script,
          document.currentScript
        )
      } else {
        ;(
          document.head || document.getElementsByTagName("head")[0]
        ).appendChild(script)
      }
    })

    cache[url] = promise
  }

  return promise.then(() => {
    if (global[name]) {
      return global[name]
    } else {
      throw new Error(`"${name}" was not created by "${url}"`)
    }
  })
}
