import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

// Extend the global namespace to include prisma
declare global {
  var prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}

export function ensureDatabaseExists() {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
  if (!fs.existsSync(dbPath)) {
    console.log('Database does not exist. Creating and applying migrations...')
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    } catch (error) {
      console.error('Failed to apply migrations:', error)
      process.exit(1)
    }
  }
}

export default prisma
