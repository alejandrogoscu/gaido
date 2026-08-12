import { useQueryClient } from '@tanstack/react-query'

import { AuthForm, type AuthMode } from './AuthForm'
import { currentUserQueryKey } from './session'

type AuthPageProps = {
  mode: AuthMode
}

export function AuthPage({ mode }: AuthPageProps) {
  const queryClient = useQueryClient()

  return (
    <AuthForm
      key={mode}
      mode={mode}
      onAuthenticated={(user) => queryClient.setQueryData(currentUserQueryKey, user)}
    />
  )
}
