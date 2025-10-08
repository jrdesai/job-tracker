export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export function getFileIcon(filename: string): string {
  const extension = getFileExtension(filename)
  
  switch (extension) {
    case 'pdf':
      return '📄'
    case 'doc':
    case 'docx':
      return '📝'
    case 'txt':
      return '📃'
    default:
      return '📎'
  }
}

