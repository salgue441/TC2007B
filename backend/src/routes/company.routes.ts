import express from 'express'
import * as CompanyController from '../controllers/company.controller'
import * as CompanyFilesController from '../controllers/companyFiles.controller'
import upload from '../middlewares/multer.middleware'

const router = express.Router()

router.get('/', CompanyController.getAllCompanies)
router.post('/create', CompanyController.createCompany)

router.get('/files', CompanyFilesController.getCompanyFiles)
router.post('/add/product', CompanyController.addProduct)
router.post('/upload/image', CompanyFilesController.uploadCompanyImage)

router.post('/upload/file', upload, CompanyFilesController.uploadCompanyFile)

router.get('/approved', CompanyController.getApprovedCompanies)

router.get('/pending', CompanyController.getPendingCompanies)
router.get('/geocoding/android', CompanyController.getCoordinates)

router.post('/pending/:companyId', CompanyController.updateCompanyInfo)

router.get('/:id', CompanyController.getCompanyById)
router.put('/:id/assign', CompanyController.assignCompanyUser)

export default router
