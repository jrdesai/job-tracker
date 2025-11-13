'use client'

import { useState, useEffect } from 'react'
import { Job, Interview, CreateInterviewData, UpdateInterviewData } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, DollarSign, FileText, ExternalLink, X, Edit, Trash2 } from 'lucide-react'
import { InterviewList } from './InterviewList'
import InterviewForm from './InterviewForm'
import { motion, AnimatePresence } from 'framer-motion'

interface JobDetailsModalProps {
  job: Job | null
  onClose: () => void
  onEdit: (job: Job) => void
  onDelete: (jobId: string) => void
}

export function JobDetailsModal({ job, onClose, onEdit, onDelete }: JobDetailsModalProps) {
  // Ensure interviews is always an array
  const initialInterviews = Array.isArray(job?.interviews) ? job.interviews : []
  const [interviews, setInterviews] = useState<Interview[]>(initialInterviews)
  const [showInterviewForm, setShowInterviewForm] = useState(false)
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)

  useEffect(() => {
    if (job?.interviews && Array.isArray(job.interviews) && job.interviews.length > 0) {
      setInterviews(job.interviews)
    } else if (job) {
      fetchInterviews(job.id)
    }
  }, [job])

  // Handle ESC key to close
  useEffect(() => {
    if (!job) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [job, onClose])

  const fetchInterviews = async (jobId: string) => {
    try {
      const response = await fetch(`/api/interviews?jobId=${jobId}`)
      const data = await response.json()
      // Ensure data is an array
      setInterviews(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching interviews:', error)
      setInterviews([])
    }
  }

  const handleCreateInterview = async (interviewData: CreateInterviewData) => {
    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewData),
      })

      if (response.ok) {
        const newInterview = await response.json()
        setInterviews(prev => [...prev, newInterview])
        setShowInterviewForm(false)
        // Refresh job data if needed
      }
    } catch (error) {
      console.error('Error creating interview:', error)
    }
  }

  const handleUpdateInterview = async (interviewData: UpdateInterviewData) => {
    if (!editingInterview) return

    try {
      const response = await fetch(`/api/interviews/${editingInterview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewData),
      })

      if (response.ok) {
        const updatedInterview = await response.json()
        setInterviews(prev => prev.map(i => i.id === updatedInterview.id ? updatedInterview : i))
        setEditingInterview(null)
        setShowInterviewForm(false)
      }
    } catch (error) {
      console.error('Error updating interview:', error)
    }
  }

  const handleDeleteInterview = async (interviewId: string) => {
    if (!confirm('Are you sure you want to delete this interview?')) return

    try {
      const response = await fetch(`/api/interviews/${interviewId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setInterviews(prev => prev.filter(i => i.id !== interviewId))
      }
    } catch (error) {
      console.error('Error deleting interview:', error)
    }
  }

  const handleStatusUpdate = async (interviewId: string, status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show') => {
    try {
      const response = await fetch(`/api/interviews/${interviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        const updatedInterview = await response.json()
        setInterviews(prev => prev.map(i => i.id === updatedInterview.id ? updatedInterview : i))
      }
    } catch (error) {
      console.error('Error updating interview status:', error)
    }
  }

  const formatSalary = (salary: number, currency: string) => {
    const currencySymbols: { [key: string]: string } = {
      'GBP': '£',
      'USD': '$',
      'EUR': '€',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥',
      'CHF': 'CHF',
      'SEK': 'SEK',
      'NOK': 'NOK',
      'DKK': 'DKK'
    }
    
    const symbol = currencySymbols[currency] || currency
    return `${symbol}${salary.toLocaleString()}`
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      saved: 'Saved',
      applied: 'Applied',
      interview: 'Interviewing',
      offer: 'Offer',
      rejected: 'Rejected'
    }
    return labels[status] || status
  }

  return (
    <AnimatePresence>
      {job && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-50"
            onClick={onClose}
          />
          
          {/* Side Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full md:w-[600px] z-50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="h-full rounded-none md:rounded-l-lg border-l border-y-0 border-r-0 shadow-2xl flex flex-col">
              <CardContent className="p-6 flex-1 overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-6 sticky top-0 bg-card pb-4 border-b -mx-6 px-6">
                  <div className="flex-1 min-w-0 pr-4">
                    <h2 className="text-2xl font-bold text-foreground mb-1 truncate">{job.company}</h2>
                    <p className="text-lg text-muted-foreground truncate">{job.title}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 flex-shrink-0"
                  >
                    <X size={18} />
                  </Button>
                </div>

                {/* Job Details */}
                <div className="space-y-3 mb-6">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted">
                      {getStatusLabel(job.status)}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground">{job.location}</span>
                  </div>

                  {/* Applied Date */}
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground">
                      Applied: {new Date(job.appliedDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>

                  {/* Salary */}
                  {job.salary && (
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-green-600 dark:text-green-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-green-600 dark:text-green-500">
                        {formatSalary(job.salary, job.currency)}
                      </span>
                    </div>
                  )}

                  {/* Resume */}
                  {job.resume && (
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground truncate">{job.resume.name}</span>
                    </div>
                  )}
                </div>

                {/* Job URL */}
                {job.jobUrl && (
                  <div className="mb-6">
                    <span className="text-sm font-medium text-muted-foreground block mb-2">Job URL:</span>
                    <a 
                      href={job.jobUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline break-all"
                    >
                      <ExternalLink size={14} />
                      {job.jobUrl}
                    </a>
                  </div>
                )}

                {/* Notes */}
                {job.notes && (
                  <div className="mb-6">
                    <span className="text-sm font-medium text-muted-foreground block mb-2">Notes:</span>
                    <p className="text-sm text-foreground whitespace-pre-wrap bg-muted p-3 rounded-md">
                      {job.notes}
                    </p>
                  </div>
                )}

                {/* Interviews Section */}
                <div className="mb-6">
                  {showInterviewForm ? (
                    <div className="bg-muted p-4 rounded-md">
                      <InterviewForm
                        onSubmit={editingInterview ? handleUpdateInterview : handleCreateInterview}
                        initialData={editingInterview || undefined}
                        isEditing={!!editingInterview}
                        jobId={job.id}
                        onCancel={() => {
                          setShowInterviewForm(false)
                          setEditingInterview(null)
                        }}
                      />
                    </div>
                  ) : (
                    <InterviewList
                      interviews={interviews}
                      jobId={job.id}
                      onAddInterview={() => setShowInterviewForm(true)}
                      onEditInterview={(interview) => {
                        setEditingInterview(interview)
                        setShowInterviewForm(true)
                      }}
                      onDeleteInterview={handleDeleteInterview}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  )}
                </div>
              </CardContent>

              {/* Actions Footer */}
              <div className="flex gap-3 justify-end p-6 pt-4 border-t bg-card">
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose()
                    onDelete(job.id)
                  }}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
                <Button
                  onClick={() => {
                    onClose()
                    onEdit(job)
                  }}
                >
                  <Edit size={16} className="mr-2" />
                  Edit
                </Button>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

