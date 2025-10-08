import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { saveResumeFile, validateResumeFile } from '@/lib/resume-utils'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('resume') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    
    // Validate the file
    const validation = validateResumeFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    
    // Save the file
    const result = await saveResumeFile(file)
    
    // Create resume record in database
    const resume = await prisma.resume.create({
      data: {
        name: result.name,
        path: result.path,
        size: result.size,
        mimeType: result.mimeType,
      }
    })
    
    return NextResponse.json({
      success: true,
      resume: resume
    })
  } catch (error) {
    console.error('Error uploading resume:', error)
    return NextResponse.json({ error: 'Failed to upload resume' }, { status: 500 })
  }
}

