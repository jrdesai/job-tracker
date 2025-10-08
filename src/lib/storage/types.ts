export interface StorageResult {
  path: string
  url?: string
  name: string
  size: number
  mimeType: string
}

export interface StorageProvider {
  save(file: File): Promise<StorageResult>
  delete(path: string): Promise<void>
  getUrl(path: string): Promise<string>
}

export type StorageType = 'local' | 's3'

export interface StorageConfig {
  type: StorageType
  local?: {
    uploadDir: string
  }
  s3?: {
    bucket: string
    region: string
    accessKeyId: string
    secretAccessKey: string
    endpoint?: string // For custom S3-compatible services
  }
}
