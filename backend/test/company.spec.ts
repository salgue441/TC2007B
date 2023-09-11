import chai from 'chai'
import chaiExclude from 'chai-exclude'
import { db, initDB } from '../src/configs/database.config'
import { getAllCompanies } from '../src/services/company.service'
import { unwrap } from './utils'

chai.use(chaiExclude)

const { expect } = chai
const testData = [
  {
    companyId: 'comp-1234-efgh-0000',
    name: 'Company 1',
    description: 'Company 1 description',
    email: 'example1@mail.com',
    phoneNumber: '123456789',
    webPage: 'www.company1.com',
    street: 'Company 1 street',
    streetNumber: 1,
    city: 'Company 1 city',
    state: 'Company 1 state',
    zipCode: 12345,
    latitude: 1.111111,
    longitude: 1.111111,
    profilePicture: 'https://picsum.photos/200',
    pdfCurriculumUrl: 'https://picsum.photos/200',
    pdfDicCdmxUrl: 'https://picsum.photos/200',
    pdfPeeFideUrl: 'https://picsum.photos/200',
    pdfGuaranteeSecurityUrl: 'https://picsum.photos/200',
    status: 'approved',
  },
  {
    companyId: 'comp-5678-efgh-0000',
    name: 'Company 2',
    description: 'Company 2 description',
    email: 'example2@mail.com',
    phoneNumber: '123456780',
    webPage: null,
    street: 'Company 2 street',
    streetNumber: 2,
    city: 'Company 2 city',
    state: 'Company 2 state',
    zipCode: 12346,
    latitude: 0.111111,
    longitude: 1.111111,
    profilePicture: null,
    pdfCurriculumUrl: 'https://picsum.photos/100',
    pdfDicCdmxUrl: null,
    pdfPeeFideUrl: null,
    pdfGuaranteeSecurityUrl: 'https://picsum.photos/100',
    status: 'pending_approval',
  },
]
const attributesToExclude = [
  'createdAt',
  'updatedAt',
]

beforeEach(async () => {
  await initDB()
})

afterEach(async () => {
  await db.drop()
})

describe('Company Service', () => {
  it('should return a list of all companies', async () => {
    const response = await getAllCompanies({ start: 0, pageSize: 10 })
    expect(unwrap(response).rows)
      .excluding(attributesToExclude)
      .to.deep.equal(testData)
  })
})
