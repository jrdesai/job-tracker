import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateResumeData } from '@/lib/types'

export async function GET() {
  try {
    const resumes = await prisma.resume.findMany({
      orderBy: {
        uploadedAt: 'desc'
      }
    })
    return NextResponse.json(resumes)
  } catch (error) {
    console.error('Error fetching resumes:', error)
    return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateResumeData = await request.json()
    
    const resume = await prisma.resume.create({
      data: {
        name: body.name,
        path: body.path,
        url: body.url,
        size: body.size,
        mimeType: body.mimeType,
      }
    })
    
    return NextResponse.json(resume, { status: 201 })
  } catch (error) {
    console.error('Error creating resume:', error)
    return NextResponse.json({ error: 'Failed to create resume' }, { status: 500 })
  }
}
