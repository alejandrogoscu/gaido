export type AuthUser = {
  id: number
  email: string
  username: string
  display_name: string
  created_at: string
}

export type LoginCredentials = {
  email: string
  password: string
}

export type RegisterCredentials = LoginCredentials & {
  username: string
}