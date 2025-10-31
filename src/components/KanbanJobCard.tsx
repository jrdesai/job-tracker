'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Job } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Edit, Trash2, MapPin, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface JobCardProps {
  job: Job
  onEditJob: (job: Job) => void
  onDeleteJob: (jobId: string) => void
  onViewJob?: (job: Job) => void
  isDragging?: boolean
}

export function JobCard({
  job,
  onEditJob,
  onDeleteJob,
  onViewJob,
  isDragging = false,
}: JobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: `job-${job.id}`, data: { status: job.status } })

  const [mouseDownPos, setMouseDownPos] = useState<{ x: number; y: number } | null>(null)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseDownPos({ x: e.clientX, y: e.clientY })
  }

  const handleClick = (e: React.MouseEvent) => {
    // Only treat as click if mouse didn't move much (within 5px)
    if (mouseDownPos && onViewJob && !isSortableDragging) {
      const deltaX = Math.abs(e.clientX - mouseDownPos.x)
      const deltaY = Math.abs(e.clientY - mouseDownPos.y)
      
      if (deltaX < 5 && deltaY < 5) {
        const target = e.target as HTMLElement
        // Don't open if clicking on buttons
        if (!target.closest('button')) {
          onViewJob(job)
        }
      }
    }
    setMouseDownPos(null)
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

  if (isDragging) {
    return (
      <Card className="w-full cursor-grabbing shadow-lg">
        <CardContent className="p-1.5">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground truncate text-sm leading-tight">{job.company}</h3>
              <p className="text-xs text-muted-foreground truncate leading-tight">{job.title}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="cursor-grab active:cursor-grabbing"
    >
      <Card
        className={cn(
          'hover:shadow-lg transition-all relative group',
          isSortableDragging && 'shadow-xl opacity-50',
          !isSortableDragging && onViewJob && 'cursor-pointer'
        )}
        {...attributes}
        {...listeners}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        <CardContent className="p-1.5">
          {/* Header with company/title and action buttons */}
          <div className="flex justify-between items-start mb-1 gap-1.5">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground truncate text-sm leading-tight">{job.company}</h3>
              <p className="text-xs text-muted-foreground truncate leading-tight">{job.title}</p>
            </div>
            {/* Action buttons - shown on hover */}
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 pointer-events-auto" onMouseDown={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={(e) => {
                  e.stopPropagation()
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onEditJob(job)
                }}
                className="h-6 w-6 pointer-events-auto"
                title="Edit"
              >
                <Edit size={12} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onMouseDown={(e) => {
                  e.stopPropagation()
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onDeleteJob(job.id)
                }}
                className="h-6 w-6 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 pointer-events-auto"
                title="Delete"
              >
                <Trash2 size={12} />
              </Button>
            </div>
          </div>
          
          {/* Compact info grid */}
          <div className="space-y-0.5">
            {/* Location */}
            <div className="flex items-center text-xs text-muted-foreground leading-tight">
              <MapPin size={10} className="mr-0.5 flex-shrink-0" />
              <span className="truncate">{job.location}</span>
            </div>
            
            {/* Date and Salary */}
            <div className="flex items-center gap-2 text-xs leading-tight">
              <div className="flex items-center text-muted-foreground">
                <Calendar size={10} className="mr-0.5 flex-shrink-0" />
                <span>{new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              {job.salary && (
                <span className="text-green-600 dark:text-green-500 font-semibold">
                  {formatSalary(job.salary, job.currency)}
                </span>
              )}
            </div>
            
            {/* Resume */}
            {job.resume && (
              <div className="flex items-center text-xs text-muted-foreground truncate leading-tight">
                <FileText size={10} className="mr-0.5 flex-shrink-0" />
                <span className="truncate">{job.resume.name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

