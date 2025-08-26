import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api, Prediction } from '../lib/api'
import { toast } from 'sonner'
import { Clock, CheckCircle, XCircle, Calendar } from 'lucide-react'

interface MyPredictionsProps {
  username: string
}

export function MyPredictions({ username }: MyPredictionsProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('open')

  const fetchPredictions = async () => {
    try {
      const data = await api.getPredictions(undefined, username)
      setPredictions(data)
    } catch (error) {
      toast.error('Failed to fetch predictions')
      console.error('Error fetching predictions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPredictions()
  }, [username])

  const handleResolve = async (id: number, outcome: 'success' | 'fail') => {
    try {
      await api.resolvePrediction(id, outcome)
      toast.success(`Prediction resolved as ${outcome}!`)
      fetchPredictions()
    } catch (error) {
      toast.error('Failed to resolve prediction')
      console.error('Error resolving prediction:', error)
    }
  }

  const openPredictions = predictions.filter(p => p.status === 'open')
  const resolvedPredictions = predictions.filter(p => p.status === 'resolved')

  const canResolve = (prediction: Prediction) => {
    return prediction.status === 'open' && new Date() >= new Date(prediction.expires_at)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading predictions...</div>
      </div>
    )
  }

  const PredictionCard = ({ prediction }: { prediction: Prediction }) => (
    <Card key={prediction.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{prediction.title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={prediction.status === 'open' ? 'default' : 'secondary'}>
              {prediction.status}
            </Badge>
            {prediction.category && (
              <Badge variant="outline">{prediction.category}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Expires: {formatDate(prediction.expires_at)}
            </span>
            <span className="font-medium">Stake: {prediction.stake} points</span>
          </div>

          {prediction.status === 'resolved' && (
            <div className="flex items-center space-x-2">
              {prediction.outcome === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={`font-medium ${
                prediction.outcome === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {prediction.outcome === 'success' ? 'Success' : 'Failed'}
                {prediction.outcome === 'success' ? ` (+${prediction.stake})` : ` (-${prediction.stake})`}
              </span>
              <span className="text-sm text-gray-500">
                Resolved: {formatDate(prediction.resolved_at!)}
              </span>
            </div>
          )}

          {prediction.status === 'open' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {canResolve(prediction) ? (
                  <span className="text-orange-600 font-medium">Ready to resolve</span>
                ) : (
                  <span>Waiting for expiration</span>
                )}
              </div>
              {canResolve(prediction) && (
                <div className="space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolve(prediction.id, 'success')}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    Success
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolve(prediction.id, 'fail')}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Failed
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="open">
            Open Predictions ({openPredictions.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved Predictions ({resolvedPredictions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="mt-6">
          {openPredictions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No open predictions yet.</p>
                <p className="text-sm text-gray-500 mt-1">Create your first prediction to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {openPredictions.map(prediction => (
                <PredictionCard key={prediction.id} prediction={prediction} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved" className="mt-6">
          {resolvedPredictions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No resolved predictions yet.</p>
                <p className="text-sm text-gray-500 mt-1">Predictions will appear here after they expire and are resolved.</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {resolvedPredictions.map(prediction => (
                <PredictionCard key={prediction.id} prediction={prediction} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
