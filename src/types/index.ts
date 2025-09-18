export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'viewer'
}

export interface Project {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  progress: number
  dueDate?: string
  members: User[]
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assignee?: User
  projectId: string
  dueDate?: string
  createdAt: string
  subtasks: SubTask[]
}

export interface SubTask {
  id: string
  title: string
  completed: boolean
  taskId: string
}

export interface Group {
  id: string
  name: string
  description?: string
  members: User[]
  projects: Project[]
  createdAt: string
}

export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}