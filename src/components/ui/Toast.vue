<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup
        enter-active-class="transition-all duration-300"
        enter-from-class="opacity-0 translate-x-full"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-300"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-full"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5',
            {
              'border-l-4 border-green-500': toast.type === 'success',
              'border-l-4 border-red-500': toast.type === 'error',
              'border-l-4 border-yellow-500': toast.type === 'warning',
              'border-l-4 border-blue-500': toast.type === 'info'
            }
          ]"
        >
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <component :is="getIcon(toast.type)" class="h-6 w-6" :class="getIconColor(toast.type)" />
              </div>
              <div class="ml-3 w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {{ toast.title }}
                </p>
                <p v-if="toast.message" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ toast.message }}
                </p>
              </div>
              <div class="ml-4 flex-shrink-0 flex">
                <button
                  @click="removeToast(toast.id)"
                  class="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()

const toasts = computed(() => uiStore.toasts)

const removeToast = (id: string) => {
  uiStore.removeToast(id)
}

const getIcon = (type: string) => {
  const icons = {
    success: () => h('svg', {
      fill: 'currentColor',
      viewBox: '0 0 20 20'
    }, [
      h('path', {
        fillRule: 'evenodd',
        d: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
        clipRule: 'evenodd'
      })
    ]),
    error: () => h('svg', {
      fill: 'currentColor',
      viewBox: '0 0 20 20'
    }, [
      h('path', {
        fillRule: 'evenodd',
        d: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z',
        clipRule: 'evenodd'
      })
    ]),
    warning: () => h('svg', {
      fill: 'currentColor',
      viewBox: '0 0 20 20'
    }, [
      h('path', {
        fillRule: 'evenodd',
        d: 'M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z',
        clipRule: 'evenodd'
      })
    ]),
    info: () => h('svg', {
      fill: 'currentColor',
      viewBox: '0 0 20 20'
    }, [
      h('path', {
        fillRule: 'evenodd',
        d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
        clipRule: 'evenodd'
      })
    ])
  }
  return icons[type as keyof typeof icons] || icons.info
}

const getIconColor = (type: string) => {
  const colors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }
  return colors[type as keyof typeof colors] || colors.info
}
</script>