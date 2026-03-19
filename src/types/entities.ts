export interface Supervisor {
  id: string
  firstName: string
  lastName: string
  email: string
  title: string
  universityId: string
  researchInterests: string[]
  about: string | null
  objectives: string[]
  fieldIds: string[]
}

export interface University {
  id: string
  name: string
  country: string
  domains: string[]
  about: string | null
}
