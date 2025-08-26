import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CreatePrediction } from '../CreatePrediction'
import { api } from '../../lib/api'
import { toast } from 'sonner'

jest.mock('../../lib/api', () => ({
  api: {
    createPrediction: jest.fn(),
  },
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const mockApi = api as jest.Mocked<typeof api>
const mockToast = toast as jest.Mocked<typeof toast>

describe('CreatePrediction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the create prediction form', () => {
    render(<CreatePrediction username="testuser" />)
    
    expect(screen.getByText('Create New Prediction')).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/stake points/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/expires at/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create prediction/i })).toBeInTheDocument()
  })

  it('has default stake value of 10', () => {
    render(<CreatePrediction username="testuser" />)
    
    const stakeInput = screen.getByLabelText(/stake points/i) as HTMLInputElement
    expect(stakeInput.value).toBe('10')
  })

  it('shows validation error for empty title', async () => {
    render(<CreatePrediction username="testuser" />)
    
    const form = screen.getByRole('button', { name: /create prediction/i }).closest('form')!
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Please fill in all required fields')
    })
  })

  it('shows validation error for empty expires date', async () => {
    render(<CreatePrediction username="testuser" />)
    
    const titleInput = screen.getByLabelText(/title/i)
    fireEvent.change(titleInput, { target: { value: 'Test prediction' } })
    
    const form = screen.getByRole('button', { name: /create prediction/i }).closest('form')!
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Please fill in all required fields')
    })
  })

  it('successfully creates a prediction with valid data', async () => {
    const mockPrediction = {
      id: 1,
      title: 'Test prediction',
      category: 'test',
      stake: 15,
      expires_at: '2025-08-27T12:00:00',
      status: 'open' as const,
      username: 'testuser',
      created_at: '2025-08-25T12:00:00',
    }
    
    mockApi.createPrediction.mockResolvedValueOnce(mockPrediction)
    
    render(<CreatePrediction username="testuser" />)
    
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test prediction' }
    })
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'test' }
    })
    fireEvent.change(screen.getByLabelText(/stake points/i), {
      target: { value: '15' }
    })
    fireEvent.change(screen.getByLabelText(/expires at/i), {
      target: { value: '2025-08-27T12:00' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /create prediction/i }))
    
    await waitFor(() => {
      expect(mockApi.createPrediction).toHaveBeenCalledWith({
        title: 'Test prediction',
        category: 'test',
        stake: 15,
        expires_at: '2025-08-27T12:00',
        username: 'testuser',
      })
    })
    
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Prediction created successfully!')
    })
  })

  it('handles API error gracefully', async () => {
    mockApi.createPrediction.mockRejectedValueOnce(new Error('API Error'))
    
    render(<CreatePrediction username="testuser" />)
    
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test prediction' }
    })
    fireEvent.change(screen.getByLabelText(/expires at/i), {
      target: { value: '2025-08-27T12:00' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /create prediction/i }))
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to create prediction')
    })
  })

  it('clears form after successful submission', async () => {
    const mockPrediction = {
      id: 1,
      title: 'Test prediction',
      stake: 10,
      expires_at: '2025-08-27T12:00:00',
      status: 'open' as const,
      username: 'testuser',
      created_at: '2025-08-25T12:00:00',
    }
    
    mockApi.createPrediction.mockResolvedValueOnce(mockPrediction)
    
    render(<CreatePrediction username="testuser" />)
    
    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement
    const categoryInput = screen.getByLabelText(/category/i) as HTMLInputElement
    const expiresInput = screen.getByLabelText(/expires at/i) as HTMLInputElement
    
    fireEvent.change(titleInput, { target: { value: 'Test prediction' } })
    fireEvent.change(categoryInput, { target: { value: 'test' } })
    fireEvent.change(expiresInput, { target: { value: '2025-08-27T12:00' } })
    
    fireEvent.click(screen.getByRole('button', { name: /create prediction/i }))
    
    await waitFor(() => {
      expect(titleInput.value).toBe('')
      expect(categoryInput.value).toBe('')
      expect(expiresInput.value).toBe('')
    })
  })
})
