import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/Dashboard.vue'),
    meta: { title: 'Dashboard' }
  },
  {
    path: '/profiles',
    name: 'Profiles',
    component: () => import('@/pages/Profiles.vue'),
    meta: { title: 'Profiles' }
  },
  {
    path: '/groups',
    name: 'Groups',
    component: () => import('@/pages/Groups.vue'),
    meta: { title: 'Groups' }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/pages/Projects.vue'),
    meta: { title: 'Projects' }
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetail',
    component: () => import('@/pages/ProjectDetail.vue'),
    meta: { title: 'Project Details' },
    children: [
      {
        path: '',
        redirect: 'overview'
      },
      {
        path: 'overview',
        name: 'ProjectOverview',
        component: () => import('@/pages/project/Overview.vue'),
        meta: { title: 'Overview' }
      },
      {
        path: 'tasks',
        name: 'ProjectTasks',
        component: () => import('@/pages/project/Tasks.vue'),
        meta: { title: 'Tasks' }
      },
      {
        path: 'history',
        name: 'ProjectHistory',
        component: () => import('@/pages/project/History.vue'),
        meta: { title: 'History' }
      }
    ]
  },
  {
    path: '/planner',
    name: 'Planner',
    component: () => import('@/pages/Planner.vue'),
    meta: { title: 'Planner' }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/pages/History.vue'),
    meta: { title: 'History' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/Settings.vue'),
    meta: { title: 'Settings' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Update document title based on route meta
router.beforeEach((to, from, next) => {
  const title = to.meta?.title as string
  if (title) {
    document.title = `${title} - Project Manager`
  }
  next()
})

export default router