import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { authenticateToken, adminOnly } from '../middleware/auth'
import prisma from '../services/prisma'
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import { isoBase64URL } from '@simplewebauthn/server/helpers'
import { generateWallet } from '../services/random'

const router = Router()

// Start WebAuthn registration
router.post('/register/start', async (req, res) => {
  try {
    const { username } = req.body
    const existingUser = await prisma.user.findUnique({ where: { username } })
    if (existingUser && existingUser.hasCompletedRegistration) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Create a temporary user record for the registration process
    // This will be updated to completed status only after successful verification
    let user = existingUser
    if (!user) {
      user = await prisma.user.create({
        data: {
          username,
          hasCompletedRegistration: false, // Explicitly set to false
        },
      })
    }

    const options = await generateRegistrationOptions({
      rpName: 'Constella Wallet',
      rpID: process.env.RP_ID || 'localhost',
      userID: new TextEncoder().encode(user.id),
      userName: user.username,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
    })
    await prisma.user.update({
      where: { id: user.id },
      data: { currentChallenge: options.challenge },
    })
    res.json(options)
  } catch (error) {
    console.log('Error starting registration:', error)
    res.status(500).json({ message: 'Error starting registration' })
  }
})

// Complete WebAuthn registration
router.post('/register/finish', async (req, res) => {
  try {
    const { username, credential } = req.body
    const user = await prisma.user.findUnique({
      where: { username },
      include: { authenticators: true },
    })
    if (!user) {
      return res.status(400).json({ message: 'User not found' })
    }

    // Verify the WebAuthn registration first
    const verification = await verifyRegistrationResponse({
      response: {
        id: credential.id,
        rawId: credential.rawId,
        response: {
          clientDataJSON: credential.response.clientDataJSON,
          attestationObject: credential.response.attestationObject,
        },
        type: credential.type,
        clientExtensionResults: credential.clientExtensionResults || {},
      },
      expectedChallenge: user.currentChallenge!,
      expectedOrigin: process.env.FRONTEND_URL || 'http://localhost:5004', // Fixed port
      expectedRPID: process.env.RP_ID || 'localhost',
    })

    if (
      verification.verified &&
      verification.registrationInfo &&
      verification.registrationInfo.credential.id
    ) {
      // Only after successful verification, generate wallet and update user
      const { address, privateKey } = generateWallet()

      // Create the authenticator
      await prisma.authenticator.create({
        data: {
          credentialID: verification.registrationInfo.credential.id,
          publicKey: isoBase64URL.fromBuffer(
            verification.registrationInfo.credential.publicKey
          ),
          counter: verification.registrationInfo.credential.counter,
          userId: user.id,
        },
      })

      // Update user with wallet info and mark registration as complete
      await prisma.user.update({
        where: { id: user.id },
        data: {
          hasCompletedRegistration: true,
          walletAddress: address,
          walletPrivateKey: privateKey,
        },
      })

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET!,
        {
          expiresIn: '24h',
        }
      )
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          walletAddress: address,
          balance: user.balance,
        },
      })
    } else {
      // If verification fails, clean up the temporary user
      if (!user.hasCompletedRegistration) {
        await prisma.user.delete({ where: { id: user.id } })
      }
      res.status(400).json({ message: 'Registration verification failed' })
    }
  } catch (error) {
    console.log('Error completing registration:', error)
    // Clean up temporary user on error
    try {
      const user = await prisma.user.findUnique({
        where: { username: req.body.username },
      })
      if (user && !user.hasCompletedRegistration) {
        await prisma.user.delete({ where: { id: user.id } })
      }
    } catch (cleanupError) {
      console.log('Error cleaning up user:', cleanupError)
    }
    res.status(500).json({ message: 'Error completing registration' })
  }
})

// Start WebAuthn authentication
router.post('/login/start', async (req, res) => {
  try {
    const { username } = req.body
    const user = await prisma.user.findUnique({
      where: { username },
      include: { authenticators: true },
    })
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }
    const options = await generateAuthenticationOptions({
      rpID: process.env.RP_ID || 'localhost',
      allowCredentials: user.authenticators.map((authenticator) => ({
        id: isoBase64URL.fromBuffer(
          isoBase64URL.toBuffer(authenticator.credentialID)
        ),
        type: 'public-key',
      })),
      userVerification: 'preferred',
    })
    await prisma.user.update({
      where: { id: user.id },
      data: { currentChallenge: options.challenge },
    })
    res.json(options)
  } catch (error) {
    res.status(500).json({ message: 'Error starting authentication' })
  }
})

// Complete WebAuthn authentication
router.post('/login/finish', async (req, res) => {
  try {
    const { username, credential } = req.body
    const user = await prisma.user.findUnique({
      where: { username },
      include: { authenticators: true },
    })
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }
    const authenticator = user.authenticators.find(
      (auth) => credential.id === auth.credentialID
    )
    if (!authenticator) {
      return res.status(401).json({ message: 'Authenticator not found' })
    }
    const verification = await verifyAuthenticationResponse({
      credential: {
        id: authenticator.credentialID,
        publicKey: isoBase64URL.toBuffer(authenticator.publicKey),
        counter: authenticator.counter,
      },
      expectedChallenge: user.currentChallenge!,
      expectedOrigin: process.env.FRONTEND_URL || 'http://localhost:5004', // Fixed port
      expectedRPID: process.env.RP_ID || 'localhost',
      response: {
        id: credential.id,
        rawId: credential.rawId,
        response: {
          clientDataJSON: credential.response.clientDataJSON,
          authenticatorData: credential.response.authenticatorData,
          signature: credential.response.signature,
          userHandle: credential.response.userHandle,
        },
        clientExtensionResults: credential.clientExtensionResults,
        type: credential.type,
      },
    })
    if (verification.verified) {
      await prisma.authenticator.update({
        where: { id: authenticator.id },
        data: { counter: verification.authenticationInfo.newCounter },
      })
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET!,
        {
          expiresIn: '24h',
        }
      )
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          walletAddress: user.walletAddress,
          balance: user.balance,
        },
      })
    } else {
      res.status(401).json({ message: 'Authentication verification failed' })
    }
  } catch (error: any) {
    res.status(500).json({
      message: 'Error completing authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({
      id: user.id,
      username: user.username,
      walletAddress: user.walletAddress,
      balance: user.balance,
      lastRequestRefreshBalanceAt: user.lastRequestRefreshBalanceAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' })
  }
})

// Get user profile (alias for /)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({
      id: user.id,
      username: user.username,
      walletAddress: user.walletAddress,
      balance: user.balance,
      lastRequestRefreshBalanceAt: user.lastRequestRefreshBalanceAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' })
  }
})

// Make a transfer
router.post('/transfer', authenticateToken, async (req, res) => {
  try {
    const { amount, toAddress, username } = req.body
    if (!username || req.user!.userId === username) {
      return res.status(400).json({ message: 'Invalid username' })
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    })
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    // todo: Check balance
    // todo: Make txn
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log(
      `Making transfer from ${amount} ${user.walletAddress} to ${toAddress}`
    )
    const txn = '0x123'
    res.json({ txn, isSuccess: true })
  } catch (error) {
    res.status(500).json({ message: 'Error making transfer' })
  }
})

// Admin: Delete user by username
router.delete('/:username', adminOnly, async (req, res) => {
  try {
    const { username } = req.params
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    await prisma.user.delete({ where: { username } })
    res.json({ message: 'User deleted successfully' })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

// Check username availability
router.get('/check-username/:username', async (req, res) => {
  try {
    let { username: _username } = req.params
    const username = _username.trim().toLowerCase()

    if (!username || username.trim().length < 3) {
      return res.status(400).json({
        available: false,
        message: 'Username must be at least 3 characters long',
      })
    }

    const existingUser = await prisma.user.findUnique({
      where: { username: username.trim(), hasCompletedRegistration: true },
    })

    res.json({
      available: !existingUser,
      message: existingUser
        ? 'Username is already taken'
        : 'Username is available',
    })
  } catch (error) {
    res.status(500).json({
      available: false,
      message: 'Error checking username availability',
    })
  }
})

export default router
