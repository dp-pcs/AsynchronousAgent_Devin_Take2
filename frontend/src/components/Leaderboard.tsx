import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api, LeaderboardEntry } from '../lib/api'
import { toast } from 'sonner'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.getLeaderboard()
        setLeaderboard(data)
      } catch (error) {
        toast.error('Failed to fetch leaderboard')
        console.error('Error fetching leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading leaderboard...</div>
      </div>
    )
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return 'default'
      case 2:
        return 'secondary'
      case 3:
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6" />
            <span>Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="py-12 text-center">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No predictions made yet.</p>
              <p className="text-sm text-gray-500 mt-1">Be the first to create a prediction and climb the leaderboard!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry, index) => {
                const rank = index + 1
                return (
                  <div
                    key={entry.username}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      rank <= 3 ? 'bg-gradient-to-r from-gray-50 to-white' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(rank)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{entry.username}</h3>
                          {rank <= 3 && (
                            <Badge variant={getRankBadgeVariant(rank)}>
                              {rank === 1 ? 'Champion' : rank === 2 ? 'Runner-up' : 'Third Place'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {entry.predictions_count} prediction{entry.predictions_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        entry.total_points > 0 ? 'text-green-600' : 
                        entry.total_points < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {entry.total_points > 0 ? '+' : ''}{entry.total_points}
                      </div>
                      <div className="text-sm text-gray-500">points</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
