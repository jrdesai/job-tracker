import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateJobData } from '@/lib/types'

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        resume: true,
        interviews: {
          orderBy: {
            scheduledDate: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Convert status to lowercase for frontend consistency
    // Also convert interview enum values to lowercase
    const jobsWithLowercaseStatus = jobs.map(job => ({
      ...job,
      status: job.status.toLowerCase(),
      interviews: (job.interviews && Array.isArray(job.interviews)) ? job.interviews.map(interview => ({
        ...interview,
        type: interview.type.toLowerCase() as any,
        status: interview.status.toLowerCase() as any
      })) : []
    }))
    
    return NextResponse.json(jobsWithLowercaseStatus)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    // Return error details for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ 
      error: 'Failed to fetch jobs',
      details: errorMessage 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateJobData = await request.json()
    
    const job = await prisma.job.create({
      data: {
        title: body.title,
        company: body.company,
        location: body.location,
        status: body.status.toUpperCase() as any,
        appliedDate: body.appliedDate,
        notes: body.notes,
        salary: body.salary,
        currency: body.currency,
        jobUrl: body.jobUrl,
        resumeId: body.resumeId,
      },
      include: {
        resume: true,
        interviews: {
          orderBy: {
            scheduledDate: 'asc'
          }
        }
      }
    })
    
    // Convert status to lowercase for frontend consistency
    // Also convert interview enum values to lowercase
    const jobWithLowercaseStatus = {
      ...job,
      status: job.status.toLowerCase(),
      interviews: job.interviews?.map(interview => ({
        ...interview,
        type: interview.type.toLowerCase() as any,
        status: interview.status.toLowerCase() as any
      })) || []
    }
    
    return NextResponse.json(jobWithLowercaseStatus, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
