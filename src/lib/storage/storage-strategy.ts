import { join } from 'path'
import { StorageProvider, StorageConfig, StorageType } from './types'
import { LocalStorageProvider } from './local-storage'
import { S3StorageProvider } from './s3-storage'

export class StorageStrategyManager {
  private strategies: Map<StorageType, StorageProvider>
  private currentStrategy: StorageProvider

  constructor(config: StorageConfig) {
    this.strategies = new Map()
    this.initializeStrategies(config)
    this.currentStrategy = this.strategies.get(config.type)!
  }

  private initializeStrategies(config: StorageConfig): void {
    // Initialize local strategy
    if (config.local) {
      this.strategies.set('local', new LocalStorageProvider(config.local.uploadDir))
    }

    // Initialize S3 strategy
    if (config.s3) {
      this.strategies.set('s3', new S3StorageProvider(config.s3))
    }
  }

  public getCurrentStrategy(): StorageProvider {
    return this.currentStrategy
  }

  public switchStrategy(type: StorageType): void {
    const strategy = this.strategies.get(type)
    if (!strategy) {
      throw new Error(`Storage strategy '${type}' not available`)
    }
    this.currentStrategy = strategy
  }

  public getAvailableStrategies(): StorageType[] {
    return Array.from(this.strategies.keys())
  }

  // Convenience methods that delegate to current strategy
  public async save(file: File) {
    return this.currentStrategy.save(file)
  }

  public async delete(path: string) {
    return this.currentStrategy.delete(path)
  }

  public async getUrl(path: string) {
    return this.currentStrategy.getUrl(path)
  }
}

// Singleton instance for application-wide use
let storageManager: StorageStrategyManager | null = null

export function getStorageManager(config?: StorageConfig): StorageStrategyManager {
  if (!storageManager) {
    if (!config) {
      config = getDefaultConfig()
    }
    storageManager = new StorageStrategyManager(config)
  }
  return storageManager
}

export function resetStorageManager(): void {
  storageManager = null
}

function getDefaultConfig(): StorageConfig {
  const storageType = (process.env.STORAGE_TYPE as StorageType) || 'local'
  
  if (storageType === 's3') {
    const bucket = process.env.S3_BUCKET
    const region = process.env.S3_REGION
    const accessKeyId = process.env.S3_ACCESS_KEY_ID
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY
    const endpoint = process.env.S3_ENDPOINT

    if (!bucket || !region || !accessKeyId || !secretAccessKey) {
      throw new Error('S3 configuration is incomplete')
    }

    return {
      type: 's3',
      s3: { bucket, region, accessKeyId, secretAccessKey, endpoint }
    }
  }

  return {
    type: 'local',
    local: {
      uploadDir: join(process.cwd(), 'public', 'uploads', 'resumes')
    }
  }
}
