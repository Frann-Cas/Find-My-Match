import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!userId) return

    // Fetch existing
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setNotifications(data || [])
        setUnreadCount((data || []).filter(n => !n.read).length)
      })

    // Realtime subscription
    const ch = supabase
      .channel(`notifs-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, payload => {
        setNotifications(prev => [payload.new, ...prev])
        setUnreadCount(c => c + 1)
      })
      .subscribe()

    return () => supabase.removeChannel(ch)
  }, [userId])

  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return { notifications, unreadCount, markAllRead }
}
