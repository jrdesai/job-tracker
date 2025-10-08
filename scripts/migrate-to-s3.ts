#!/usr/bin/env node

/**
 * Migration script to move resume files from local storage to S3
 * Run this script when you're ready to migrate to S3 storage
 * 
 * Usage: npm run migrate-to-s3
 */

import { StorageFactory } from './src/lib/storage'
import { prisma } from './src/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'

async function migrateToS3() {
  console.log('Starting migration from local storage to S3...')
  
  try {
    // Get all resumes from database
    const resumes = await prisma.resume.findMany({
      where: {
        path: {
          startsWith: '/uploads/resumes/'
        }
      }
    })
    
    console.log(`Found ${resumes.length} resumes to migrate`)
    
    // Initialize S3 storage provider
    const s3Config = {
      type: 's3' as const,
      s3: {
        bucket: process.env.S3_BUCKET!,
        region: process.env.S3_REGION!,
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        endpoint: process.env.S3_ENDPOINT
      }
    }
    
    const s3Factory = StorageFactory.getInstance(s3Config)
    const s3Provider = s3Factory.getProvider()
    
    // Migrate each resume
    for (const resume of resumes) {
      try {
        console.log(`Migrating: ${resume.name}`)
        
        // Read local file
        const fileName = resume.path.replace('/uploads/resumes/', '')
        const filePath = join(process.cwd(), 'public', 'uploads', 'resumes', fileName)
        const fileBuffer = await readFile(filePath)
        
        // Create File object for S3 upload
        const file = new File([fileBuffer], resume.name, { type: resume.mimeType })
        
        // Upload to S3
        const s3Result = await s3Provider.save(file)
        
        // Update database record
        await prisma.resume.update({
          where: { id: resume.id },
          data: {
            path: s3Result.path,
            url: s3Result.url
          }
        })
        
        console.log(`✅ Migrated: ${resume.name}`)
        
      } catch (error) {
        console.error(`❌ Failed to migrate ${resume.name}:`, error)
      }
    }
    
    console.log('Migration completed!')
    console.log('Don\'t forget to:')
    console.log('1. Set STORAGE_TYPE=s3 in your .env file')
    console.log('2. Restart your application')
    console.log('3. Verify all files are accessible')
    console.log('4. Remove local files after verification')
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateToS3()
}

export { migrateToS3 }
