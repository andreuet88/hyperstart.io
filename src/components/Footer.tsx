import { h } from "hyperapp"

import { State, Actions } from "api"

import { UserSignInModal, UserSignUpModal } from "users"

export interface FooterProps {
  state: State
  actions: Actions
}

export function Footer(props: FooterProps) {
  const { state, actions } = props
  return (
    <div>
      <UserSignInModal state={state.users} actions={actions.users} />
      <UserSignUpModal state={state.users} actions={actions.users} />
    </div>
  )
}