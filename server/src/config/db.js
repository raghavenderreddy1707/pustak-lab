import mongoose from 'mongoose'

let isConnected = false

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return mongoose.connection
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('❌ MONGODB_URI is missing from environment variables!')
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority',
    })
    isConnected = true
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`)
    isConnected = false
    if (process.env.VERCEL !== '1') {
      throw error
    }
  }
}

connectDB.isConnected = () => isConnected || mongoose.connection.readyState >= 1

export default connectDB
