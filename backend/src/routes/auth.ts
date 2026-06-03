/** Authentication routes. */

import { Router } from 'express'
import {
  authenticateUser,
  createAccessToken,
  hashPassword,
  requireAuth,
  type AuthRequest,
} from '../auth.js'
import { createUser, findUserByEmail, toPublicUser } from '../db.js'

export const authRouter = Router()

/** Validate email format for registration and login. */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/** Build auth response with JWT and public user profile. */
function authResponse(user: NonNullable<ReturnType<typeof authenticateUser>>) {
  return {
    access_token: createAccessToken(user.email),
    token_type: 'bearer',
    user: toPublicUser(user),
  }
}

/** Register a new user account. */
authRouter.post('/register', (req, res) => {
  const { email, password, full_name } = req.body as {
    email?: string
    password?: string
    full_name?: string
  }

  const normalizedEmail = email?.trim().toLowerCase()
  const fullName = full_name?.trim()

  if (!normalizedEmail || !password || !fullName) {
    res.status(400).json({ detail: 'Email, password and full name are required' })
    return
  }

  if (!isValidEmail(normalizedEmail)) {
    res.status(400).json({ detail: 'Invalid email format' })
    return
  }

  if (password.length < 6) {
    res.status(400).json({ detail: 'Password must be at least 6 characters' })
    return
  }

  if (findUserByEmail(normalizedEmail)) {
    res.status(409).json({ detail: 'User with this email already exists' })
    return
  }

  const user = createUser(normalizedEmail, hashPassword(password), fullName)
  res.status(201).json(authResponse(user))
})

/** Issue JWT for valid credentials (JSON body). */
authRouter.post('/login/json', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }
  const normalizedEmail = email?.trim().toLowerCase()

  if (!normalizedEmail || !password) {
    res.status(400).json({ detail: 'Email and password are required' })
    return
  }

  const user = authenticateUser(normalizedEmail, password)
  if (!user) {
    res.status(401).json({ detail: 'Incorrect email or password' })
    return
  }

  res.json(authResponse(user))
})

/** Return profile of the currently authenticated user. */
authRouter.get('/me', requireAuth, (req: AuthRequest, res) => {
  res.json(toPublicUser(req.user!))
})
