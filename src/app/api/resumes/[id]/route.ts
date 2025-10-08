import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const resume = await prisma.resume.findUnique({
      where: {
        id: id
      },
      include: {
        jobs: {
          select: {
            id: true,
            title: true,
            company: true,
            status: true,
            appliedDate: true
          }
        }
      }
    })
    
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }
    
    return NextResponse.json(resume)
  } catch (error) {
    console.error('Error fetching resume:', error)
    return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    // Check if resume is being used by any jobs
    const jobsUsingResume = await prisma.job.count({
      where: {
        resumeId: id
      }
    })
    
    if (jobsUsingResume > 0) {
      return NextResponse.json({ 
        error: `Cannot delete resume. It is being used by ${jobsUsingResume} job application(s).` 
      }, { status: 400 })
    }
    
    await prisma.resume.delete({
      where: {
        id: id
      }
    })
    
    return NextResponse.json({ message: 'Resume deleted successfully' })
  } catch (error) {
    console.error('Error deleting resume:', error)
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 })
  }
}
