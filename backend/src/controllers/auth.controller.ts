import * as AuthService from '../services/auth.service'
import { NoRecord } from '../utils/RequestResponse'
import { RequestHandler } from 'express'

/**
 * @brief
 * Función del controlador que genera un token de autenticación y un token de refresco
 * @param req La request HTTP al servidor
 * @param res Un objeto paginador con los proveedores y la información de paginación
 */
export const googleLogin: RequestHandler<
  NoRecord,
  AuthService.AuthResponse,
  { googleToken: string },
  NoRecord> = async (req, res) => {
    let authResponse: AuthService.AuthResponse = {tokens: null, user: null, error: null}
    // Verificar que el token se haya mandado
    if(!req.body.googleToken) {
      authResponse.error = 'No google token provided'
      return res.json(authResponse)
    }
    const { googleToken } = req.body

    const data = await AuthService.googleLogin(googleToken)

    if(!data?.user || !data.tokens) {
      authResponse.error = 'Invalid user'
      return res.json(authResponse)
    }

    authResponse = data
    // Devolver los tokens
    res.status(200).json(authResponse)
  }

/**
 * @brief
 * Función para generar un nuevo par de tokens a partir de nueva información de usuario
 * @param authToken token de autenticación
 * @param userData información del usuario
 * @returns {AuthResponse} objeto con los tokens generados y los datos del usuario
 */
export const updateUserTokensData: RequestHandler<
  NoRecord,
  AuthService.AuthResponse,
  { authToken: string },
  NoRecord> = async (req, res) => {
    let authResponse: AuthService.AuthResponse = {tokens: null, user: null, error: null}
    // Verificar el token
    if(!req.body.authToken) {
      authResponse.error = 'No auth token provided'
      return res.json(authResponse)
    }
    const { authToken } = req.body

    const data = await AuthService.updateUserTokensData(authToken)

    if(!data?.user || !data.tokens) {
      authResponse.error = 'Invalid user'
      return res.json(authResponse)
    }

    authResponse = data
    // Devolver los tokens
    res.status(200).json(authResponse)
  }

/**
 * @brief
 * Función del controlador que genera un token de autenticación y un token de refresco
 * @param req La request HTTP al servidor
 * @param res Un objeto paginador con los proveedores y la información de paginación
 */
export const updateTokens: RequestHandler<
  NoRecord,
  AuthService.AuthResponse,
  { refreshToken?: string },
  NoRecord> = async (req, res) => {
    // Verificar que el refreshToken se haya mandado
    if(!req.body.refreshToken) return res.json({ error: 'No refresh token provided' })    
    const token: string = req.body.refreshToken
   
    try {
      // Actualizar tokens
      const tokens = await AuthService.updateTokens(token)
      if(!tokens) return res.json({ error: 'Invalid token' })
      
      // Devolver los tokens
      res.status(200).json(tokens) 
    } catch(error) {
      res.json({ error: 'Invalid token' })
    }
  }
