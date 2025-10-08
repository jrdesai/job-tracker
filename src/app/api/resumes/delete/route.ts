import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteResumeFile } from '@/lib/resume-utils'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const resumeId = searchParams.get('id')
    
    if (!resumeId) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 })
    }
    
    // Get resume from database
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId }
    })
    
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }
    
    // Delete the file from storage
    try {
      await deleteResumeFile(resume.path)
    } catch (error) {
      console.error('Error deleting file from storage:', error)
      // Continue with database deletion even if file deletion fails
    }
    
    // Delete resume record from database
    await prisma.resume.delete({
      where: { id: resumeId }
    })
    
    return NextResponse.json({ message: 'Resume deleted successfully' })
  } catch (error) {
    console.error('Error deleting resume:', error)
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 })
  }
}
