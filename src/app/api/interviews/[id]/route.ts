import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdateInterviewData } from '@/lib/types'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            company: true,
            title: true
          }
        }
      }
    })

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    // Convert enums to lowercase for frontend
    const interviewWithLowercaseEnums = {
      ...interview,
      type: interview.type.toLowerCase() as any,
      status: interview.status.toLowerCase() as any
    }

    return NextResponse.json(interviewWithLowercaseEnums)
  } catch (error) {
    console.error('Error fetching interview:', error)
    return NextResponse.json({ error: 'Failed to fetch interview' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body: UpdateInterviewData = await request.json()

    // Build update data object
    const updateData: any = {}

    if (body.type) updateData.type = body.type.toUpperCase() as any
    if (body.status) updateData.status = body.status.toUpperCase() as any
    if (body.scheduledDate) updateData.scheduledDate = new Date(body.scheduledDate)
    if (body.duration !== undefined) updateData.duration = body.duration
    if (body.location !== undefined) updateData.location = body.location
    if (body.interviewerName !== undefined) updateData.interviewerName = body.interviewerName
    if (body.interviewerEmail !== undefined) updateData.interviewerEmail = body.interviewerEmail
    if (body.interviewerPhone !== undefined) updateData.interviewerPhone = body.interviewerPhone
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.feedback !== undefined) updateData.feedback = body.feedback
    if (body.rating !== undefined) updateData.rating = body.rating
    if (body.outcome !== undefined) updateData.outcome = body.outcome

    const interview = await prisma.interview.update({
      where: { id },
      data: updateData,
      include: {
        job: {
          select: {
            id: true,
            company: true,
            title: true
          }
        }
      }
    })

    // Convert enums to lowercase for frontend
    const interviewWithLowercaseEnums = {
      ...interview,
      type: interview.type.toLowerCase() as any,
      status: interview.status.toLowerCase() as any
    }

    return NextResponse.json(interviewWithLowercaseEnums)
  } catch (error) {
    console.error('Error updating interview:', error)
    return NextResponse.json({ error: 'Failed to update interview' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Get interview to check if it exists
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { job: true }
    })

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    // Delete interview
    await prisma.interview.delete({
      where: { id }
    })

    // Check if job has any other interviews, if not, update job status
    const remainingInterviews = await prisma.interview.count({
      where: { jobId: interview.jobId }
    })

    if (remainingInterviews === 0 && interview.job.status === 'INTERVIEW') {
      // Update job status back to APPLIED if no interviews remain
      await prisma.job.update({
        where: { id: interview.jobId },
        data: { status: 'APPLIED' }
      })
    }

    return NextResponse.json({ message: 'Interview deleted successfully' })
  } catch (error) {
    console.error('Error deleting interview:', error)
    return NextResponse.json({ error: 'Failed to delete interview' }, { status: 500 })
  }
}

