import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useMatches() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchMatches() }, [user])

  async function fetchMatches() {
    setLoading(true)
    const { data } = await supabase
      .from('matches')
      .select('*, profiles!matches_host_id_fkey(full_name,avatar_url), referee:profiles!matches_referee_id_fkey(full_name,avatar_url), live_scores(*)')
      .or(`host_id.eq.${user.id},referee_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
    setMatches(data || [])
    setLoading(false)
  }

  async function createMatch(matchData) {
    const { data, error } = await supabase.from('matches').insert({ ...matchData, host_id: user.id }).select().single()
    if (!error) setMatches(prev => [data, ...prev])
    return { data, error }
  }

  async function acceptMatch(matchId) {
    const { data, error } = await supabase.from('matches').update({ referee_id: user.id, status: 'confirmed' }).eq('id', matchId).select().single()
    if (!error) setMatches(prev => prev.map(m => m.id === matchId ? data : m))
    return { data, error }
  }

  async function startMatch(matchId) {
    const { data, error } = await supabase.from('matches').update({ status: 'live' }).eq('id', matchId).select().single()
    if (!error) {
      setMatches(prev => prev.map(m => m.id === matchId ? data : m))
      await supabase.from('score_events').insert({ match_id: matchId, event_type: 'start', description: 'Match started' })
    }
    return { data, error }
  }

  async function finishMatch(matchId, winner) {
    const { data, error } = await supabase.from('matches').update({ status: 'finished' }).eq('id', matchId).select().single()
    if (!error) {
      setMatches(prev => prev.map(m => m.id === matchId ? data : m))
      await supabase.from('live_scores').update({ winner }).eq('match_id', matchId)
      await supabase.from('score_events').insert({ match_id: matchId, event_type: 'end', description: `Match finished — Winner: ${winner}` })
    }
    return { data, error }
  }

  return { matches, loading, fetchMatches, createMatch, acceptMatch, startMatch, finishMatch }
}

export function useOpenMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOpen() }, [])

  async function fetchOpen() {
    const { data } = await supabase.from('matches').select('*, profiles!matches_host_id_fkey(full_name,avatar_url)').eq('status', 'open').eq('is_public', true).order('created_at', { ascending: false })
    setMatches(data || [])
    setLoading(false)
  }

  return { matches, loading, refresh: fetchOpen }
}

export function useMatchByToken(token) {
  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    supabase.from('matches').select('*, profiles!matches_host_id_fkey(full_name), referee:profiles!matches_referee_id_fkey(full_name), live_scores(*)').eq('viewer_token', token).single().then(({ data }) => { setMatch(data); setLoading(false) })
  }, [token])

  return { match, loading }
}
