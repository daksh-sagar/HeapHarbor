import mongoose from 'mongoose'

let isConnected = false // to cache the connection

export async function connectToDb() {
  mongoose.set('strictQuery', true)

  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not defined')

  if (isConnected) return

  try {
    console.log('------------connecting--------------')
    await mongoose.connect(process.env.MONGO_URI)
    console.log('------------connected--------------')

    isConnected = true
  } catch (error) {
    console.log('MongoDB connection failed', error)
    process.exit(1)
  }
}
