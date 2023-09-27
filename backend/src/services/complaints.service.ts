import Complaint from '../models/complaint.model'
import User from '../models/users.model'
import Company from '../models/company.model'
import { PaginationParams, PaginatedQuery } from '../utils/RequestResponse'

export type ComplaintType = {
  complaintId?: string
  userId: string
  companyId: string
  complaintStatus: string
  complaintSubject: 'Productos Defectuosos'|'Inconformidad con el producto / servicio'|'Comportamiento Inapropiado'| 
  'Mal Servicio'| 'Fraudes o estafas'|'Violación legal o ética'
  complaintDescription: string
}


/**
 * @brief
 * Función del servicio que devuelve todas las complaints existentes en la base de datos
 * @param params pageSize, start
 * @returns Una promesa con la(s) complaint(s) o null
 */

export const getAllComplaints = async <T>(
  params: PaginationParams<T>
): Promise<PaginatedQuery<Complaint>> => {
  try {
    const complaints = await Complaint.findAndCountAll({
      limit: params.pageSize,
      offset: params.start,
    })
    return complaints
  } catch (error) {
    console.error(error)
    throw error
  }
}



/**
 * @brief
 * Función del servicio que devuelve un complaint por id de la base de datos
 * @param params ComplaintId
 * @returns Una promesa con la(s) complaint(s) o null
 */

/** metodo para obtener una complaint por id */

export const getComplaintById = async (
  params: PaginationParams<{ complaintId: string }>
): Promise<PaginatedQuery<Complaint>> => {
  const { complaintId } = params
  return await Complaint.findAndCountAll({
    limit: params.pageSize,
    offset: params.start,
    where: {
      complaintId: complaintId,
    },

    include: [
      {
        model: User,
        attributes: ['firstName', 'lastName'],
      },
      {
        model: Company,
        attributes: ['companyId'],
      },	
    ],
  })
}


/**
 * @brief
 * Función del servicio que devuelve la(s) complaint(s) por id de la compañia de la base de datos
 * @param params companyId
 * @returns Una promesa con la(s) complaint(s) de una compañia o null
 */

export const getComplaintByCompany = async (
  params: PaginationParams<{ companyId: string }>
): Promise<PaginatedQuery<Complaint>> => {
  const { companyId } = params
  return await Complaint.findAndCountAll({
    limit: params.pageSize,
    offset: params.start,
    where: {
      companyId: companyId,
    },

    include: [
      {
        model: User,
        attributes: ['firstName', 'lastName'],
      },
    ],
  })
}


/**
 * @brief
 * Función del servicio que devuelve la(s) complaint(s) por id de usuario de la base de datos
 * @param params userId
 * @returns Una promesa con la(s) complaint(s) de un usuario o null
 */

export const getComplaintByUser = async <T>(
  userId: string, params: PaginationParams<T>
): Promise<PaginatedQuery<Complaint>> => {
  return await Complaint.findAndCountAll({
    limit: params.pageSize,
    
    offset: params.start,
    where: {
      userId: userId,
    },
  })
}


/**
 * @brief
 * Función del servicio que agrega una complaint a la base de datos
 * @param params userId, companyId, complaintDescription, complaintStatus
 * @returns Una promesa con la complaint creada
 */

export const createComplaint = async (
  complaint: ComplaintType
): Promise<Complaint | null> => {
  const res = await Complaint.create(complaint)
  return res
}


/**
 * @brief
 * Función del servicio que marca como inactiva una complaint
 * @param params complaintId, complaintStatus
 * @returns Una promesa con la complaintStatus actualizada
 */

export const flagComplaintAsInactive = async (
  complaintId: string,
): Promise<Complaint> => {
  const res = await Complaint.findOne({
    where: {
      complaintId: complaintId,
    },
  })

  const complaintStatus = 'inactive'

  if (res) {
    res.complaintStatus = complaintStatus
    await res.save()
    return res
  } else {
    throw new Error('Complaint not found.')
  }
}

/**
 * @brief
 * Función del servicio que marca como no válida una complaint
 * @param params complaintId, complaintStatus
 * @returns Una promesa con el status de la complaint actualizada
 */


export const flagComplaintAsInvalid = async (
  complaintId: string,
): Promise<Complaint> => {
  const res = await Complaint.findOne({
    where: {
      complaintId: complaintId,
    },
  })

  const complaintStatus = 'invalid'

  if (res) {
    res.complaintStatus = complaintStatus
    await res.save()
    return res
  } else {
    throw new Error('Complaint not found.')
  }
}