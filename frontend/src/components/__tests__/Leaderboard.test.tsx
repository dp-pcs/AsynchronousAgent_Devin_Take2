import { render, screen, waitFor } from '@testing-library/react'
import { Leaderboard } from '../Leaderboard'
import { api } from '../../lib/api'
import { toast } from 'sonner'

jest.mock('../../lib/api', () => ({
  api: {
    getLeaderboard: jest.fn(),
  },
}))

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}))

const mockApi = api as jest.Mocked<typeof api>
const mockToast = toast as jest.Mocked<typeof toast>

describe('Leaderboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state initially', () => {
    mockApi.getLeaderboard.mockImplementation(() => new Promise(() => {}))
    
    render(<Leaderboard />)
    
    expect(screen.getByText('Loading leaderboard...')).toBeInTheDocument()
  })

  it('displays empty state when no predictions exist', async () => {
    mockApi.getLeaderboard.mockResolvedValueOnce([])
    
    render(<Leaderboard />)
    
    await waitFor(() => {
      expect(screen.getByText('No predictions made yet.')).toBeInTheDocument()
      expect(screen.getByText('Be the first to create a prediction and climb the leaderboard!')).toBeInTheDocument()
    })
  })

  it('displays leaderboard entries correctly', async () => {
    const mockLeaderboard = [
      {
        username: 'user1',
        total_points: 50,
        predictions_count: 5,
      },
      {
        username: 'user2',
        total_points: -10,
        predictions_count: 2,
      },
      {
        username: 'user3',
        total_points: 25,
        predictions_count: 3,
      },
    ]
    
    mockApi.getLeaderboard.mockResolvedValueOnce(mockLeaderboard)
    
    render(<Leaderboard />)
    
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument()
      expect(screen.getByText('user2')).toBeInTheDocument()
      expect(screen.getByText('user3')).toBeInTheDocument()
      
      expect(screen.getByText('+50')).toBeInTheDocument()
      expect(screen.getByText('-10')).toBeInTheDocument()
      expect(screen.getByText('+25')).toBeInTheDocument()
      
      expect(screen.getByText('5 predictions')).toBeInTheDocument()
      expect(screen.getByText('2 predictions')).toBeInTheDocument()
      expect(screen.getByText('3 predictions')).toBeInTheDocument()
    })
  })

  it('shows champion badge for first place', async () => {
    const mockLeaderboard = [
      {
        username: 'champion',
        total_points: 100,
        predictions_count: 10,
      },
    ]
    
    mockApi.getLeaderboard.mockResolvedValueOnce(mockLeaderboard)
    
    render(<Leaderboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Champion')).toBeInTheDocument()
    })
  })

  it('shows runner-up badge for second place', async () => {
    const mockLeaderboard = [
      {
        username: 'first',
        total_points: 100,
        predictions_count: 10,
      },
      {
        username: 'second',
        total_points: 50,
        predictions_count: 5,
      },
    ]
    
    mockApi.getLeaderboard.mockResolvedValueOnce(mockLeaderboard)
    
    render(<Leaderboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Runner-up')).toBeInTheDocument()
    })
  })

  it('handles singular prediction count correctly', async () => {
    const mockLeaderboard = [
      {
        username: 'user1',
        total_points: 10,
        predictions_count: 1,
      },
    ]
    
    mockApi.getLeaderboard.mockResolvedValueOnce(mockLeaderboard)
    
    render(<Leaderboard />)
    
    await waitFor(() => {
      expect(screen.getByText('1 prediction')).toBeInTheDocument()
    })
  })

  it('handles API error gracefully', async () => {
    mockApi.getLeaderboard.mockRejectedValueOnce(new Error('API Error'))
    
    render(<Leaderboard />)
    
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to fetch leaderboard')
    })
  })

  it('displays correct point colors based on value', async () => {
    const mockLeaderboard = [
      {
        username: 'positive',
        total_points: 50,
        predictions_count: 5,
      },
      {
        username: 'negative',
        total_points: -20,
        predictions_count: 2,
      },
      {
        username: 'zero',
        total_points: 0,
        predictions_count: 1,
      },
    ]
    
    mockApi.getLeaderboard.mockResolvedValueOnce(mockLeaderboard)
    
    render(<Leaderboard />)
    
    await waitFor(() => {
      const positivePoints = screen.getByText('+50')
      const negativePoints = screen.getByText('-20')
      const zeroPoints = screen.getByText('0')
      
      expect(positivePoints).toHaveClass('text-green-600')
      expect(negativePoints).toHaveClass('text-red-600')
      expect(zeroPoints).toHaveClass('text-gray-600')
    })
  })
})
