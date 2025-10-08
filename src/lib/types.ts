export interface Resume {
  id: string
  name: string
  path: string
  url?: string
  size: number
  mimeType: string
  uploadedAt: Date
  updatedAt: Date
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  status: 'applied' | 'interview' | 'offer' | 'rejected'
  appliedDate: Date
  notes?: string
  salary?: number
  currency: string
  jobUrl?: string
  createdAt: Date
  updatedAt: Date
  resumeId?: string
  resume?: Resume
  interviewDate?: Date
  interviewNotes?: string
}

export interface CreateJobData {
  title: string
  company: string
  location: string
  status: 'applied' | 'interview' | 'offer' | 'rejected'
  appliedDate: Date
  notes?: string
  salary?: number
  currency: string
  jobUrl?: string
  resumeId?: string
  interviewDate?: Date
  interviewNotes?: string
}

export interface UpdateJobData {
  title?: string
  company?: string
  location?: string
  status?: 'applied' | 'interview' | 'offer' | 'rejected'
  appliedDate?: Date
  notes?: string
  salary?: number
  currency?: string
  jobUrl?: string
  resumeId?: string
  interviewDate?: Date
  interviewNotes?: string
}

export interface CreateResumeData {
  name: string
  path: string
  url?: string
  size: number
  mimeType: string
}
