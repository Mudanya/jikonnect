import { AuthUser } from "@/types/auth"
import jwt from 'jsonwebtoken'
import logger from "./logger"
type Expiry = `${number}${'s' | 'm' | 'h' | 'd'}` | `${number} ${'seconds' | 'minutes' | 'hours' | 'days'}`

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET as string
const REFRESH_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || ""
const ACCESS_TOKEN_EXPIRY:Expiry = process.env.JWT_ACCESS_EXPIRY as Expiry
const REFRESH_TOKEN_EXPIRY:Expiry = process.env.JWT_ACCESS_EXPIRY as Expiry

export const generateTokens = (payload: AuthUser, rememberMe: boolean) => {
    logger.info('secret: ' + ACCESS_TOKEN_SECRET + " tokens" + ACCESS_TOKEN_SECRET + " remember me: " + rememberMe)
    const expiresIn = rememberMe ? '30d' : ACCESS_TOKEN_EXPIRY;
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn
    })
    const expiresInRefresh = rememberMe ? '30d' : REFRESH_TOKEN_EXPIRY;
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: expiresInRefresh })
    
    return { accessToken, refreshToken,rememberMe }
}

export const verifyAccessToken = (token: string):
    AuthUser | null => {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET) as AuthUser
    }
    catch (ex) {

        return null
    }

}
export const verifyRefreshToken = (token: string):
    AuthUser | null => {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET) as AuthUser
    }
    catch (ex) {
        logger.error((ex as Error).message)
        return null
    }

}