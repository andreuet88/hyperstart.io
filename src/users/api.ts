import firebase from "firebase"

import { ModuleActions } from "api"

export namespace users {
  // # Authentication

  export interface AuthenticationListener {
    (user?: User): void
  }

  // # User

  export interface User {
    id: string
    displayName: string
    email: string
    emailVerified: boolean
  }

  // # State

  export interface State {
    currentUser?: User
    usersById: {
      [id: string]: User
    }
  }

  // # Actions

  export interface Actions extends ModuleActions {
    initFirebase(listeners: AuthenticationListener[]): void
    setUser(user?: firebase.User): void
    tryLogout(): Promise<void>
    getState(): State
  }
}
