import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRoutes from './routes/user'

dotenv.config()

const app = express()
const port = process.env.PORT || 5003

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : '*',
  })
)
app.use(express.json())

// Routes
app.use('/api/users', userRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(port, () => {
  console.log(`Wallet server is running on port ${port}`)
})
