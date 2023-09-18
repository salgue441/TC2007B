import { createTheme, ThemeProvider } from '@mui/material/styles'

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CancelIcon from '@mui/icons-material/Cancel'

import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { updateCompany, UpdateCompanyInfoBody } from '@/api/v1/company'

interface Company {
  companyId: string
  name: string
  profilePicture: string
  state: string,
  city: string,
  street: string,
  zipCode: string,
  status: 'approved' | 'pending_approval' | 'rejected'
  email: string,
  phoneNumber: string
  webPage: string
  description: string
}


const theme = createTheme({
  palette: {
    primary: {
      main: '#589A74',
    },
    secondary: {
      main: '#589A74',
      light: '#F5EBFF',
      contrastText: '#47008F',
    },
  },
})

interface cellActionProps {
  setIsModalOpen: (value: boolean) => void;
  companyId: string
  fetchPending: () => void
  company: Company
}

export const CellAction = ({setIsModalOpen, companyId, fetchPending, company}:cellActionProps) => {

  /**
     * @brief Function that allows admin to accept a specific company
     * @param company
     * @param companyId
   */
  const handleAccept = async (company: Company, companyId: string) => {
    try {
      // Create an object with the updated status
      const updatedCompanyInfo: UpdateCompanyInfoBody = {
        name: company.name,
        description: company.description,
        profilePicture: company.profilePicture,
        status: 'approved',
        phoneNumber: company.phoneNumber,
        webPage: company.webPage,
      }

      await updateCompany(companyId, updatedCompanyInfo)

    } catch (error) {
      console.error('Error accepting company:', error)
    } finally {
      fetchPending()
    }
  }

  /**
     * @brief Function that allows admin to reject a specific company
     * @param company
     * @param companyId
   */
  const handleReject = async (company: Company, companyId: string) => {
    try {
      // Create an object with the updated status
      const updatedCompanyInfo: UpdateCompanyInfoBody = {
        name: company.name,
        description: company.description,
        profilePicture: company.profilePicture,
        status: 'rejected',
        phoneNumber: company.phoneNumber,
        webPage: company.webPage,
      }

      // Call the updateCompany function with the updated information
      await updateCompany(companyId, updatedCompanyInfo)
    } catch (error) {
      console.error('Error rejecting company:', error)
    } finally {
      setIsModalOpen(false)
      fetchPending()
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <MoreHorizIcon
            onClick={() => {
            }}
            className='cursor-pointer'
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Acciones rápidas</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleAccept(company, companyId)}>
            <CheckCircleOutlineIcon className='mr-1.5' />
            Aceptar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleReject(company, companyId)}>
            <CancelIcon className='mr-1.5' />
            Rechazar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ThemeProvider>
  )
}