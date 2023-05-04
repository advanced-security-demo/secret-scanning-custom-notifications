import fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config()

export function getRequiredEnvParam(paramName: string): string {
  const value = process.env[paramName]
  if (value === undefined || value.length === 0) {
    throw new Error(`${paramName} environment variable must be set`)
  }
  return value
}

export async function calculateDateRange(frequency: number): Promise<Date> {
  const now = new Date()
  const nowMinusFrequency = new Date(now.getTime() - frequency * 60 * 60 * 1000)
  return nowMinusFrequency
}

export function writeToFile(fileName: string, data: string): void {
  //make temp directory
  var dir = './tmp'

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  fs.writeFile(fileName, data, err => {
    if (err) {
      throw err
    }
  })
}
