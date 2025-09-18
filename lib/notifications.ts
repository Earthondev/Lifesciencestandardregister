import React from 'react'
import { apiClient } from './api'

export interface NotificationOptions {
  title?: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  showLine?: boolean
}

class NotificationManager {
  private notifications: NotificationOptions[] = []
  private listeners: ((notifications: NotificationOptions[]) => void)[] = []

  addNotification(options: NotificationOptions) {
    const notification: NotificationOptions = {
      type: 'info',
      duration: 5000,
      showLine: false,
      ...options
    }

    this.notifications.push(notification)
    this.notifyListeners()

    // Auto remove after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification)
      }, notification.duration)
    }

    // Send LINE notification if enabled
    if (notification.showLine) {
      this.sendLineNotification(notification.message, notification.type)
    }
  }

  removeNotification(notification: NotificationOptions) {
    const index = this.notifications.indexOf(notification)
    if (index > -1) {
      this.notifications.splice(index, 1)
      this.notifyListeners()
    }
  }

  clearNotifications() {
    this.notifications = []
    this.notifyListeners()
  }

  subscribe(listener: (notifications: NotificationOptions[]) => void) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]))
  }

  private async sendLineNotification(message: string, type?: string) {
    try {
      await apiClient.sendLineNotification(message, type)
    } catch (error) {
      console.error('Failed to send LINE notification:', error)
    }
  }

  // Convenience methods
  success(message: string, options?: Partial<NotificationOptions>) {
    this.addNotification({
      ...options,
      message,
      type: 'success'
    })
  }

  error(message: string, options?: Partial<NotificationOptions>) {
    this.addNotification({
      ...options,
      message,
      type: 'error',
      duration: 0 // Don't auto-remove errors
    })
  }

  warning(message: string, options?: Partial<NotificationOptions>) {
    this.addNotification({
      ...options,
      message,
      type: 'warning'
    })
  }

  info(message: string, options?: Partial<NotificationOptions>) {
    this.addNotification({
      ...options,
      message,
      type: 'info'
    })
  }
}

export const notificationManager = new NotificationManager()

// React hook for notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = React.useState<NotificationOptions[]>([])

  React.useEffect(() => {
    const unsubscribe = notificationManager.subscribe(setNotifications)
    return unsubscribe
  }, [])

  return {
    notifications,
    addNotification: notificationManager.addNotification.bind(notificationManager),
    removeNotification: notificationManager.removeNotification.bind(notificationManager),
    clearNotifications: notificationManager.clearNotifications.bind(notificationManager),
    success: notificationManager.success.bind(notificationManager),
    error: notificationManager.error.bind(notificationManager),
    warning: notificationManager.warning.bind(notificationManager),
    info: notificationManager.info.bind(notificationManager)
  }
}

// Browser notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Show browser notification
export const showBrowserNotification = (options: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    new Notification(options.title || 'Life Science Standards Register', {
      body: options.message,
      icon: '/favicon.ico',
      tag: 'lsr-notification'
    })
  }
}
