import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { api } from '../lib/api'
import { toast } from 'sonner'

interface CreatePredictionProps {
  username: string
}

export function CreatePrediction({ username }: CreatePredictionProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [stake, setStake] = useState(10)
  const [expiresAt, setExpiresAt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !expiresAt) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      await api.createPrediction({
        title: title.trim(),
        category: category.trim() || undefined,
        stake,
        expires_at: expiresAt,
        username,
      })
      
      toast.success('Prediction created successfully!')
      setTitle('')
      setCategory('')
      setStake(10)
      setExpiresAt('')
    } catch (error) {
      toast.error('Failed to create prediction')
      console.error('Error creating prediction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateString = minDate.toISOString().slice(0, 16)

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Prediction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Textarea
              id="title"
              placeholder="What do you predict will happen?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Input
              id="category"
              placeholder="e.g., tech, sports, politics"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stake">Stake Points</Label>
            <Input
              id="stake"
              type="number"
              min="1"
              max="1000"
              value={stake}
              onChange={(e) => setStake(parseInt(e.target.value) || 10)}
              required
            />
            <p className="text-sm text-gray-600">
              Points you'll gain if correct, or lose if wrong
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires-at">Expires At *</Label>
            <Input
              id="expires-at"
              type="datetime-local"
              min={minDateString}
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              required
            />
            <p className="text-sm text-gray-600">
              When this prediction can be resolved
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Prediction'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
