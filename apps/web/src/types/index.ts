export interface User {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  createdAt: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export type Certification = {
  id: string
  code: string
  name: string
  provider: string
  level: 'Fundamental' | 'Associate' | 'Expert'
  description: string
}
