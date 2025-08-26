import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreatePrediction } from './components/CreatePrediction'
import { MyPredictions } from './components/MyPredictions'
import { Leaderboard } from './components/Leaderboard'
import { Trophy, Target, List } from 'lucide-react'

function App() {
  const [username, setUsername] = useState('')
  const [activeTab, setActiveTab] = useState('create')

  if (!username) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome to CallBoard
            </CardTitle>
            <p className="text-gray-600">Enter your username to start tracking predictions</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  setUsername(e.currentTarget.value.trim())
                }
              }}
            />
            <Button 
              onClick={() => {
                const trimmedUsername = username.trim()
                if (trimmedUsername) {
                  setUsername(trimmedUsername)
                }
              }}
              className="w-full"
              disabled={!username.trim()}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">CallBoard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {username}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setUsername('')}
              >
                Switch User
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Create</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>My Predictions</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-6">
            <CreatePrediction username={username} />
          </TabsContent>

          <TabsContent value="predictions" className="mt-6">
            <MyPredictions username={username} />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-6">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App
