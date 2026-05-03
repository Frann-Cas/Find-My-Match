import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useLiveScore(matchId) {
  const [score, setScore] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!matchId) return
    fetchScore()
    fetchEvents()

    // Real-time score subscription
    const scoreSub = supabase
      .channel(`live-score-${matchId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public',
        table: 'live_scores', filter: `match_id=eq.${matchId}`
      }, payload => setScore(payload.new))
      .subscribe()

    // Real-time events subscription
    const eventSub = supabase
      .channel(`score-events-${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public',
        table: 'score_events', filter: `match_id=eq.${matchId}`
      }, payload => setEvents(prev => [payload.new, ...prev]))
      .subscribe()

    return () => {
      supabase.removeChannel(scoreSub)
      supabase.removeChannel(eventSub)
    }
  }, [matchId])

  async function fetchScore() {
    const { data } = await supabase
      .from('live_scores')
      .select('*')
      .eq('match_id', matchId)
      .single()
    setScore(data)
    setLoading(false)
  }

  async function fetchEvents() {
    const { data } = await supabase
      .from('score_events')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false })
      .limit(20)
    setEvents(data || [])
  }

  const updateScore = useCallback(async (updates, eventDescription) => {
    const { data, error } = await supabase
      .from('live_scores')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('match_id', matchId)
      .select()
      .single()

    if (!error && eventDescription) {
      await supabase.from('score_events').insert({
        match_id: matchId,
        event_type: 'score',
        description: eventDescription,
        score_snapshot: { score1: data.score1, score2: data.score2 }
      })
    }
    return { data, error }
  }, [matchId])

  return { score, events, loading, updateScore }
}
