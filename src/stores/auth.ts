import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const isLoading = ref(false)

  const login = async (email: string, password: string) => {
    isLoading.value = true
    try {
      // Mock login - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      user.value = {
        id: '1',
        name: 'John Doe',
        email,
        avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        role: 'admin'
      }
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Login failed' }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
  }

  // Auto-login for demo
  if (!user.value) {
    user.value = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      role: 'admin'
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  }
})