<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Topbar />
    <div class="flex">
      <SidebarNav />
      <main class="flex-1 p-6">
        <router-view />
      </main>
    </div>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import Topbar from './Topbar.vue'
import SidebarNav from './SidebarNav.vue'
import Toast from '@/components/ui/Toast.vue'

const uiStore = useUIStore()

onMounted(() => {
  uiStore.initTheme()
})
</script>