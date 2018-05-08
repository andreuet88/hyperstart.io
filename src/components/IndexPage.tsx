import { h } from "hyperapp"

import { ProjectsSearch } from "lib/search/ProjectsSearch"
import { Button } from "lib/components"

import { State, Actions } from "api"
import { UserSignUpForm } from "users"
import { LogFn } from "logger"

import "./IndexPage.scss"

import { createProject } from "createProject"
import { BlankTemplateCard, HyperappTemplateCard } from "./CreateProjectModal"

export interface IndexPageProps {
  state: State
  actions: Actions
  log: LogFn
}

function CreateProjectForm(props: IndexPageProps) {
  const { state, actions, log } = props

  const blankTemplate = state.ui.createProjectTemplate === "blank"
  const create = () => {
    createProject(state, actions, state.ui.createProjectTemplate)
  }
  return (
    <div class="create-project">
      <h4 class="text-center title">Create project</h4>
      <div style={{ display: "flex" }}>
        <BlankTemplateCard
          selected={blankTemplate}
          select={() => actions.ui.selectCreateProjectTemplate("blank")}
        />
        <HyperappTemplateCard
          selected={!blankTemplate}
          select={() => actions.ui.selectCreateProjectTemplate("hyperapp")}
        />
      </div>
      <div class="padding-card">
        <Button
          size="lg"
          block={true}
          text="CREATE PROJECT"
          onclick={create}
          class="btn-green"
        />
      </div>
    </div>
  )
}

export function IndexPage(props: IndexPageProps) {
  const { state, actions, log } = props

  return (
    <div class="index-page">
      <div class="jumbotron jumbotron-home">
        <div clas="container">
          <div class="columns">
            <div class="col-5 col-ml-auto col-md-12 px-2 text-center">
              <h1 class="hero-header px-2 title">
                Code JavaScript apps faster using Hyperapp
              </h1>
              <h5 class="px-2 font-light">
                Hyperstart allows you to create and share JavaScript projects,
                ranging from code snippets to fully-fledged projects, with zero
                setup. <br />
                <br />
                Use{" "}
                <a
                  href="https://github.com/hyperapp/hyperapp"
                  target="_blank"
                  class="white-color"
                >
                  Hyperapp
                </a>{" "}
                and our integrated devtools to speed up your project development
                cycle.
              </h5>
              <h5 class="px-2 pb-30 hide-md">
                Create an account for free and try it out.
              </h5>
            </div>
            <div class="col-2" />
            <div class="col-4 col-ml-autop hide-md text-center py-10 mx-auto centered">
              <CreateProjectForm state={state} actions={actions} log={log} />
            </div>
          </div>
        </div>
      </div>

      <div class="container section">
        <div class="columns">
          <div class="column col-12 section-padding">
            <h2 class="text-center">Features</h2>
          </div>
          <div class="col-4 col-md-12 centered py-4 px-4 text-center">
            <i class="fas fa-cogs fa-5x col-12 m-2" aria-hidden="true" />
            <h4 class="py-2">Integrated Devtools</h4>
            <p>
              We don't just provide a development environment, we also integrate
              ways to create better code in it and speed up your development
              cycle. Projects using{" "}
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
              Try it out with a test project.
            </a>
          </div>

          <div class="col-4 col-md-12 centered py-4 px-4 text-center">
            <i class="fas fa-redo fa-5x col-12 m-2" aria-hidden="true" />
            <h4 class="py-2">Reusability</h4>
            <p>
              We believe in open-source: this website is completely open and
              available on{" "}
              <a
                href="https://github.com/hyperstart/hyperstart.io"
                target="_blank"
              >
                Github
              </a>. Since all projects hosted on Hyperstart are also
              open-source, you can search available projects and re-use them as
              dependencies on your code.
            </p>
            <a href="#search">Search for an existing project.</a>
          </div>

          <div class="col-4 col-md-12 centered py-4 px-4 text-center">
            <i class="fab fa-npm fa-5x col-12 m-2" aria-hidden="true" />
            <h4 class="py-2">NPM Support</h4>
            <p>
              All of your usual libraries are supported here without any changes
              required. Projects can import from any npm package and use them as
              dependencies. Importing a dependency never takes more than a few
              seconds.
            </p>
            <a href="/docs">Visit our documentation to learn more.</a>
          </div>

          <div class="column col-4 centered hide-md py-14">
            <Button
              primary={true}
              text="Create an Account"
              size="lg"
              class="btn-large-font"
              onclick={() => {
                actions.users.showSignUpModal()
              }}
            />
          </div>
        </div>
      </div>

      <div class="section blue-section">
        <div class="columns">
          <div class="column col-12 text-center py-6">
            <h2>Developed For Hyperapp</h2>
          </div>
          <div class="column col-1" />
          <div class="column col-5 hide-md centered py-2 text-center">
            <img src="/hyperapp-debugger.gif" class="img-responsive" />
            <p class="py-2">The Hyperapp time-traveling debugger.</p>
          </div>
          <div class="column col-4 col-mx-auto col-md-12 centered text-center py-2">
            <p class="large-font px-6">
              Hyperapp is a tiny JavaScript framework which focuses on being
              minimal, pragmatic and standalone. All applications are composed
              of a state, view, and actions. It has been influenced by the Elm
              language and brings many of its features to JavaScript, such as
              hot-module reloading, code completeness and no runtime exceptions.
              It contains all the features from the most famous frameworks,
              while being easy to learn and more performant. If you have any
              questions, check out the learning resources on our blog. We are
              happy to answer any questions you might have either by e-mail, or
              on the Hyperapp Slack channel.{" "}
            </p>
          </div>
          <div class="column col-1" />
          <div class="column col-3 col-md-12 col-ml-auto text-center py-4">
            <a
              href="https://github.com/hyperapp/hyperapp"
              target="_blank"
              class="px-2 white-color"
            >
              Check out the project on Github.
            </a>
          </div>
          <div class="column col-3 col-md-12 col-mr-auto text-center py-4">
            <a
              href="https://blog.hyperstart.io"
              target="_blank"
              class="px-2 white-color"
            >
              Visit our blog to learn more.
            </a>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="columns">
          <a name="search" />
          <div class="column col-12 py-14">
            <h2 class="p-2 text-center">Explore Existing Projects</h2>
            <div class="col-9 col-md-12 centered">
              <p class="py-2 text-center">
                You can find a list of all available projects here. Try typing
                "Hyperapp" into the search below to see our own examples and
                learn how to use the framework, or search for any existing
                project on Hyperstart. You can also{" "}
                <a
                  href="#"
                  onclick={e => {
                    e.preventDefault()
                    props.actions.ui.openCreateProjectModal()
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
