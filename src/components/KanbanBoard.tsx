'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { Job } from '@/lib/types'
import { KanbanColumn } from './KanbanColumn'
import { JobCard } from './KanbanJobCard'

type JobStatus = 'saved' | 'applied' | 'interview' | 'offer' | 'rejected'

interface KanbanBoardProps {
  jobs: Job[]
  onJobUpdate: (jobId: string, status: JobStatus) => Promise<void>
  onEditJob: (job: Job) => void
  onDeleteJob: (jobId: string) => void
  onViewJob?: (job: Job) => void
}

const columns: { id: JobStatus; title: string }[] = [
  { id: 'saved', title: 'Saved' },
  { id: 'applied', title: 'Applied' },
  { id: 'interview', title: 'Interviewing' },
  { id: 'offer', title: 'Offer' },
  { id: 'rejected', title: 'Rejected/Closed' },
]

export function KanbanBoard({
  jobs,
  onJobUpdate,
  onEditJob,
  onDeleteJob,
  onViewJob,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [jobsByStatus, setJobsByStatus] = useState<Record<JobStatus, Job[]>>({
    saved: [],
    applied: [],
    interview: [],
    offer: [],
    rejected: [],
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Update jobsByStatus when jobs prop changes
  useEffect(() => {
    const grouped: Record<JobStatus, Job[]> = {
      saved: [],
      applied: [],
      interview: [],
      offer: [],
      rejected: [],
    }

    jobs.forEach((job) => {
      const status = job.status as JobStatus
      if (grouped[status]) {
        grouped[status].push(job)
      }
    })

    setJobsByStatus(grouped)
  }, [jobs])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const jobId = (active.id as string).replace('job-', '')
    const sourceStatus = active.data.current?.status as JobStatus
    
    // Get destination - could be a column or another job card
    let destinationStatus: JobStatus | null = null
    
    // If dropped on a column (over.id is a status like 'saved', 'applied', etc.)
    if (over.data.current?.status) {
      destinationStatus = over.data.current.status as JobStatus
    } else if (typeof over.id === 'string' && over.id.startsWith('job-')) {
      // Dropped on another job card - get its status
      const targetJobId = over.id.replace('job-', '')
      const targetJob = Object.values(jobsByStatus)
        .flat()
        .find(j => j.id === targetJobId)
      
      if (targetJob) {
        destinationStatus = targetJob.status as JobStatus
        
        // If same column, just reorder
        if (destinationStatus === sourceStatus) {
          const items = jobsByStatus[sourceStatus]
          const oldIndex = items.findIndex((job) => job.id === jobId)
          const newIndex = items.findIndex((job) => job.id === targetJobId)

          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            const newItems = arrayMove(items, oldIndex, newIndex)
            setJobsByStatus({
              ...jobsByStatus,
              [sourceStatus]: newItems,
            })
          }
          return
        }
      }
    } else {
      // Check if over.id is directly a status (column)
      const columnIds = columns.map(c => c.id)
      if (columnIds.includes(over.id as JobStatus)) {
        destinationStatus = over.id as JobStatus
      }
    }

    // Move to different column
    if (destinationStatus && sourceStatus !== destinationStatus) {
      const sourceItems = jobsByStatus[sourceStatus]
      const destItems = jobsByStatus[destinationStatus]
      const job = sourceItems.find((j) => j.id === jobId)

      if (job) {
        // Optimistically update UI
        setJobsByStatus({
          ...jobsByStatus,
          [sourceStatus]: sourceItems.filter((j) => j.id !== jobId),
          [destinationStatus]: [...destItems, { ...job, status: destinationStatus }],
        })

        // Update in backend
        try {
          await onJobUpdate(jobId, destinationStatus)
        } catch (error) {
          // Revert on error
          setJobsByStatus({
            ...jobsByStatus,
            [sourceStatus]: sourceItems,
            [destinationStatus]: destItems,
          })
          console.error('Error updating job status:', error)
        }
      }
    }
  }

  const activeJob = activeId
    ? Object.values(jobsByStatus)
        .flat()
        .find((job) => `job-${job.id}` === activeId)
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 w-full">
        {columns.map((column) => {
          const columnJobs = jobsByStatus[column.id] || []
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              jobs={columnJobs}
              onEditJob={onEditJob}
              onDeleteJob={onDeleteJob}
              onViewJob={onViewJob}
            />
          )
        })}
      </div>

      <DragOverlay>
        {activeJob ? (
          <div className="opacity-90 rotate-3">
            <JobCard
              job={activeJob}
              onEditJob={onEditJob}
              onDeleteJob={onDeleteJob}
              isDragging={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

