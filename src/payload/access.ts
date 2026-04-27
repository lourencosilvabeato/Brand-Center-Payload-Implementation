import type { Access } from 'payload'

type UserWithRole = {
  role?: 'admin' | 'localAdmin' | 'internal' | 'external'
}

export const isAdmin: Access = ({ req: { user } }) => {
  if (!user) return false
  return (user as unknown as UserWithRole).role === 'admin'
}

export const isAdminOrLocalAdmin: Access = ({ req: { user } }) => {
  if (!user) return false
  const role = (user as unknown as UserWithRole).role
  return role === 'admin' || role === 'localAdmin'
}

export const isAuthenticated: Access = ({ req: { user } }) => !!user
