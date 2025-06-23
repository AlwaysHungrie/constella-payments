import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  userId: string
  isAdmin: boolean
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' })
  }
}

export const adminOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['admin-token']
    const token = authHeader as string

    if (!token) {
      return res.status(401).json({ message: 'No admin token provided' })
    }

    if (token !== process.env.ADMIN_KEY) {
      return res.status(401).json({ message: 'Invalid admin token' })
    }

    next()
  } catch (error) {
    return res.status(403).json({ message: 'Invalid admin token' })
  }
}
