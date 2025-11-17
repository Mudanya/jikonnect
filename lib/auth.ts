import { AuthUser } from "@/types/auth";
import { NextRequest } from "next/server";
import { verifyAccessToken } from "./jwt";
import bcrypt from 'bcrypt'

export const getAuthUser = (req: NextRequest): AuthUser | null => {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('bearer')) return null;
    return verifyAccessToken(authHeader.substring(7))
}

export const requireAuth = (req: NextRequest): AuthUser => {
    const user = getAuthUser(req)
    if (!user) throw new Error('Unauthorized')
    return user;
}

export const requireRole = (req: NextRequest, ...roles: string[]): AuthUser => {
    const user = requireAuth(req)
    if (!roles.includes(user.role)) throw new Error('Forbidden')
    return user;
}

export const hashPassword = async (password: string) => await bcrypt.hash(password, 12)

export const verifyPassword = async (password: string, hashedPassword: string) =>
    await bcrypt.compare(password, hashedPassword)
export const generateRandomToken = () => crypto.getRandomValues(new Uint8Array(32)).toHex();