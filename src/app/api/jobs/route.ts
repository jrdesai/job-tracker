import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateJobData } from '@/lib/types'

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        resume: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Convert status to lowercase for frontend consistency
    const jobsWithLowercaseStatus = jobs.map(job => ({
      ...job,
      status: job.status.toLowerCase()
    }))
    
    return NextResponse.json(jobsWithLowercaseStatus)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
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
        interviewDate: body.interviewDate,
        interviewNotes: body.interviewNotes,
      },
      include: {
        resume: true
      }
    })
    
    // Convert status to lowercase for frontend consistency
    const jobWithLowercaseStatus = {
      ...job,
      status: job.status.toLowerCase()
    }
    
    return NextResponse.json(jobWithLowercaseStatus, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
