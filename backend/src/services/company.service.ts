import CompanyProducts from '../models/companyProducts.model'
import CompanyFiles from '../models/companyFiles.model'
import Product from '../models/products.model'
import Review from '../models/review.model'
import { col, fn } from 'sequelize'
import Company from '../models/company.model'
import CompanyProduct from '../models/companyProducts.model'
import { PaginationParams, PaginatedQuery } from '../utils/RequestResponse'
import { sendNotification } from './notification.service'
import User from '../models/users.model'

// TYPES
/**
 * @brief
 * Tipo de dato para el proveedor
 */
export type CompanyType = {
  companyId?: string
  name: string
  description: string
  email: string
  phone: string
  webPage?: string | null
  street: string
  streetNumber: string
  city: string
  state: string
  zipCode: string
  userId: string | null
  profilePicture?: string | null
  status?: string
}

/**
 * @brief
 * Tipo de dato para el proveedor
 */
export type CompanyProductType = {
  companyId: string
  productId: string
  pdfProductCertificationUrl: string
}

/**
 * @brief
 * Tipo de dato para el estatus de la compañia
 */
export type StatusEnum = 'approved' | 'pending_approval' | 'rejected'

/**
 * @brief
 * Función del servicio que devuelve todos los proveedores de la base de datos
 * @param params Los parametros de paginación
 * @returns Una promesa con los proveedores y la información de paginación
 */
export const getAllCompanies = async <T>(
  params: PaginationParams<T>
): Promise<PaginatedQuery<Company>> => {
  return Company.findAndCountAll({
    limit: params.pageSize,
    offset: params.start,
    include: [
      {
        model: CompanyFiles,
        as: 'companyFiles',
      },
    ],
  })
}

/**
 * @brief
 * Función del servicio que devuelve todos los proveedores con el status especificado
 * @params Los parametros de paginación
 * @returns Una promesa con los proveedores y la información de paginación
 */

export const getCompaniesByStatus = async <T>(
  status: 'approved' | 'rejected' | 'pending_approval',
  params: PaginationParams<T>
): Promise<PaginatedQuery<Company>> => {
  return await Company.findAndCountAll({
    limit: params.pageSize,
    offset: params.start,
    where: {
      status,
    },
  })
}

export type UpdateCompanyInfoBody = {
  name: string
  description: string
  street: string
  streetNumber: string
  city: string
  state: string
  zipCode: string
  profilePicture: string
  status: 'approved' | 'pending_approval' | 'rejected'
  phone: string
  webPage: string
}

/**
 * @brief
 * Actualiza en la base de datos el proveedor con los datos pasados en los parametros
 * @param companyId
 * @param newCompanyInfo
 * @returns Una promesa de la actualización del proveedor en la base de datos.
 */
export const updateCompanyInfo = async (
  companyId: string,
  newCompanyInfo: UpdateCompanyInfoBody
): Promise<Company | null> => {
  const companyInfo = await Company.findByPk(companyId)
  if (companyInfo) {
    await companyInfo.update(newCompanyInfo)
    if (newCompanyInfo.status === 'approved') {
      await sendNotification(
        'Aprobado',
        'Tu compañia ha sido aprobada',
        `${process.env.AWS_ARN}`,
        companyId
      )
    } else if (newCompanyInfo.status === 'rejected') {
      await sendNotification(
        'Rechazado',
        'Tu compañia ha sido rechazada',
        `${process.env.AWS_ARN}`,
        companyId
      )
    }
    return companyInfo
  } else {
    return null
  }
}

/**
 * @brief
 * Función del servicio para crear una nueva compañia
 * @param company La compañia a crear
 * @returns Una promesa con los proveedores y la información de paginación
 */
export const createCompany = async (
  company: CompanyType
): Promise<Company | null> => {
  return await Company.create(company)
}

/**
 * @brief
 * Función del servicio para crear asociar un producto a una compañia
 * @param CompanyProduct La información de la asociación (companyId, productId, pdfProductCertificationUrl)
 * @returns Una promesa con los proveedores y la información de paginación
 */
export const addProduct = async (
  companyProduct: CompanyProductType
): Promise<CompanyProduct | null> => {
  return await CompanyProduct.create(companyProduct)
}

/**
 * @brief
 * Obtiene un proveedor por su id y lo devuelve en la respuesta. Si no
 * existe el proveedor, devuelve null. Añade la puntuación media del proveedor
 * y los productos que vende
 * @param id Id del proveedor a buscar
 * @returns Promise<Company | Null> Proveedor con el id especificado
 */
export const getCompanyById = async (id: string): Promise<Company | null> => {
  const company = await Company.findByPk(id)
  const companyScore = await getCompanyScore(id)
  const companyProducts = await getCompanyProducts(id)
  const companyFiles = await getCompanyFiles(id)
  const rating = Math.round(companyScore?.[0].getDataValue('score') * 10) / 10
  const comment = companyScore?.[0].getDataValue('review')
  const products: Product[] = []
  const files: CompanyFiles[] = []

  companyProducts?.forEach(function (product) {
    products.push(product.getDataValue('product').dataValues)
  })

  companyFiles?.forEach(function (file) {
    files.push(file.dataValues)
  })

  company?.setDataValue('products', products)
  company?.setDataValue('score', rating)
  company?.setDataValue('oneComment', comment)
  company?.setDataValue('file', files)

  return company
}

/**
 * @brief
 * Valida si el usuario tiene una compañia asignada
 * @param uuid Id del usuario
 * @returns Promise<Company | Null> Proveedor con el id especificado
 */
export const getCompanyByUserId = async (uuid: string): Promise<Company | null> => {
  const company = await Company.findOne({
    where: {
      userId: uuid,
    },
  })

  return company
}

/**
 * @brief
 * Desasigna un usuario de una compañia
 * @param uuid Id del usuario
 * @returns Promise<Company | Null> Proveedor con el id especificado
 */
export const unbindUserFromCompany = async (uuid: string): Promise<Company | null> => {
  const company = await Company.findOne({
    where: {
      userId: uuid,
    },
  })

  if (company) {
    company.userId = null
    await company.save()
  }

  return company
}

const getCompanyFiles = async (id: string): Promise<CompanyFiles[] | null> => {
  return await CompanyFiles.findAll({
    where: {
      companyId: id,
    },
    attributes: {
      include: ['companyFileId', 'fileUrl'],
      exclude: ['createdAt', 'updatedAt'],
    },
  })
}

const getCompanyProducts = async (
  id: string
): Promise<CompanyProducts[] | null> => {
  return await CompanyProducts.findAll({
    where: {
      companyId: id,
    },
    include: [
      {
        model: Product,
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
    ],
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
  })
}

const getCompanyScore = async (id: string): Promise<Review[] | null> => {
  return await Review.findAll({
    where: {
      companyId: id,
    },
    attributes: {
      include: [[fn('AVG', col('score')), 'score'], 'review'],
      exclude: ['reviewId', 'userId', 'createdAt', 'updatedAt'],
    },
  })
}



type assignCompanyUserResponse =
  | 'success'
  | 'El usuario ya tiene una compañía asignada'
  | 'La compañía ya tiene un usuario asignado'
  | 'La companía no existe'
  | 'El usuario no existe'
  | 'Error no esperado'
  
/**
 * @brief
 * Función del servicio para asignarle un usuario a una compañia
 * @param req La request HTTP al servidor
 * @param res Un resultado de la operación
 */
export const assignCompanyUser = async (
  companyId: string,
  userId: string
): Promise<assignCompanyUserResponse> => {
  try {
    console.log('assignCompanyUser')
    const user = await User.findByPk(userId)
    if (!user) return 'El usuario no existe'
    if (user.companyId !== null)
      return 'El usuario ya tiene una compañía asignada'

    const company = await Company.findByPk(companyId)
    if (!company) return 'La companía no existe'
    if (company.userId !== null)
      return 'La compañía ya tiene un usuario asignado'

    company.userId = userId
    user.companyId = companyId
    await company.save()
    try {
      await user.save()
    } catch (error) {
      console.log(error)
    }
    return 'success'
  } catch (error) {
    console.log(error)
    return 'Error no esperado'
  }
}
