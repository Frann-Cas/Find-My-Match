const ONESIGNAL_APP_ID = '406b51a8-a9fa-4e20-b38a-4de9fcf0cc3e'
const ONESIGNAL_REST_KEY = 'os_v2_app_ibvvdkfj7jhcbm4kjxu7z4gmhydugc2qexjeaamfwuqhz7vfkuppu52tm4n3i3xivbupvsbl76drnln3yln2jnmmapvqsurq2gt2c7i'

export async function sendNotificationToUser(userId, title, message, data = {}) {
  try {
    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${ONESIGNAL_REST_KEY}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        filters: [{ field: 'tag', key: 'user_id', relation: '=', value: userId }],
        headings: { en: title },
        contents: { en: message },
        data
      })
    })
  } catch (err) {
    console.error('Notification error:', err)
  }
}

export async function sendNotificationToAll(title, message, data = {}) {
  try {
    await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${ONESIGNAL_REST_KEY}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ['All'],
        headings: { en: title },
        contents: { en: message },
        data
      })
    })
  } catch (err) {
    console.error('Notification error:', err)
  }
}

export async function tagUserForNotifications(userId) {
  if (window.OneSignal) {
    await window.OneSignal.login(userId)
    await window.OneSignal.User.addTag('user_id', userId)
  }
}