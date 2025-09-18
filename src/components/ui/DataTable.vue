<template>
  <div class="data-table">
    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4">
      <div class="animate-pulse">
        <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div v-for="i in 5" :key="i" class="h-16 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div>
      </div>
    </div>

    <!-- Table -->
    <div v-else-if="data.length" class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :style="{ width: column.width }"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              <button
                v-if="column.sortable"
                @click="handleSort(column.key)"
                class="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {{ column.label }}
                <span class="text-gray-400">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 8l5-5 5 5H5zM5 12l5 5 5-5H5z"/>
                  </svg>
                </span>
              </button>
              <span v-else>{{ column.label }}</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="(row, index) in data"
            :key="index"
            class="hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
            >
              <slot
                :name="column.key"
                :row="row"
                :value="row[column.key]"
              >
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-else class="py-12">
      <slot name="empty">
        <div class="text-center">
          <div class="text-6xl mb-4">📄</div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No data found
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            No records match your current filters.
          </p>
        </div>
      </slot>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination.totalPages > 1"
      class="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
    >
      <div class="text-sm text-gray-700 dark:text-gray-300">
        Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
        {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
        {{ pagination.total }} results
      </div>
      
      <div class="flex gap-2">
        <button
          @click="goToPage(pagination.page - 1)"
          :disabled="pagination.page <= 1"
          class="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="goToPage(page)"
          :class="{
            'bg-primary-600 text-white': page === pagination.page,
            'hover:bg-gray-100 dark:hover:bg-gray-700': page !== pagination.page
          }"
          class="px-3 py-1 text-sm border rounded"
        >
          {{ page }}
        </button>
        
        <button
          @click="goToPage(pagination.page + 1)"
          :disabled="pagination.page >= pagination.totalPages"
          class="px-3 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumn } from '@/types'

interface Props {
  columns: TableColumn[]
  data: any[]
  loading?: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface Emits {
  (e: 'page-change', page: number): void
  (e: 'sort', column: string, direction: 'asc' | 'desc'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const visiblePages = computed(() => {
  const current = props.pagination.page
  const total = props.pagination.totalPages
  const delta = 2
  
  const range = []
  const rangeWithDots = []
  
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }
  
  if (current - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }
  
  rangeWithDots.push(...range)
  
  if (current + delta < total - 1) {
    rangeWithDots.push('...', total)
  } else if (total > 1) {
    rangeWithDots.push(total)
  }
  
  return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index)
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.pagination.totalPages) {
    emit('page-change', page)
  }
}

const handleSort = (column: string) => {
  // Simple toggle between asc/desc
  emit('sort', column, 'asc')
}
</script>