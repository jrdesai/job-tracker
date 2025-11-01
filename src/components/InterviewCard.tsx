'use client'

import { Interview, InterviewStatus } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, User, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InterviewCardProps {
  interview: Interview
  onEdit?: (interview: Interview) => void
  onDelete?: (interviewId: string) => void
  onStatusUpdate?: (interviewId: string, status: InterviewStatus) => void
}

export function InterviewCard({ interview, onEdit, onDelete, onStatusUpdate }: InterviewCardProps) {
  const interviewDate = new Date(interview.scheduledDate)
  const isPast = interviewDate < new Date()
  const isToday = interviewDate.toDateString() === new Date().toDateString()

  const getStatusColor = (status: InterviewStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'no_show':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusIcon = (status: InterviewStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} />
      case 'cancelled':
      case 'no_show':
        return <XCircle size={14} />
      case 'rescheduled':
        return <AlertCircle size={14} />
      default:
        return <Calendar size={14} />
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      phone_screen: 'Phone Screen',
      technical: 'Technical',
      behavioral: 'Behavioral',
      final_round: 'Final Round',
      on_site: 'On-Site',
      video: 'Video',
      assessment: 'Assessment',
      other: 'Other'
    }
    return labels[type] || type
  }

  return (
    <Card className={cn(
      "hover:shadow-md transition-all",
      isPast && interview.status === 'scheduled' && "border-yellow-500 dark:border-yellow-600",
      isToday && interview.status === 'scheduled' && "border-blue-500 dark:border-blue-600"
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1",
                getStatusColor(interview.status)
              )}>
                {getStatusIcon(interview.status)}
                {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {getTypeLabel(interview.type)}
              </span>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} className="text-muted-foreground" />
              <span className={cn(
                "text-sm font-medium",
                isToday && interview.status === 'scheduled' && "text-blue-600 dark:text-blue-400",
                isPast && interview.status === 'scheduled' && "text-yellow-600 dark:text-yellow-400"
              )}>
                {isToday ? 'Today' : interviewDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: interviewDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                })}
              </span>
              <span className="text-sm text-muted-foreground">
                {interviewDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Duration & Location */}
            {(interview.duration || interview.location) && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                {interview.duration && (
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{interview.duration} min</span>
                  </div>
                )}
                {interview.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{interview.location}</span>
                  </div>
                )}
              </div>
            )}

            {/* Interviewer */}
            {interview.interviewerName && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <User size={12} />
                <span>{interview.interviewerName}</span>
              </div>
            )}

            {/* Notes Preview */}
            {interview.notes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {interview.notes}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(interview)}
                className="h-7 w-7"
                title="Edit"
              >
                <Edit size={14} />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(interview.id)}
                className="h-7 w-7 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                title="Delete"
              >
                <Trash2 size={14} />
              </Button>
            )}
            {onStatusUpdate && interview.status === 'scheduled' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onStatusUpdate(interview.id, 'completed')}
                className="h-7 w-7 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                title="Mark as completed"
              >
                <CheckCircle size={14} />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

