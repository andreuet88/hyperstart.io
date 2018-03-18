import { ModuleActions } from "api"

import * as form from "lib/form"

// # State

export interface User {
  id: string
  displayName: string
  email: string
  emailVerified: boolean
}

export interface State {
  loading: boolean
  selectedEmail?: string
  user?: User
  signInModal?: form.State
  signUpModal?: form.State
}

// # Actions

export interface Listener {
  (user?: User): void
}

export interface Actions extends ModuleActions<State> {
  // ## Authentication
  initAuthentication(listeners: Listener[])
  resetIdentity()
  signUp(): Promise<void>
  signIn(): Promise<void>
  signInWithGoogle(): Promise<void>
  signOut(): Promise<void>
  // ## UI
  signInModal: form.Actions
  showSignInModal()
  hideSignInModal()
  signUpModal: form.Actions
  showSignUpModal()
  hideSignUpModal()
}
