'use client'

import { Interview, InterviewStatus } from '@/lib/types'
import { InterviewCard } from './InterviewCard'
import { Button } from '@/components/ui/button'
import { Plus, Calendar } from 'lucide-react'

interface InterviewListProps {
  interviews: Interview[]
  jobId: string
  onAddInterview?: () => void
  onEditInterview?: (interview: Interview) => void
  onDeleteInterview?: (interviewId: string) => void
  onStatusUpdate?: (interviewId: string, status: InterviewStatus) => void
}

export function InterviewList({ 
  interviews, 
  jobId,
  onAddInterview,
  onEditInterview,
  onDeleteInterview,
  onStatusUpdate
}: InterviewListProps) {
  // Ensure interviews is always an array
  const interviewsArray = Array.isArray(interviews) ? interviews : []
  
  const scheduledInterviews = interviewsArray.filter(i => i.status === 'scheduled').sort(
    (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  )
  
  const completedInterviews = interviewsArray.filter(i => i.status === 'completed').sort(
    (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  )
  
  const otherInterviews = interviewsArray.filter(
    i => i.status !== 'scheduled' && i.status !== 'completed'
  ).sort(
    (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  )

  if (interviewsArray.length === 0 && !onAddInterview) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="text-primary" size={18} />
          <h3 className="text-lg font-semibold text-foreground">
            Interviews ({interviewsArray.length})
          </h3>
        </div>
        {onAddInterview && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddInterview}
            className="gap-1"
          >
            <Plus size={14} />
            Schedule Interview
          </Button>
        )}
      </div>

      {/* Scheduled Interviews */}
      {scheduledInterviews.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Upcoming</h4>
          <div className="space-y-2">
            {scheduledInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onEdit={onEditInterview}
                onDelete={onDeleteInterview}
                onStatusUpdate={onStatusUpdate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Interviews */}
      {completedInterviews.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Completed</h4>
          <div className="space-y-2">
            {completedInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onEdit={onEditInterview}
                onDelete={onDeleteInterview}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Status Interviews */}
      {otherInterviews.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Other</h4>
          <div className="space-y-2">
            {otherInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onEdit={onEditInterview}
                onDelete={onDeleteInterview}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {interviewsArray.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No interviews scheduled</p>
          {onAddInterview && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddInterview}
              className="mt-4 gap-1"
            >
              <Plus size={14} />
              Schedule First Interview
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

