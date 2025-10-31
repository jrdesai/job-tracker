'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Job } from '@/lib/types'
import { JobCard } from './KanbanJobCard'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type JobStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'

interface KanbanColumnProps {
  id: JobStatus
  title: string
  jobs: Job[]
  onEditJob: (job: Job) => void
  onDeleteJob: (jobId: string) => void
  onViewJob?: (job: Job) => void
}

const statusColors: Record<JobStatus, string> = {
  saved: 'bg-gray-100 dark:bg-gray-800',
  applied: 'bg-blue-100 dark:bg-blue-900/20',
  interview: 'bg-yellow-100 dark:bg-yellow-900/20',
  offer: 'bg-green-100 dark:bg-green-900/20',
  rejected: 'bg-red-100 dark:bg-red-900/20',
}

const statusBorderColors: Record<JobStatus, string> = {
  saved: 'border-gray-300 dark:border-gray-700',
  applied: 'border-blue-300 dark:border-blue-700',
  interview: 'border-yellow-300 dark:border-yellow-700',
  offer: 'border-green-300 dark:border-green-700',
  rejected: 'border-red-300 dark:border-red-700',
}

export function KanbanColumn({
  id,
  title,
  jobs,
  onEditJob,
  onDeleteJob,
  onViewJob,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      status: id,
    },
  })

  return (
    <div className="flex flex-col flex-1 min-w-0">
      <div
        className={cn(
          'px-4 py-2 rounded-t-lg border-b-2 font-semibold text-sm',
          statusColors[id],
          statusBorderColors[id]
        )}
      >
        <span className="text-foreground">{title}</span>
        <span className="ml-2 text-muted-foreground">({jobs.length})</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 min-h-[500px] p-2 space-y-2 rounded-b-lg border-2 border-t-0 transition-colors',
          statusBorderColors[id],
          isOver ? 'bg-muted/50' : 'bg-background'
        )}
      >
        <SortableContext items={jobs.map((job) => `job-${job.id}`)} strategy={verticalListSortingStrategy}>
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEditJob={onEditJob}
              onDeleteJob={onDeleteJob}
              onViewJob={onViewJob}
            />
          ))}
        </SortableContext>
        {jobs.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            No jobs in this stage
          </div>
        )}
      </div>
    </div>
  )
}

