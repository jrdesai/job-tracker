import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateInterviewData } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const jobId = searchParams.get('jobId')

    if (jobId) {
      // Get all interviews for a specific job
      const interviews = await prisma.interview.findMany({
        where: {
          jobId: jobId
        },
        orderBy: {
          scheduledDate: 'asc'
        }
      })

      // Convert enums to lowercase for frontend
      const interviewsWithLowercaseEnums = interviews.map(interview => ({
        ...interview,
        type: interview.type.toLowerCase() as any,
        status: interview.status.toLowerCase() as any
      }))

      return NextResponse.json(interviewsWithLowercaseEnums)
    }

    // Get all interviews
    const interviews = await prisma.interview.findMany({
      orderBy: {
        scheduledDate: 'asc'
      },
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
    const interviewsWithLowercaseEnums = interviews.map(interview => ({
      ...interview,
      type: interview.type.toLowerCase() as any,
      status: interview.status.toLowerCase() as any
    }))

    return NextResponse.json(interviewsWithLowercaseEnums)
  } catch (error) {
    console.error('Error fetching interviews:', error)
    return NextResponse.json({ error: 'Failed to fetch interviews' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateInterviewData = await request.json()

    // Validate required fields
    if (!body.jobId || !body.type || !body.scheduledDate) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, type, scheduledDate' },
        { status: 400 }
      )
    }

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: body.jobId }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Create interview
    const interview = await prisma.interview.create({
      data: {
        jobId: body.jobId,
        type: body.type.toUpperCase() as any, // Convert to enum (phone_screen -> PHONE_SCREEN)
        scheduledDate: new Date(body.scheduledDate),
        duration: body.duration,
        location: body.location,
        interviewerName: body.interviewerName,
        interviewerEmail: body.interviewerEmail,
        interviewerPhone: body.interviewerPhone,
        notes: body.notes,
        status: 'SCHEDULED'
      }
    })

      // Update job status to INTERVIEW if not already
      if (job.status !== 'INTERVIEW') {
        await prisma.job.update({
          where: { id: body.jobId },
          data: { status: 'INTERVIEW' }
        })
      }

      // Convert enums to lowercase for frontend
      const interviewWithLowercaseEnums = {
        ...interview,
        type: interview.type.toLowerCase() as any,
        status: interview.status.toLowerCase() as any
      }

      return NextResponse.json(interviewWithLowercaseEnums, { status: 201 })
  } catch (error) {
    console.error('Error creating interview:', error)
    return NextResponse.json({ error: 'Failed to create interview' }, { status: 500 })
  }
}

