'use client'

import { useState, useEffect } from 'react'
import { Job, CreateJobData, Resume } from '@/lib/types'

interface JobFormProps {
  onSubmit: (job: CreateJobData) => void
  initialData?: Partial<Job>
  isEditing?: boolean
}

export default function JobForm({ onSubmit, initialData, isEditing = false }: JobFormProps) {
  const [formData, setFormData] = useState<CreateJobData>({
    title: initialData?.title || '',
    company: initialData?.company || '',
    location: initialData?.location || '',
    status: initialData?.status || 'saved',
    appliedDate: initialData?.appliedDate ? new Date(initialData.appliedDate) : new Date(),
    notes: initialData?.notes || '',
    salary: initialData?.salary || undefined,
    currency: initialData?.currency || 'GBP',
    jobUrl: initialData?.jobUrl || '',
    resumeId: initialData?.resumeId || undefined,
    interviewDate: initialData?.interviewDate ? new Date(initialData.interviewDate) : undefined,
    interviewNotes: initialData?.interviewNotes || '',
  })

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loadingResumes, setLoadingResumes] = useState(true)

  useEffect(() => {
    fetchResumes()
  }, [])

  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/resumes')
      const data = await response.json()
      setResumes(data)
    } catch (error) {
      console.error('Error fetching resumes:', error)
    } finally {
      setLoadingResumes(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Normalize job URL - add https:// if missing
    const normalizedFormData = {
      ...formData,
      jobUrl: formData.jobUrl?.trim() 
        ? (formData.jobUrl.startsWith('http://') || formData.jobUrl.startsWith('https://') 
          ? formData.jobUrl 
          : `https://${formData.jobUrl}`)
        : undefined
    }
    onSubmit(normalizedFormData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salary' ? (value ? parseInt(value) : undefined) : value
    }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        const newResume = result.resume
        setResumes(prev => [newResume, ...prev])
        setFormData(prev => ({
          ...prev,
          resumeId: newResume.id
        }))
      } else {
        setUploadError(result.error || 'Failed to upload resume')
      }
    } catch (error) {
      setUploadError('Failed to upload resume')
    } finally {
      setIsUploading(false)
    }
  }

  const removeResume = () => {
    setFormData(prev => ({
      ...prev,
      resumeId: undefined
    }))
  }

  const selectedResume = resumes.find(r => r.id === formData.resumeId)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Job Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Company
        </label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="applied">Applied</option>
          <option value="saved">Saved</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div>
        <label htmlFor="appliedDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Applied Date
        </label>
        <input
          type="date"
          id="appliedDate"
          name="appliedDate"
          value={formData.appliedDate.toISOString().split('T')[0]}
          onChange={(e) => setFormData(prev => ({ ...prev, appliedDate: new Date(e.target.value) }))}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Interview Date - Only show when status is interview */}
      {formData.status === 'interview' && (
        <div>
          <label htmlFor="interviewDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Interview Date
          </label>
          <input
            type="datetime-local"
            id="interviewDate"
            name="interviewDate"
            value={formData.interviewDate ? formData.interviewDate.toISOString().slice(0, 16) : ''}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              interviewDate: e.target.value ? new Date(e.target.value) : undefined 
            }))}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      )}

      {/* Interview Notes - Only show when status is interview */}
      {formData.status === 'interview' && (
        <div>
          <label htmlFor="interviewNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Interview Notes (optional)
          </label>
          <textarea
            id="interviewNotes"
            name="interviewNotes"
            value={formData.interviewNotes || ''}
            onChange={handleChange}
            rows={3}
            placeholder="Add notes about the interview..."
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      )}

      <div>
        <label htmlFor="salary" className="block text-sm font-medium text-gray-700">
          Salary (optional)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            id="salary"
            name="salary"
            value={formData.salary || ''}
            onChange={handleChange}
            placeholder="Enter amount"
            className="mt-1 block flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="GBP">£</option>
            <option value="USD">$</option>
            <option value="EUR">€</option>
            <option value="CAD">C$</option>
            <option value="INR">₹</option>
            <option value="AUD">A$</option>
            <option value="JPY">¥</option>
            <option value="CHF">CHF</option>
            <option value="SEK">SEK</option>
            <option value="NOK">NOK</option>
            <option value="DKK">DKK</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="jobUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Job URL (optional)
        </label>
        <input
          type="text"
          id="jobUrl"
          name="jobUrl"
          value={formData.jobUrl}
          onChange={handleChange}
          placeholder="https://www.linkedin.com/jobs/..."
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Enter full URL (e.g., https://www.linkedin.com/jobs/view/...) or just the domain
        </p>
      </div>

      {/* Resume Selection/Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Resume (optional)
        </label>
        
        {selectedResume ? (
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-600">
            <div className="flex items-center">
              <span className="text-lg mr-2">📄</span>
              <div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{selectedResume.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  ({Math.round(selectedResume.size / 1024)} KB)
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={removeResume}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Existing Resumes Dropdown */}
            {!loadingResumes && resumes.length > 0 && (
              <div>
                <label htmlFor="existingResume" className="block text-xs font-medium text-gray-600 mb-1">
                  Use existing resume:
                </label>
                <select
                  id="existingResume"
                  onChange={(e) => {
                    if (e.target.value) {
                      setFormData(prev => ({ ...prev, resumeId: e.target.value }))
                    }
                  }}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                >
                  <option value="">Select a resume...</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.name} ({Math.round(resume.size / 1024)} KB)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Upload New Resume */}
            <div>
              <label htmlFor="resume" className="block text-xs font-medium text-gray-600 mb-1">
                Or upload new resume:
              </label>
              <input
                type="file"
                id="resume"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                PDF, DOC, DOCX, or TXT files only. Max size: 5MB
              </p>
              {uploadError && (
                <p className="mt-1 text-xs text-red-600">{uploadError}</p>
              )}
              {isUploading && (
                <p className="mt-1 text-xs text-blue-600">Uploading...</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      <button
        type="submit"
        disabled={isUploading}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isEditing ? 'Update Job' : 'Add Job'}
      </button>
    </form>
  )
}
