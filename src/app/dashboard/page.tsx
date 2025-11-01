'use client'

import { useState, useEffect } from 'react'
import { Job, CreateJobData } from '@/lib/types'
import JobForm from '@/components/JobForm'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Search, Briefcase, Calendar, CheckCircle, FileUp } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { KanbanBoard } from '@/components/KanbanBoard'
import { JobDetailsModal } from '@/components/JobDetailsModal'

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [viewingJob, setViewingJob] = useState<Job | null>(null)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      const data = await response.json()
      // Ensure data is an array
      const jobsArray = Array.isArray(data) ? data : []
      setJobs(jobsArray)
      setFilteredJobs(jobsArray)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      // Set empty array on error
      setJobs([])
      setFilteredJobs([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateJob = async (jobData: CreateJobData) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      if (response.ok) {
        const newJob = await response.json()
        setJobs(prev => [newJob, ...prev])
        setFilteredJobs(prev => [newJob, ...prev])
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error creating job:', error)
    }
  }

  const handleUpdateJob = async (jobData: CreateJobData) => {
    if (!editingJob) return

    try {
      const response = await fetch(`/api/jobs/${editingJob.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      })

      if (response.ok) {
        const updatedJob = await response.json()
        setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job))
        setFilteredJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job))
        setEditingJob(null)
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error updating job:', error)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setJobs(prev => prev.filter(job => job.id !== jobId))
        setFilteredJobs(prev => prev.filter(job => job.id !== jobId))
      }
    } catch (error) {
      console.error('Error deleting job:', error)
    }
  }

  const handleStatusUpdate = async (jobId: string, status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected') => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        const updatedJob = await response.json()
        setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job))
        setFilteredJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job))
      }
    } catch (error) {
      console.error('Error updating job status:', error)
      throw error
    }
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    setShowForm(true)
  }

  const handleSearch = (query: string) => {
    setSearch(query)
    applyFilters(query, filter)
  }

  const handleFilter = (status: string) => {
    setFilter(status)
    applyFilters(search, status)
  }

  const applyFilters = (searchQuery: string, statusFilter: string) => {
    // Ensure jobs is an array
    const jobsArray = Array.isArray(jobs) ? jobs : []
    let filtered = jobsArray

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.notes && job.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter.toLowerCase())
    }

    setFilteredJobs(filtered)
  }

  const getStatusCounts = () => {
    // Ensure jobs is an array
    const jobsArray = Array.isArray(jobs) ? jobs : []
    return jobsArray.reduce((acc, job) => {
      const status = job.status.toLowerCase()
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  // Filter jobs for kanban board
  const getFilteredJobsForKanban = () => {
    // Ensure jobs is an array
    const jobsArray = Array.isArray(jobs) ? jobs : []
    let filtered = jobsArray

    // Apply search filter
    if (search.trim()) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase()) ||
        (job.notes && job.notes.toLowerCase().includes(search.toLowerCase()))
      )
    }

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(job => job.status === filter.toLowerCase())
    }

    return filtered
  }

  const getUpcomingInterviews = () => {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    // Collect all upcoming interviews from all jobs
    const upcomingInterviews: Array<{ job: Job; interview: any }> = []
    
    // Ensure jobs is an array
    const jobsArray = Array.isArray(jobs) ? jobs : []
    
    jobsArray.forEach(job => {
      // Check if interviews exists and is an array
      if (job.interviews && Array.isArray(job.interviews) && job.interviews.length > 0) {
        job.interviews
          .filter(interview => interview.status === 'scheduled')
          .forEach(interview => {
            const interviewDate = new Date(interview.scheduledDate)
            if (interviewDate >= now && interviewDate <= nextWeek) {
              upcomingInterviews.push({ job, interview })
            }
          })
      }
    })
    
    return upcomingInterviews.sort((a, b) => 
      new Date(a.interview.scheduledDate).getTime() - new Date(b.interview.scheduledDate).getTime()
    )
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

  const statusCounts = getStatusCounts()
  const upcomingInterviews = getUpcomingInterviews()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
          <Briefcase className="text-primary" /> Job Application Tracker
        </h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            onClick={() => {
              setEditingJob(null)
              setShowForm(true)
            }}
            className="flex items-center gap-2"
          >
            <PlusCircle size={18} /> Add Application
          </Button>
        </div>
      </header>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-1.5 mb-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="!p-1">
            <div className="flex items-center justify-center gap-2">
              <p className="text-3xl font-bold text-foreground">{statusCounts.saved || 0}</p>
              <p className="text-base font-semibold text-muted-foreground">Saved</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="!p-1">
            <div className="flex items-center justify-center gap-2">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{statusCounts.applied || 0}</p>
              <p className="text-base font-semibold text-muted-foreground">Applied</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="!p-1">
            <div className="flex items-center justify-center gap-2">
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{statusCounts.interview || 0}</p>
              <p className="text-base font-semibold text-muted-foreground">Interview</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="!p-1">
            <div className="flex items-center justify-center gap-2">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{statusCounts.offer || 0}</p>
              <p className="text-base font-semibold text-muted-foreground">Offer</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="!p-1">
            <div className="flex items-center justify-center gap-2">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{statusCounts.rejected || 0}</p>
              <p className="text-base font-semibold text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Interviews - Compact Horizontal List */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Calendar className="text-primary" size={14} />
          <h3 className="text-xs font-semibold text-foreground">
            Upcoming Interviews {upcomingInterviews.length > 0 && `(${upcomingInterviews.length})`}
          </h3>
        </div>
        {upcomingInterviews.length > 0 ? (
          <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
            {upcomingInterviews.map(({ job, interview }) => {
              const interviewDate = new Date(interview.scheduledDate)
              const now = new Date()
              const isToday = interviewDate.toDateString() === now.toDateString()
              const isTomorrow = interviewDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
              
              return (
                <div
                  key={`${job.id}-${interview.scheduledDate}`}
                  className="flex-shrink-0 hover:shadow-md transition-all cursor-pointer border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 min-w-[200px] rounded-lg p-2"
                  onClick={() => setViewingJob(job)}
                >
                  {/* Prominent Date/Time Section */}
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded px-2 py-1 mb-1.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <Calendar size={12} className="text-blue-700 dark:text-blue-300 flex-shrink-0" />
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-100">
                        {isToday ? 'TODAY' : isTomorrow ? 'TOMORROW' : interviewDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-blue-800 dark:text-blue-200">
                        {interviewDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Company and Title */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-blue-900 dark:text-blue-100 truncate leading-tight">
                      {job.company}
                    </h4>
                    <p className="text-[10px] text-blue-800 dark:text-blue-200 truncate leading-tight mt-0.5">{job.title}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No upcoming interviews in the next 7 days</p>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 text-muted-foreground" size={18} />
          <Input
            placeholder="Search by company, title, or location..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select onValueChange={handleFilter} defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="saved">Saved</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Job Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-card">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-card-foreground mb-4">
                {editingJob ? 'Edit Job' : 'Add New Job'}
              </h3>
              <JobForm
                onSubmit={editingJob ? handleUpdateJob : handleCreateJob}
                initialData={editingJob || undefined}
                isEditing={!!editingJob}
              />
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingJob(null)
                }}
                className="mt-4 w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <KanbanBoard
        jobs={getFilteredJobsForKanban()}
        onJobUpdate={handleStatusUpdate}
        onEditJob={handleEditJob}
        onDeleteJob={handleDeleteJob}
        onViewJob={setViewingJob}
      />

      {/* Job Details Modal */}
      <JobDetailsModal
        job={viewingJob}
        onClose={() => setViewingJob(null)}
        onEdit={(job) => {
          setViewingJob(null)
          handleEditJob(job)
        }}
        onDelete={(jobId) => {
          setViewingJob(null)
          handleDeleteJob(jobId)
        }}
      />
    </div>
  )
}

