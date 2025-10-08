import { getStorageManager, resetStorageManager } from './storage-strategy'

/**
 * Switch storage strategy based on environment or runtime conditions
 */
export class StorageStrategySwitcher {
  private manager = getStorageManager()

  /**
   * Switch strategy based on environment variable
   */
  public switchByEnvironment(): void {
    const envStrategy = process.env.STORAGE_TYPE as 'local' | 's3'
    
    if (envStrategy && envStrategy !== this.getCurrentStrategyType()) {
      this.manager.switchStrategy(envStrategy)
      console.log(`Switched to ${envStrategy} strategy based on environment`)
    }
  }

  /**
   * Switch strategy based on file size (small files to local, large to S3)
   */
  public switchByFileSize(fileSize: number): void {
    const threshold = 10 * 1024 * 1024 // 10MB threshold
    
    if (fileSize > threshold) {
      if (this.manager.getAvailableStrategies().includes('s3')) {
        this.manager.switchStrategy('s3')
        console.log('Switched to S3 for large file')
      }
    } else {
      this.manager.switchStrategy('local')
      console.log('Switched to local for small file')
    }
  }

  /**
   * Switch strategy based on file type
   */
  public switchByFileType(mimeType: string): void {
    const sensitiveTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (sensitiveTypes.includes(mimeType)) {
      // Use S3 for sensitive documents
      if (this.manager.getAvailableStrategies().includes('s3')) {
        this.manager.switchStrategy('s3')
        console.log('Switched to S3 for sensitive document')
      }
    } else {
      this.manager.switchStrategy('local')
      console.log('Switched to local for regular file')
    }
  }

  /**
   * Switch strategy based on time of day (business hours vs off-hours)
   */
  public switchByTime(): void {
    const hour = new Date().getHours()
    const isBusinessHours = hour >= 9 && hour <= 17
    
    if (isBusinessHours) {
      // Use S3 during business hours for better performance
      if (this.manager.getAvailableStrategies().includes('s3')) {
        this.manager.switchStrategy('s3')
        console.log('Switched to S3 for business hours')
      }
    } else {
      this.manager.switchStrategy('local')
      console.log('Switched to local for off-hours')
    }
  }

  /**
   * Get current strategy type
   */
  public getCurrentStrategyType(): string {
    return this.manager.getCurrentStrategy().constructor.name
  }

  /**
   * Reset storage manager (useful for testing)
   */
  public reset(): void {
    resetStorageManager()
    this.manager = getStorageManager()
  }

  /**
   * Get strategy manager instance
   */
  public getManager() {
    return this.manager
  }
}

// Export singleton instance
export const strategySwitcher = new StorageStrategySwitcher()
