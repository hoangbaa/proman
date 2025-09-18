import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ToastMessage } from '@/types'

export const useUIStore = defineStore('ui', () => {
  const isDarkMode = ref(false)
  const sidebarOpen = ref(true)
  const toasts = ref<ToastMessage[]>([])

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastMessage = {
      id,
      duration: 5000,
      ...toast
    }
    toasts.value.push(newToast)

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  // Initialize dark mode from localStorage or system preference
  const initTheme = () => {
    const saved = localStorage.getItem('darkMode')
    if (saved) {
      isDarkMode.value = JSON.parse(saved)
    } else {
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
    }
  }

  // Save theme preference
  const saveTheme = () => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode.value))
  }

  return {
    isDarkMode,
    sidebarOpen,
    toasts,
    toggleDarkMode,
    toggleSidebar,
    addToast,
    removeToast,
    initTheme,
    saveTheme
  }
})