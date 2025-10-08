import { getStorageManager, strategySwitcher } from './storage'

// Get storage manager with strategy pattern
const storageManager = getStorageManager()

export async function saveResumeFile(file: File): Promise<{ path: string; name: string; size: number; mimeType: string }> {
  // Auto-switch strategy based on file characteristics
  strategySwitcher.switchByFileSize(file.size)
  strategySwitcher.switchByFileType(file.type)
  
  const result = await storageManager.save(file)
  
  return {
    path: result.path,
    name: result.name,
    size: result.size,
    mimeType: result.mimeType
  }
}

export async function deleteResumeFile(path: string): Promise<void> {
  await storageManager.delete(path)
}

export async function getResumeUrl(path: string): Promise<string> {
  return await storageManager.getUrl(path)
}

export function validateResumeFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a PDF, DOC, DOCX, or TXT file'
    }
  }
  
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 5MB'
    }
  }
  
  return { valid: true }
}
