/** Password hashing and JWT authentication middleware. */

import bcrypt from 'bcryptjs'
import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { config } from './config.js'
import { findUserByEmail } from './db.js'
import type { UserRow } from './types.js'

export interface AuthRequest extends Request {
  user?: UserRow
}

/** Hash a plain-text password with bcrypt. */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

/** Compare plain password with stored bcrypt hash. */
export function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(plainPassword, hashedPassword)
}

/** Create a signed JWT for the given user email. */
export function createAccessToken(email: string): string {
  return jwt.sign({ sub: email }, config.secretKey, {
    expiresIn: `${config.jwtExpiresMinutes}m`,
  })
}

/** Authenticate user credentials and return the user row. */
export function authenticateUser(email: string, password: string): UserRow | null {
  const user = findUserByEmail(email.trim().toLowerCase())
  if (!user || !verifyPassword(password, user.hashed_password)) return null
  return user
}

/** Express middleware that validates Bearer JWT and attaches user. */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ detail: 'Could not validate credentials' })
    return
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, config.secretKey) as { sub?: string }
    if (!payload.sub) {
      res.status(401).json({ detail: 'Could not validate credentials' })
      return
    }
    const user = findUserByEmail(payload.sub)
    if (!user) {
      res.status(401).json({ detail: 'Could not validate credentials' })
      return
    }
    req.user = user
    next()
  } catch {
    res.status(401).json({ detail: 'Could not validate credentials' })
  }
}

/** Express middleware that requires an authenticated admin user. */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ detail: 'Admin access required' })
      return
    }
    next()
  })
}
