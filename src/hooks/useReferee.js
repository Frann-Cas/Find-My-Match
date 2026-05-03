import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useRefereeProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    supabase
      .from('referee_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => { setProfile(data); setLoading(false) })
  }, [userId])

  return { profile, loading }
}

export async function toggleAvailability(userId, available) {
  const { error } = await supabase
    .from('referee_profiles')
    .upsert({ user_id: userId, available }, { onConflict: 'user_id' })
  if (error) throw error
}

export async function createRefereeProfile(userId, data) {
  const { data: profile, error } = await supabase
    .from('referee_profiles')
    .upsert({ user_id: userId, ...data }, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw error
  return profile
}

// Get all open matches (job board for referees)
export function useOpenMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('matches')
      .select(`*, host:profiles!host_id(full_name, avatar_url)`)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setMatches(data || []); setLoading(false) })

    // Subscribe to new open matches
    const ch = supabase
      .channel('open-matches')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'matches'
      }, () => {
        // Refetch on any match change
        supabase
          .from('matches')
          .select(`*, host:profiles!host_id(full_name, avatar_url)`)
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .then(({ data }) => setMatches(data || []))
      })
      .subscribe()

    return () => supabase.removeChannel(ch)
  }, [])

  return { matches, loading }
}
