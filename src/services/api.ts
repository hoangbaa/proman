import axios from 'axios'
import { useUIStore } from '@/stores/ui'
import type { ApiResponse, PaginatedResponse } from '@/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const uiStore = useUIStore()
    
    let message = 'An error occurred'
    let title = 'Error'

    if (error.response) {
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 400:
          title = 'Bad Request'
          message = data.message || 'Invalid request'
          break
        case 401:
          title = 'Unauthorized'
          message = 'Please login to continue'
          break
        case 403:
          title = 'Forbidden'
          message = 'You do not have permission to perform this action'
          break
        case 404:
          title = 'Not Found'
          message = 'The requested resource was not found'
          break
        case 500:
          title = 'Server Error'
          message = 'Internal server error'
          break
        default:
          message = data.message || `HTTP ${status} Error`
      }
    } else if (error.request) {
      title = 'Network Error'
      message = 'Unable to connect to the server'
    }

    uiStore.addToast({
      type: 'error',
      title,
      message
    })

    return Promise.reject(error)
  }
)

// Mock API responses for demo
const mockData = {
  projects: [
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Redesigning the company website with modern UI/UX',
      status: 'active',
      progress: 65,
      dueDate: '2024-02-15',
      members: [],
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Mobile App',
      description: 'Developing a mobile app for iOS and Android',
      status: 'active',
      progress: 30,
      dueDate: '2024-03-20',
      members: [],
      createdAt: '2024-01-10'
    }
  ],
  tasks: [
    {
      id: '1',
      title: 'Design System Creation',
      description: 'Create a comprehensive design system',
      status: 'in-progress',
      priority: 'high',
      projectId: '1',
      dueDate: '2024-02-01',
      createdAt: '2024-01-05',
      subtasks: [
        { id: '1', title: 'Color palette', completed: true, taskId: '1' },
        { id: '2', title: 'Typography', completed: false, taskId: '1' }
      ]
    }
  ]
}

// Mock API service
export const apiService = {
  // Projects
  getProjects: (): Promise<PaginatedResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: mockData.projects,
          total: mockData.projects.length,
          page: 1,
          limit: 10,
          totalPages: 1
        })
      }, 500)
    })
  },

  getProject: (id: string): Promise<ApiResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const project = mockData.projects.find(p => p.id === id)
        if (project) {
          resolve({ data: project, success: true })
        } else {
          reject(new Error('Project not found'))
        }
      }, 300)
    })
  },

  // Tasks
  getTasks: (projectId?: string): Promise<PaginatedResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let tasks = mockData.tasks
        if (projectId) {
          tasks = tasks.filter(task => task.projectId === projectId)
        }
        resolve({
          data: tasks,
          total: tasks.length,
          page: 1,
          limit: 10,
          totalPages: 1
        })
      }, 400)
    })
  }
}

export default api