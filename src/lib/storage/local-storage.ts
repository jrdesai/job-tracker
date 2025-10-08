import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { StorageProvider, StorageResult } from './types'

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string

  constructor(uploadDir: string) {
    this.uploadDir = uploadDir
  }

  async ensureUploadDir(): Promise<void> {
    try {
      await mkdir(this.uploadDir, { recursive: true })
    } catch (error) {
      console.error('Error creating upload directory:', error)
      throw new Error('Failed to create upload directory')
    }
  }

  async save(file: File): Promise<StorageResult> {
    await this.ensureUploadDir()
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Generate unique filename to avoid conflicts
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${sanitizedName}`
    const filePath = join(this.uploadDir, fileName)
    
    await writeFile(filePath, buffer)
    
    return {
      path: `/uploads/resumes/${fileName}`,
      name: file.name,
      size: file.size,
      mimeType: file.type
    }
  }

  async delete(path: string): Promise<void> {
    try {
      // Convert URL path to file system path
      const fileName = path.replace('/uploads/resumes/', '')
      const filePath = join(this.uploadDir, fileName)
      await unlink(filePath)
    } catch (error) {
      console.error('Error deleting file:', error)
      throw new Error('Failed to delete file')
    }
  }

  async getUrl(path: string): Promise<string> {
    // For local storage, the path is already the URL
    return path
  }
}
