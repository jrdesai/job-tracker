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

export type InterviewType = 
  | 'phone_screen' 
  | 'technical' 
  | 'behavioral' 
  | 'final_round' 
  | 'on_site' 
  | 'video' 
  | 'assessment' 
  | 'other'

export type InterviewStatus = 
  | 'scheduled' 
  | 'completed' 
  | 'cancelled' 
  | 'rescheduled' 
  | 'no_show'

export interface Interview {
  id: string
  jobId: string
  type: InterviewType
  status: InterviewStatus
  scheduledDate: Date
  duration?: number
  location?: string
  interviewerName?: string
  interviewerEmail?: string
  interviewerPhone?: string
  notes?: string
  feedback?: string
  rating?: number
  outcome?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateInterviewData {
  jobId: string
  type: InterviewType
  scheduledDate: Date
  duration?: number
  location?: string
  interviewerName?: string
  interviewerEmail?: string
  interviewerPhone?: string
  notes?: string
}

export interface UpdateInterviewData {
  type?: InterviewType
  status?: InterviewStatus
  scheduledDate?: Date
  duration?: number
  location?: string
  interviewerName?: string
  interviewerEmail?: string
  interviewerPhone?: string
  notes?: string
  feedback?: string
  rating?: number
  outcome?: string
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'
  appliedDate: Date
  notes?: string
  salary?: number
  currency: string
  jobUrl?: string
  createdAt: Date
  updatedAt: Date
  resumeId?: string
  resume?: Resume
  interviews?: Interview[]
}

export interface CreateJobData {
  title: string
  company: string
  location: string
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'
  appliedDate: Date
  notes?: string
  salary?: number
  currency: string
  jobUrl?: string
  resumeId?: string
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
}

export interface CreateResumeData {
  name: string
  path: string
  url?: string
  size: number
  mimeType: string
}
