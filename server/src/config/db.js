import mongoose from 'mongoose'

let isConnected = false

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI is missing from environment variables!')
    return
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
    })
    isConnected = true
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`)
    if (process.env.VERCEL !== '1') {
      process.exit(1)
    }
  }
}

export default connectDB
