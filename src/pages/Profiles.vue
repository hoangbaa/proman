<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Profiles
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Manage browser profiles for automation and testing.
        </p>
      </div>
      <div class="flex gap-3">
        <button @click="showImportModal = true" class="btn btn-secondary">
          Import
        </button>
        <button @click="exportProfiles" class="btn btn-secondary">
          Export
        </button>
        <button @click="openNewProfileModal" class="btn btn-primary">
          New Profile
        </button>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="card p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by Alias or ProfileID..."
            class="form-input"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Status</label>
          <select v-model="statusFilter" class="form-input">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="busy">Busy</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Group</label>
          <select v-model="groupFilter" class="form-input">
            <option value="">All Groups</option>
            <option v-for="group in groups" :key="group" :value="group">
              {{ group }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">Tag</label>
          <select v-model="tagFilter" class="form-input">
            <option value="">All Tags</option>
            <option v-for="tag in allTags" :key="tag" :value="tag">
              {{ tag }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card">
      <DataTable
        :columns="columns"
        :data="filteredProfiles"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        @sort="handleSort"
      >
        <template #alias="{ row }">
          <div class="font-medium">{{ row.alias }}</div>
        </template>

        <template #profileId="{ row }">
          <code class="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {{ row.profileId }}
          </code>
        </template>

        <template #status="{ row }">
          <span
            :class="{
              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': row.status === 'active',
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': row.status === 'busy',
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': row.status === 'blocked'
            }"
            class="px-2 py-1 text-xs font-medium rounded-full"
          >
            {{ row.status }}
          </span>
          <span
            v-if="row.status === 'blocked' || !row.proxy"
            class="ml-2 text-red-500"
            title="Warning: Profile has issues"
          >
            ⚠️
          </span>
        </template>

        <template #proxy="{ row }">
          <span v-if="row.proxy" class="text-sm">{{ row.proxy }}</span>
          <span v-else class="text-gray-400 text-sm italic">No proxy</span>
        </template>

        <template #tags="{ row }">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="tag in row.tags"
              :key="tag"
              class="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
            >
              {{ tag }}
            </span>
          </div>
        </template>

        <template #lastAssignedAt="{ row }">
          <span v-if="row.lastAssignedAt" class="text-sm">
            {{ formatDate(row.lastAssignedAt) }}
          </span>
          <span v-else class="text-gray-400 text-sm italic">Never</span>
        </template>

        <template #actions="{ row }">
          <div class="flex gap-2">
            <button
              @click="editProfile(row)"
              class="text-blue-600 hover:text-blue-800 text-sm"
              title="Edit"
            >
              Edit
            </button>
            <button
              @click="launchProfile(row)"
              class="text-green-600 hover:text-green-800 text-sm"
              title="Launch"
            >
              Launch
            </button>
            <button
              @click="toggleProfileStatus(row)"
              :class="row.status === 'active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'"
              class="text-sm"
              :title="row.status === 'active' ? 'Deactivate' : 'Activate'"
            >
              {{ row.status === 'active' ? 'Deactivate' : 'Activate' }}
            </button>
          </div>
        </template>

        <template #empty>
          <div class="text-center py-12">
            <div class="text-6xl mb-4">👤</div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No profiles found
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Get started by creating your first browser profile.
            </p>
            <button @click="openNewProfileModal" class="btn btn-primary">
              Create Profile
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- New/Edit Profile Modal -->
    <Modal
      :show="showProfileModal"
      :title="editingProfile ? 'Edit Profile' : 'New Profile'"
      @close="closeProfileModal"
    >
      <form @submit.prevent="saveProfile" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Alias *</label>
          <input
            v-model="profileForm.alias"
            type="text"
            required
            class="form-input"
            placeholder="Enter profile alias"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Profile ID *</label>
          <input
            v-model="profileForm.profileId"
            type="text"
            required
            class="form-input"
            placeholder="Enter unique profile ID"
          />
          <p v-if="profileIdError" class="text-red-500 text-sm mt-1">
            {{ profileIdError }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Group</label>
          <select v-model="profileForm.group" class="form-input">
            <option value="">Select group</option>
            <option v-for="group in groups" :key="group" :value="group">
              {{ group }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Status</label>
          <select v-model="profileForm.status" class="form-input">
            <option value="active">Active</option>
            <option value="busy">Busy</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Proxy</label>
          <input
            v-model="profileForm.proxy"
            type="text"
            class="form-input"
            placeholder="proxy:port or proxy:port:user:pass"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Weight</label>
          <input
            v-model.number="profileForm.weight"
            type="number"
            min="1"
            max="100"
            class="form-input"
            placeholder="1-100"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Tags</label>
          <input
            v-model="tagInput"
            type="text"
            class="form-input"
            placeholder="Enter tags separated by commas"
            @input="updateTags"
          />
          <div v-if="profileForm.tags.length" class="flex flex-wrap gap-2 mt-2">
            <span
              v-for="tag in profileForm.tags"
              :key="tag"
              class="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded flex items-center gap-1"
            >
              {{ tag }}
              <button
                type="button"
                @click="removeTag(tag)"
                class="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" @click="closeProfileModal" class="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            {{ editingProfile ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Launch Profile Modal -->
    <Modal
      :show="showLaunchModal"
      title="Profile Launched"
      @close="showLaunchModal = false"
    >
      <div class="text-center py-6">
        <div class="text-6xl mb-4">🚀</div>
        <h3 class="text-lg font-medium mb-4">Profile Successfully Launched</h3>
        <div class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Remote Debugging Address:
          </p>
          <code class="text-sm font-mono bg-white dark:bg-gray-900 px-3 py-2 rounded border">
            {{ launchInfo.debuggingAddress }}
          </code>
        </div>
        <p class="text-sm text-gray-500 mt-4">
          You can now connect to this profile using the debugging address above.
        </p>
      </div>
    </Modal>

    <!-- Import Modal -->
    <Modal
      :show="showImportModal"
      title="Import Profiles"
      @close="showImportModal = false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Import Format</label>
          <select v-model="importFormat" class="form-input">
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium mb-2">Select File</label>
          <input
            type="file"
            :accept="importFormat === 'csv' ? '.csv' : '.json'"
            @change="handleFileSelect"
            class="form-input"
          />
        </div>

        <div v-if="importPreview.length" class="max-h-40 overflow-y-auto">
          <h4 class="font-medium mb-2">Preview ({{ importPreview.length }} profiles):</h4>
          <div class="text-sm space-y-1">
            <div v-for="profile in importPreview.slice(0, 5)" :key="profile.profileId">
              {{ profile.alias }} ({{ profile.profileId }})
            </div>
            <div v-if="importPreview.length > 5" class="text-gray-500">
              ... and {{ importPreview.length - 5 }} more
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button @click="showImportModal = false" class="btn btn-secondary">
            Cancel
          </button>
          <button
            @click="importProfiles"
            :disabled="!importPreview.length"
            class="btn btn-primary"
          >
            Import {{ importPreview.length }} Profiles
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import DataTable from '@/components/ui/DataTable.vue'
import Modal from '@/components/ui/Modal.vue'
import type { TableColumn } from '@/types'

interface Profile {
  id: string
  alias: string
  profileId: string
  group: string
  weight: number
  status: 'active' | 'busy' | 'blocked'
  proxy: string
  tags: string[]
  lastAssignedAt: string | null
}

const uiStore = useUIStore()

// Data
const profiles = ref<Profile[]>([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const groupFilter = ref('')
const tagFilter = ref('')

// Pagination
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

// Modals
const showProfileModal = ref(false)
const showLaunchModal = ref(false)
const showImportModal = ref(false)
const editingProfile = ref<Profile | null>(null)

// Forms
const profileForm = ref({
  alias: '',
  profileId: '',
  group: '',
  weight: 50,
  status: 'active' as Profile['status'],
  proxy: '',
  tags: [] as string[]
})

const tagInput = ref('')
const profileIdError = ref('')

// Import/Export
const importFormat = ref('csv')
const importPreview = ref<Profile[]>([])

// Launch info
const launchInfo = ref({
  debuggingAddress: ''
})

// Static data
const groups = ['Default', 'Testing', 'Production', 'Development']
const allTags = computed(() => {
  const tags = new Set<string>()
  profiles.value.forEach(profile => {
    profile.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
})

// Table columns
const columns: TableColumn[] = [
  { key: 'alias', label: 'Alias', sortable: true },
  { key: 'profileId', label: 'Profile ID', sortable: true },
  { key: 'group', label: 'Group', sortable: true },
  { key: 'weight', label: 'Weight', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'proxy', label: 'Proxy' },
  { key: 'tags', label: 'Tags' },
  { key: 'lastAssignedAt', label: 'Last Assigned', sortable: true },
  { key: 'actions', label: 'Actions', width: '200px' }
]

// Computed
const filteredProfiles = computed(() => {
  let filtered = profiles.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(profile =>
      profile.alias.toLowerCase().includes(query) ||
      profile.profileId.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(profile => profile.status === statusFilter.value)
  }

  if (groupFilter.value) {
    filtered = filtered.filter(profile => profile.group === groupFilter.value)
  }

  if (tagFilter.value) {
    filtered = filtered.filter(profile => profile.tags.includes(tagFilter.value))
  }

  // Update pagination
  pagination.value.total = filtered.length
  pagination.value.totalPages = Math.ceil(filtered.length / pagination.value.limit)

  // Apply pagination
  const start = (pagination.value.page - 1) * pagination.value.limit
  const end = start + pagination.value.limit
  return filtered.slice(start, end)
})

// Methods
const loadProfiles = async () => {
  loading.value = true
  try {
    // Mock data
    await new Promise(resolve => setTimeout(resolve, 1000))
    profiles.value = [
      {
        id: '1',
        alias: 'Chrome Profile 1',
        profileId: 'gpm_001',
        group: 'Testing',
        weight: 75,
        status: 'active',
        proxy: '192.168.1.100:8080',
        tags: ['automation', 'testing'],
        lastAssignedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        alias: 'Firefox Dev',
        profileId: 'gpm_002',
        group: 'Development',
        weight: 50,
        status: 'blocked',
        proxy: '',
        tags: ['development', 'debug'],
        lastAssignedAt: null
      },
      {
        id: '3',
        alias: 'Safari Test',
        profileId: 'gpm_003',
        group: 'Production',
        weight: 90,
        status: 'busy',
        proxy: '10.0.0.1:3128:user:pass',
        tags: ['production', 'safari'],
        lastAssignedAt: '2024-01-14T15:45:00Z'
      }
    ]
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
}

const handleSort = (column: string, direction: 'asc' | 'desc') => {
  // Implement sorting logic
  console.log('Sort:', column, direction)
}

const openNewProfileModal = () => {
  editingProfile.value = null
  profileForm.value = {
    alias: '',
    profileId: '',
    group: '',
    weight: 50,
    status: 'active',
    proxy: '',
    tags: []
  }
  tagInput.value = ''
  profileIdError.value = ''
  showProfileModal.value = true
}

const editProfile = (profile: Profile) => {
  editingProfile.value = profile
  profileForm.value = {
    alias: profile.alias,
    profileId: profile.profileId,
    group: profile.group,
    weight: profile.weight,
    status: profile.status,
    proxy: profile.proxy,
    tags: [...profile.tags]
  }
  tagInput.value = profile.tags.join(', ')
  profileIdError.value = ''
  showProfileModal.value = true
}

const closeProfileModal = () => {
  showProfileModal.value = false
  editingProfile.value = null
  profileIdError.value = ''
}

const validateProfileId = (profileId: string): boolean => {
  if (!profileId) return false
  
  const existing = profiles.value.find(p => 
    p.profileId === profileId && p.id !== editingProfile.value?.id
  )
  
  if (existing) {
    profileIdError.value = 'Profile ID must be unique'
    return false
  }
  
  profileIdError.value = ''
  return true
}

const saveProfile = async () => {
  if (!validateProfileId(profileForm.value.profileId)) {
    return
  }

  try {
    if (editingProfile.value) {
      // Update existing profile
      const index = profiles.value.findIndex(p => p.id === editingProfile.value!.id)
      if (index !== -1) {
        profiles.value[index] = {
          ...editingProfile.value,
          ...profileForm.value
        }
      }
      uiStore.addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Profile has been updated successfully'
      })
    } else {
      // Create new profile
      const newProfile: Profile = {
        id: Date.now().toString(),
        ...profileForm.value,
        lastAssignedAt: null
      }
      profiles.value.push(newProfile)
      uiStore.addToast({
        type: 'success',
        title: 'Profile Created',
        message: 'New profile has been created successfully'
      })
    }
    
    closeProfileModal()
  } catch (error) {
    uiStore.addToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to save profile'
    })
  }
}

const launchProfile = (profile: Profile) => {
  launchInfo.value.debuggingAddress = `localhost:${9222 + Math.floor(Math.random() * 1000)}`
  showLaunchModal.value = true
  
  uiStore.addToast({
    type: 'success',
    title: 'Profile Launched',
    message: `${profile.alias} has been launched successfully`
  })
}

const toggleProfileStatus = (profile: Profile) => {
  const newStatus = profile.status === 'active' ? 'blocked' : 'active'
  profile.status = newStatus
  
  uiStore.addToast({
    type: 'success',
    title: 'Status Updated',
    message: `${profile.alias} is now ${newStatus}`
  })
}

const updateTags = () => {
  const tags = tagInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
  profileForm.value.tags = [...new Set(tags)]
}

const removeTag = (tagToRemove: string) => {
  profileForm.value.tags = profileForm.value.tags.filter(tag => tag !== tagToRemove)
  tagInput.value = profileForm.value.tags.join(', ')
}

const handleFileSelect = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      if (importFormat.value === 'csv') {
        importPreview.value = parseCSV(content)
      } else {
        importPreview.value = JSON.parse(content)
      }
    } catch (error) {
      uiStore.addToast({
        type: 'error',
        title: 'Import Error',
        message: 'Failed to parse file'
      })
    }
  }
  reader.readAsText(file)
}

const parseCSV = (content: string): Profile[] => {
  const lines = content.split('\n').filter(line => line.trim())
  const headers = lines[0].split(',').map(h => h.trim())
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim())
    return {
      id: `import_${index}`,
      alias: values[0] || `Imported Profile ${index + 1}`,
      profileId: values[1] || `gpm_import_${index}`,
      group: values[2] || 'Default',
      weight: parseInt(values[3]) || 50,
      status: (values[4] as Profile['status']) || 'active',
      proxy: values[5] || '',
      tags: values[6] ? values[6].split(';') : [],
      lastAssignedAt: null
    }
  })
}

const importProfiles = () => {
  profiles.value.push(...importPreview.value)
  showImportModal.value = false
  importPreview.value = []
  
  uiStore.addToast({
    type: 'success',
    title: 'Import Successful',
    message: `Imported ${importPreview.value.length} profiles`
  })
}

const exportProfiles = () => {
  const data = profiles.value.map(profile => ({
    alias: profile.alias,
    profileId: profile.profileId,
    group: profile.group,
    weight: profile.weight,
    status: profile.status,
    proxy: profile.proxy,
    tags: profile.tags.join(';'),
    lastAssignedAt: profile.lastAssignedAt
  }))

  const csv = [
    'Alias,ProfileID,Group,Weight,Status,Proxy,Tags,LastAssignedAt',
    ...data.map(row => Object.values(row).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'profiles.csv'
  a.click()
  URL.revokeObjectURL(url)

  uiStore.addToast({
    type: 'success',
    title: 'Export Successful',
    message: 'Profiles exported to CSV file'
  })
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadProfiles()
})
</script>