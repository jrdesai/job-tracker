'use client'

import { useState } from 'react'
import { CreateInterviewData, UpdateInterviewData, InterviewType, Interview } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, MapPin, User, Mail, Phone, FileText } from 'lucide-react'

interface InterviewFormProps {
  onSubmit: (interview: CreateInterviewData | UpdateInterviewData) => void
  initialData?: Partial<Interview>
  isEditing?: boolean
  jobId: string
  onCancel?: () => void
}

export default function InterviewForm({ 
  onSubmit, 
  initialData, 
  isEditing = false,
  jobId,
  onCancel 
}: InterviewFormProps) {
  const [formData, setFormData] = useState<CreateInterviewData>({
    jobId: jobId,
    type: (initialData?.type || 'phone_screen') as InterviewType,
    scheduledDate: initialData?.scheduledDate 
      ? new Date(initialData.scheduledDate) 
      : new Date(),
    duration: initialData?.duration || 60,
    location: initialData?.location || '',
    interviewerName: initialData?.interviewerName || '',
    interviewerEmail: initialData?.interviewerEmail || '',
    interviewerPhone: initialData?.interviewerPhone || '',
    notes: initialData?.notes || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? (value ? parseInt(value) : undefined) : value
    }))
  }

  const interviewTypes: { value: InterviewType; label: string }[] = [
    { value: 'phone_screen', label: 'Phone Screen' },
    { value: 'technical', label: 'Technical' },
    { value: 'behavioral', label: 'Behavioral' },
    { value: 'final_round', label: 'Final Round' },
    { value: 'on_site', label: 'On-Site' },
    { value: 'video', label: 'Video' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Interview Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">
          Interview Type
        </label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as InterviewType }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select interview type" />
          </SelectTrigger>
          <SelectContent>
            {interviewTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Scheduled Date & Time */}
      <div>
        <label htmlFor="scheduledDate" className="block text-sm font-medium text-foreground mb-1">
          <Calendar className="inline mr-1" size={14} />
          Scheduled Date & Time
        </label>
        <Input
          type="datetime-local"
          id="scheduledDate"
          name="scheduledDate"
          value={formData.scheduledDate.toISOString().slice(0, 16)}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            scheduledDate: e.target.value ? new Date(e.target.value) : new Date() 
          }))}
          required
          className="bg-background"
        />
      </div>

      {/* Duration */}
      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-foreground mb-1">
          <Clock className="inline mr-1" size={14} />
          Duration (minutes)
        </label>
        <Input
          type="number"
          id="duration"
          name="duration"
          value={formData.duration || ''}
          onChange={handleChange}
          min="15"
          step="15"
          placeholder="60"
          className="bg-background"
        />
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">
          <MapPin className="inline mr-1" size={14} />
          Location
        </label>
        <Input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Zoom, Office, Remote, etc."
          className="bg-background"
        />
      </div>

      {/* Interviewer Information */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Interviewer Information</h3>
        
        <div>
          <label htmlFor="interviewerName" className="block text-sm font-medium text-foreground mb-1">
            <User className="inline mr-1" size={14} />
            Name
          </label>
          <Input
            type="text"
            id="interviewerName"
            name="interviewerName"
            value={formData.interviewerName}
            onChange={handleChange}
            placeholder="Interviewer name"
            className="bg-background"
          />
        </div>

        <div>
          <label htmlFor="interviewerEmail" className="block text-sm font-medium text-foreground mb-1">
            <Mail className="inline mr-1" size={14} />
            Email
          </label>
          <Input
            type="email"
            id="interviewerEmail"
            name="interviewerEmail"
            value={formData.interviewerEmail}
            onChange={handleChange}
            placeholder="interviewer@company.com"
            className="bg-background"
          />
        </div>

        <div>
          <label htmlFor="interviewerPhone" className="block text-sm font-medium text-foreground mb-1">
            <Phone className="inline mr-1" size={14} />
            Phone
          </label>
          <Input
            type="tel"
            id="interviewerPhone"
            name="interviewerPhone"
            value={formData.interviewerPhone}
            onChange={handleChange}
            placeholder="Phone number"
            className="bg-background"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1">
          <FileText className="inline mr-1" size={14} />
          Preparation Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Interview preparation notes, questions to ask, etc."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">
          {isEditing ? 'Update Interview' : 'Schedule Interview'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

