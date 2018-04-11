import { h } from "hyperapp"

import { ProjectsSearch } from "lib/search/ProjectsSearch"

import { State, Actions } from "api"
import { LogFn } from "logger"

import "./IndexPage.scss"

import { Button } from "lib/components"
import { createProject } from "createProject"

export interface IndexPageProps {
  state: State
  actions: Actions
  log: LogFn
}

export function IndexPage(props: IndexPageProps) {
  const { state, actions, log } = props

  return (
    <div class="index-page">
      <div class="jumbotron jumbotron-home">
        <div clas="container">
          <div class="columns">
            <div class="col-6 text-left px-2">
              <h1 class="hero-header py-6 px-2">
                Code JavaScript apps faster using Hyperapp
              </h1>
              <h2 class="hero-subheader hero-subheader-home py-6 px-2">
                Hyperstart allows you to create and share JavaScript projects,
                ranging from code snippets to fully-fledged projects, with zero
                setup. Use{" "}
                <a href="https://github.com/hyperapp/hyperapp" target="_blank">
                  Hyperapp
                </a>{" "}
                and our integrated devtools to speed up your project development
                cycle.
              </h2>
              <h2 class="hero-subheader hero-subheader-home pb-30">
                Create an account for free and try it out &nbsp;
                <i
                  class="fa fa-long-arrow-right set-primary"
                  aria-hidden="true"
                />
              </h2>
            </div>
            <div class="col-4 text-left py-10 mx-auto centered">
              <p />
            </div>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="columns">
          <div class="column col-12">
            <h2 class="text-center">Features</h2>
          </div>
          <div class="column col-4 centered p-2">
            <i
              class="fa fa-cogs fa-5x text-center col-12 m-2"
              aria-hidden="true"
            />
            <h4 class="text-center">Integrated Devtools</h4>
            <p>
              Projects using{" "}
              <a href="https://github.com/hyperapp/hyperapp" target="_blank">
                Hyperapp
              </a>{" "}
              count with powerful devtools, such as an integrated time travel
              debugger.
            </p>{" "}
            <a
              href="#"
              onclick={e => {
                e.preventDefault()
                createProject(state, actions, "hyperapp")
              }}
            >
              Try it out with a test Hyperapp project.
            </a>
          </div>

          <div class="column col-4 centered p-2">
            <i
              class="fa fa-repeat fa-5x text-center col-12 m-2"
              aria-hidden="true"
            />
            <h4 class="text-center">Reusability</h4>
            <p>
              Since all projects are open-source, you can search all available
              projects and re-use them as dependencies on your code.
            </p>
            <a href="#search">Search for an existing project.</a>
          </div>

          <div class="column col-4 centered p-2">
            <i
              class="fa fa-pencil-square-o fa-5x text-center col-12 m-2"
              aria-hidden="true"
            />
            <h4 class="text-center">Built for Hyperapp</h4>
            <p>
              This website has been built using{" "}
              <a href="https://github.com/hyperapp/hyperapp" target="_blank">
                Hyperapp
              </a>, and has been optimised to speed up the development process
              using the framework.
            </p>
            <a href="/blog">Start learning Hyperapp.</a>
          </div>

          <div class="column col-12 text-center py-10">
            <Button
              primary={true}
              text="Create an Account to Save Your Projects"
              size="lg"
              onclick={() => {
                actions.users.showSignUpModal()
              }}
            />
          </div>
        </div>
      </div>

      <div class="container">
        <div class="columns">
          <a name="search" />
          <div class="column col-12 p-2">
            <h2 class="text-center p-2">Explore Existing Projects</h2>
            <div class="col-8 centered text-left">
              <p class="p-2">
                Try typing "Hyperapp" into the search below to see our own
                Hyperapp examples and learn how to use the framework, or search
                for any existing project on Hyperstart. You can also{" "}
                <a
                  href="#"
                  onclick={e => {
                    e.preventDefault()
                    props.actions.ui.openCreateProject()
                  }}
                >
                  create your own project
                </a>{" "}
                and reuse any project as a dependency.
              </p>
            </div>
            {ProjectsSearch({
              state: state.search,
              actions: actions.search,
              log
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
