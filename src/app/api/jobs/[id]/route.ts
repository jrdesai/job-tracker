import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdateJobData } from '@/lib/types'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const job = await prisma.job.findUnique({
      where: {
        id: id
      },
      include: {
        resume: true
      }
    })
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }
    
    // Convert status to lowercase for frontend consistency
    const jobWithLowercaseStatus = {
      ...job,
      status: job.status.toLowerCase()
    }
    
    return NextResponse.json(jobWithLowercaseStatus)
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body: UpdateJobData = await request.json()
    
    const job = await prisma.job.update({
      where: {
        id: id
      },
      data: {
        title: body.title,
        company: body.company,
        location: body.location,
        status: body.status?.toUpperCase() as any,
        appliedDate: body.appliedDate,
        notes: body.notes,
        salary: body.salary,
        currency: body.currency,
        jobUrl: body.jobUrl,
        resumeId: body.resumeId,
        interviewDate: body.interviewDate,
        interviewNotes: body.interviewNotes,
      } as any,
      include: {
        resume: true
      }
    })
    
    // Convert status to lowercase for frontend consistency
    const jobWithLowercaseStatus = {
      ...job,
      status: job.status.toLowerCase()
    }
    
    return NextResponse.json(jobWithLowercaseStatus)
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    await prisma.job.delete({
      where: {
        id: id
      }
    })
    
    return NextResponse.json({ message: 'Job deleted successfully' })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }
}
