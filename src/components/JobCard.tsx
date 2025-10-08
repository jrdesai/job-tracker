'use client'

import { Job } from '@/lib/types'
import { getFileIcon } from '@/lib/client-resume-utils'

interface JobCardProps {
  job: Job
  onEdit?: (job: Job) => void
  onDelete?: (jobId: string) => void
}

export default function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800'
      case 'interview':
        return 'bg-yellow-100 text-yellow-800'
      case 'offer':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString()
  }

  const formatSalary = (salary?: number) => {
    if (!salary) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(salary)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${Math.round(bytes / (1024 * 1024))} MB`
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
          <p className="text-gray-600">{job.company}</p>
          <p className="text-sm text-gray-500">{job.location}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p><span className="font-medium">Applied:</span> {formatDate(job.appliedDate)}</p>
        {job.salary && (
          <p><span className="font-medium">Salary:</span> {formatSalary(job.salary)}</p>
        )}
        {job.jobUrl && (
          <p>
            <span className="font-medium">URL:</span>{' '}
            <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800">
              View Job Posting
            </a>
          </p>
        )}
        {job.resume && (
          <p>
            <span className="font-medium">Resume:</span>{' '}
            <a 
              href={job.resume.path || job.resume.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-indigo-600 hover:text-indigo-800 inline-flex items-center"
            >
              <span className="mr-1">{getFileIcon(job.resume.name)}</span>
              {job.resume.name}
              <span className="ml-1 text-xs text-gray-500">
                ({formatFileSize(job.resume.size)})
              </span>
            </a>
          </p>
        )}
        {job.notes && (
          <p><span className="font-medium">Notes:</span> {job.notes}</p>
        )}
      </div>

      {(onEdit || onDelete) && (
        <div className="mt-4 flex space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(job)}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(job.id)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
