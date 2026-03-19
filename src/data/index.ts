import universitiesRaw from '../../mock-data/universities.json'
import programsRaw from '../../mock-data/study-programs.json'
import fieldsRaw from '../../mock-data/fields.json'
import supervisorsRaw from '../../mock-data/supervisors.json'
import companiesRaw from '../../mock-data/companies.json'
import topicsRaw from '../../mock-data/topics.json'
import expertsRaw from '../../mock-data/experts.json'

// -- Types --
export type Degree = 'bsc' | 'msc' | 'phd'
export type TopicEmployment = 'yes' | 'no' | 'open'
export type TopicEmploymentType = 'internship' | 'working_student' | 'graduate_program' | 'direct_entry'
export type TopicWorkplaceType = 'on_site' | 'hybrid' | 'remote'
export type TopicType = 'topic' | 'job'

export interface University {
  id: string
  name: string
  country: string
  domains: string[]
  about: string | null
}

export interface StudyProgram {
  id: string
  name: string
  degree: Degree
  universityId: string
  about: string | null
}

export interface Field {
  id: string
  name: string
}

export interface Supervisor {
  id: string
  firstName: string
  lastName: string
  email: string
  title: string
  universityId: string
  researchInterests: string[]
  about: string | null
  fieldIds: string[]
}

export interface Company {
  id: string
  name: string
  description: string
  about: string | null
  size: string
  domains: string[]
}

export interface Expert {
  id: string
  firstName: string
  lastName: string
  email: string
  title: string
  companyId: string
  offerInterviews: boolean
  about: string | null
  fieldIds: string[]
}

export interface Topic {
  id: string
  title: string
  description: string
  type: TopicType
  employment: TopicEmployment
  employmentType: TopicEmploymentType | null
  workplaceType: TopicWorkplaceType | null
  degrees: Degree[]
  fieldIds: string[]
  companyId: string | null
  universityId: string | null
  supervisorIds: string[]
  expertIds: string[]
}

// -- Typed data exports --
export const universities = universitiesRaw as University[]
export const programs = programsRaw as StudyProgram[]
export const fields = fieldsRaw as Field[]
export const supervisors = supervisorsRaw as Supervisor[]
export const companies = companiesRaw as Company[]
export const topics = topicsRaw as Topic[]
export const experts = expertsRaw as Expert[]

// -- Lookup maps (O(1) access) --
export const universityById = Object.fromEntries(universities.map(u => [u.id, u])) as Record<string, University>
export const companyById = Object.fromEntries(companies.map(c => [c.id, c])) as Record<string, Company>
export const supervisorById = Object.fromEntries(supervisors.map(s => [s.id, s])) as Record<string, Supervisor>
export const fieldById = Object.fromEntries(fields.map(f => [f.id, f])) as Record<string, Field>
export const expertById = Object.fromEntries(experts.map(e => [e.id, e])) as Record<string, Expert>
export const topicById = Object.fromEntries(topics.map(t => [t.id, t])) as Record<string, Topic>

// -- Filter functions --

export function programsForUniversity(universityId: string): StudyProgram[] {
  return programs.filter(p => p.universityId === universityId)
}

export function supervisorsForFields(fieldIds: string[]): Supervisor[] {
  if (fieldIds.length === 0) return []
  return supervisors.filter(s =>
    s.fieldIds.some(fid => fieldIds.includes(fid))
  )
}

export function companiesForFields(fieldIds: string[]): Company[] {
  if (fieldIds.length === 0) return []
  const relevantCompanyIds = new Set(
    topics
      .filter(t => t.companyId && t.fieldIds.some(fid => fieldIds.includes(fid)))
      .map(t => t.companyId!)
  )
  return companies.filter(c => relevantCompanyIds.has(c.id))
}

export function topicsForSourcesAndFields(
  selectedSourceIds: string[],
  fieldIds: string[],
  pathways: ('academic' | 'industry')[]
): Topic[] {
  if (selectedSourceIds.length === 0) return []
  return topics.filter(t => {
    const fieldMatch = fieldIds.length === 0 || t.fieldIds.some(fid => fieldIds.includes(fid))
    if (!fieldMatch) return false
    if (pathways.includes('academic') && t.supervisorIds.some(sid => selectedSourceIds.includes(sid))) return true
    if (pathways.includes('industry') && t.companyId && selectedSourceIds.includes(t.companyId)) return true
    return false
  })
}

// -- Display helpers --

export function degreeLabel(degree: Degree): string {
  return { bsc: 'BSc', msc: 'MSc', phd: 'PhD' }[degree]
}

export function workplaceLabel(w: TopicWorkplaceType): string {
  return { on_site: 'On-site', hybrid: 'Hybrid', remote: 'Remote' }[w]
}

export function employmentTypeLabel(e: TopicEmploymentType): string {
  return {
    internship: 'Internship',
    working_student: 'Working Student',
    graduate_program: 'Graduate Program',
    direct_entry: 'Direct Entry',
  }[e]
}
