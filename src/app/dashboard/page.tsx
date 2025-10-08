'use client'

import { useState, useEffect } from 'react'
import { Job, CreateJobData } from '@/lib/types'
import JobForm from '@/components/JobForm'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Search, Briefcase, Calendar, CheckCircle, FileUp, Edit, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs')
      const data = await response.json()
      setJobs(data)
      setFilteredJobs(data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
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
    let filtered = jobs

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
    return jobs.reduce((acc, job) => {
      const status = job.status.toLowerCase()
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  const getUpcomingInterviews = () => {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return jobs.filter(job => {
      if (job.status !== 'interview' || !job.interviewDate) {
        return false
      }
      
      const interviewDate = new Date(job.interviewDate)
      return interviewDate >= now && interviewDate <= nextWeek
    }).sort((a, b) => 
      new Date(a.interviewDate!).getTime() - new Date(b.interviewDate!).getTime()
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <Briefcase className="text-blue-600 dark:text-blue-400" /> Job Application Tracker
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">📋</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Applied</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{statusCounts.applied || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 dark:text-yellow-400 font-semibold">🎯</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Interview</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{statusCounts.interview || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-semibold">🎉</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Offer</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{statusCounts.offer || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <span className="text-red-600 dark:text-red-400 font-semibold">❌</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{statusCounts.rejected || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Interviews Section */}
      {upcomingInterviews.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
            Upcoming Interviews
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingInterviews.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-lg transition-shadow border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">{job.company}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300">
                        Interview
                      </span>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">{job.title}</p>
                    <div className="flex items-center text-sm text-blue-700 dark:text-blue-300 mb-2">
                      <Calendar size={14} className="mr-1"/>
                      {new Date(job.interviewDate!).toLocaleDateString()} at {new Date(job.interviewDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {job.interviewNotes && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">{job.interviewNotes}</p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditJob(job)}
                      className="w-full text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 text-gray-400" size={18} />
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
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Job Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border dark:border-gray-700 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
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

      {/* Jobs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.map((job) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-64"
          >
            <Card className="hover:shadow-lg transition-shadow h-full">
              <CardContent className="p-4 h-full flex flex-col">
                {/* Header with Status Tag - Fixed Height */}
                <div className="flex justify-between items-start mb-2 h-10">
                  <h2 className="text-lg font-semibold flex-1 pr-2 truncate text-gray-900 dark:text-gray-100">{job.company}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    job.status === 'offer' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                    job.status === 'interview' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                    job.status === 'rejected' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
                
                {/* Job Details - Flexible Height */}
                <div className="flex-1 space-y-1 mb-3">
                  <p className="text-gray-600 dark:text-gray-300 font-medium truncate">{job.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{job.location}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar size={12} className="mr-1"/>
                    {new Date(job.appliedDate).toLocaleDateString()}
                  </div>
                  
                  {job.salary && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">{formatSalary(job.salary, job.currency)}</p>
                  )}
                  
                  {job.resume && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">📄 {job.resume.name}</p>
                  )}
                </div>
                
                {/* Action Buttons - Fixed Height */}
                <div className="flex justify-end gap-2 h-8 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditJob(job)}
                    className="p-2 h-7 w-7"
                    title="Edit job"
                  >
                    <Edit size={12} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-2 h-7 w-7 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete job"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
          <CheckCircle className="mx-auto mb-2 text-gray-400 dark:text-gray-500" size={32} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No applications found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {jobs.length === 0 
              ? "Start tracking your job applications by adding your first job."
              : "Try adjusting your search or filter criteria."
            }
          </p>
        </div>
      )}
    </div>
  )
}

