<template>
  <v-container class="py-8">
    <!-- ADMIN LOGIN: ikaw lang (may password) ang makakapag-edit ng products -->
    <ClientOnly>
      <div v-if="authChecked && !isAdmin" class="login-wrap">
        <v-card border elevation="0" class="pa-6 login-card">
          <div class="d-flex align-center ga-3 mb-2">
            <AppLogo :size="30" />
            <h1 class="text-h5">Admin login</h1>
          </div>
          <p class="text-body-2 text-medium-emphasis mb-5">Enter the admin password to manage products.</p>
          <v-form @submit.prevent="login">
            <v-text-field
              v-model="password" label="Password" :type="showPw ? 'text' : 'password'" autocomplete="current-password"
              :append-inner-icon="showPw ? 'mdi-eye-off-outline' : 'mdi-eye-outline'" @click:append-inner="showPw = !showPw"
              :error-messages="loginError" autofocus
            />
            <v-btn type="submit" color="primary" size="large" block :loading="loggingIn" class="mt-2">Log in</v-btn>
          </v-form>
          <v-btn variant="text" block to="/" class="mt-3">Back to store</v-btn>
        </v-card>
      </div>
    </ClientOnly>

    <template v-if="isAdmin">
    <div class="d-flex flex-wrap align-center ga-3 mb-6">
      <div class="mr-auto">
        <h1 class="text-h5 font-weight-bold">Product Management</h1>
        <p class="text-body-2 text-medium-emphasis">Add, edit, and remove products in the Strapi catalog.</p>
      </div>
      <v-btn variant="outlined" to="/" prepend-icon="mdi-storefront-outline">Go to store</v-btn>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Add product</v-btn>
      <v-btn variant="text" prepend-icon="mdi-logout" @click="logout">Log out</v-btn>
    </div>

    <v-card rounded="xl" border elevation="0">
      <v-card-text>
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" placeholder="Search products"
                      clearable hide-details style="max-width: 360px" />
      </v-card-text>

      <v-alert v-if="error" type="error" variant="tonal" class="mx-4 mb-4">
        {{ errorMessage(error) }}
      </v-alert>

      <v-data-table
        :headers="headers" :items="products" :search="search" :loading="pending"
        item-value="documentId" items-per-page="10" no-data-text="No products yet. Add your first product."
      >
        <template #item.image="{ item }">
          <v-avatar rounded="lg" size="48" color="grey-lighten-3" class="my-2">
            <v-img v-if="mediaUrl(item.image)" :src="mediaUrl(item.image)" cover />
            <v-icon v-else icon="mdi-image-off-outline" color="grey" />
          </v-avatar>
        </template>
        <template #item.price="{ item }">{{ formatPrice(item.price) }}</template>
        <template #item.stock="{ item }">
          <span :class="item.stock <= 0 ? 'text-error font-weight-bold' : ''">{{ item.stock }}</span>
        </template>
        <template #item.isActive="{ item }">
          <v-chip :color="item.isActive ? 'success' : 'grey'" size="small" variant="tonal">
            {{ item.isActive ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <div class="d-flex justify-end">
            <v-btn icon="mdi-eye-outline" size="small" variant="text" aria-label="View" @click="openView(item)" />
            <v-btn icon="mdi-pencil-outline" size="small" variant="text" color="primary" aria-label="Edit" @click="openEdit(item)" />
            <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" aria-label="Delete" @click="askDelete(item)" />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- CREATE / EDIT DIALOG -->
    <v-dialog v-model="formDialog" max-width="620" scrollable>
      <v-card rounded="xl">
        <v-card-title class="font-weight-bold pt-5 px-6">{{ editingId ? 'Edit product' : 'Add product' }}</v-card-title>
        <v-card-text class="px-6">
          <v-form ref="formRef" @submit.prevent="save">
            <v-text-field v-model="form.name" label="Product name" :rules="[rules.required]" class="mb-2" />
            <v-textarea v-model="form.description" label="Description" rows="3" auto-grow class="mb-2" />
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field v-model.number="form.price" label="Price (₱)" type="number" min="0" step="0.01"
                              :rules="[rules.required, rules.nonNegative]" />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model.number="form.stock" label="Stock" type="number" min="0"
                              :rules="[rules.required, rules.wholeNumber]" />
              </v-col>
            </v-row>
            <v-combobox v-model="form.category" :items="categoryOptions" label="Category"
                        :rules="[rules.required]" class="mb-2" />
            <v-switch v-model="form.isActive" color="success" inset
                      :label="form.isActive ? 'Active (shown in store)' : 'Inactive (hidden from store)'" />
            <v-file-input v-model="file" label="Product image" accept="image/*" prepend-icon=""
                          prepend-inner-icon="mdi-camera-outline" show-size />
            <v-img v-if="previewUrl" :src="previewUrl" max-height="180" class="rounded-lg mt-2" />
          </v-form>
        </v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" @click="formDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="save">
            {{ editingId ? 'Save changes' : 'Add product' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- VIEW DIALOG -->
    <v-dialog v-model="viewDialog" max-width="520">
      <v-card v-if="viewing" rounded="xl">
        <v-img v-if="mediaUrl(viewing.image)" :src="mediaUrl(viewing.image)" height="240" cover />
        <v-card-item>
          <v-chip size="small" color="primary" variant="tonal" class="mb-2">{{ viewing.category }}</v-chip>
          <v-card-title class="pa-0 font-weight-bold">{{ viewing.name }}</v-card-title>
        </v-card-item>
        <v-card-text>
          <p class="mb-4">{{ viewing.description || 'No description.' }}</p>
          <div class="d-flex justify-space-between"><span>Price</span><b>{{ formatPrice(viewing.price) }}</b></div>
          <div class="d-flex justify-space-between"><span>Stock</span><b>{{ viewing.stock }}</b></div>
          <div class="d-flex justify-space-between"><span>Status</span><b>{{ viewing.isActive ? 'Active' : 'Inactive' }}</b></div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="viewDialog = false">Close</v-btn>
          <v-btn color="primary" @click="viewDialog = false; openEdit(viewing!)">Edit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DELETE CONFIRM -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card rounded="xl">
        <v-card-title class="font-weight-bold pt-5 px-6">Delete product?</v-card-title>
        <v-card-text class="px-6">“{{ toDelete?.name }}” will be removed permanently.</v-card-text>
        <v-card-actions class="px-6 pb-5">
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import type { Product, ProductInput } from '~/types'

const { getAllProducts, createProduct, updateProduct, deleteProduct, uploadImage, mediaUrl, errorMessage } = useStrapi()
const { notify } = useNotify()

// ---------- ADMIN AUTH ----------
const isAdmin = ref(false)
const authChecked = ref(false)
const password = ref('')
const showPw = ref(false)
const loginError = ref('')
const loggingIn = ref(false)

onMounted(async () => {
  try {
    const me = await $fetch<{ admin: boolean }>('/api/auth/me')
    isAdmin.value = me.admin
  } catch {
    isAdmin.value = false
  } finally {
    authChecked.value = true
  }
})

async function login() {
  loginError.value = ''
  loggingIn.value = true
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { password: password.value } })
    isAdmin.value = true
    password.value = ''
    await refresh()
  } catch (err) {
    loginError.value = errorMessage(err)
  } finally {
    loggingIn.value = false
  }
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  isAdmin.value = false
}

const { data, pending, error, refresh } = await useAsyncData('admin-products', () => getAllProducts())
const products = computed(() => data.value?.data ?? [])

const search = ref('')
const headers = [
  { title: 'Image', key: 'image', sortable: false },
  { title: 'Name', key: 'name' },
  { title: 'Category', key: 'category' },
  { title: 'Price', key: 'price', align: 'end' as const },
  { title: 'Stock', key: 'stock', align: 'end' as const },
  { title: 'Status', key: 'isActive' },
  { title: '', key: 'actions', sortable: false, align: 'end' as const }
]

const defaultCategories = ['Beverages', 'Snacks', 'Personal Care', 'Household', 'Electronics', 'Apparel']
const categoryOptions = computed(() =>
  [...new Set([...defaultCategories, ...products.value.map((p) => p.category)])].filter(Boolean).sort()
)

const rules = {
  required: (v: any) => (v !== null && v !== undefined && String(v).trim() !== '') || 'Required.',
  nonNegative: (v: any) => Number(v) >= 0 || 'Must be 0 or more.',
  wholeNumber: (v: any) => (Number.isInteger(Number(v)) && Number(v) >= 0) || 'Must be a whole number, 0 or more.'
}

// ---------- CREATE / EDIT ----------
const formDialog = ref(false)
const formRef = ref()
const saving = ref(false)
const editingId = ref<string | null>(null)
const emptyForm = () => ({ name: '', description: '', price: 0, stock: 0, category: '', isActive: true, imageId: null as number | null, imageUrl: '' })
const form = reactive(emptyForm())
const file = ref<File | File[] | null>(null)

const selectedFile = computed(() => (Array.isArray(file.value) ? file.value[0] : file.value) || null)
const previewUrl = computed(() => (selectedFile.value ? URL.createObjectURL(selectedFile.value) : form.imageUrl))

function openCreate() {
  editingId.value = null
  Object.assign(form, emptyForm())
  file.value = null
  formDialog.value = true
}

function openEdit(p: Product) {
  editingId.value = p.documentId
  Object.assign(form, {
    name: p.name, description: p.description || '', price: Number(p.price), stock: p.stock,
    category: p.category, isActive: p.isActive, imageId: p.image?.id ?? null, imageUrl: mediaUrl(p.image)
  })
  file.value = null
  formDialog.value = true
}

async function save() {
  const { valid } = await formRef.value.validate()
  if (!valid) return
  saving.value = true
  try {
    // Kung may bagong image, i-upload muna para makuha ang media id
    let imageId = form.imageId
    if (selectedFile.value) imageId = await uploadImage(selectedFile.value)

    const payload: ProductInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      category: String(form.category).trim(),
      isActive: form.isActive,
      image: imageId
    }

    if (editingId.value) {
      await updateProduct(editingId.value, payload)
      notify('Product updated.')
    } else {
      await createProduct(payload)
      notify('Product added.')
    }
    formDialog.value = false
    await refreshNuxtData(['admin-products', 'products'])
  } catch (err: any) {
    if (err?.statusCode === 401) isAdmin.value = false
    notify(errorMessage(err), 'error')
  } finally {
    saving.value = false
  }
}

// ---------- VIEW ----------
const viewDialog = ref(false)
const viewing = ref<Product | null>(null)
function openView(p: Product) {
  viewing.value = p
  viewDialog.value = true
}

// ---------- DELETE ----------
const deleteDialog = ref(false)
const deleting = ref(false)
const toDelete = ref<Product | null>(null)
function askDelete(p: Product) {
  toDelete.value = p
  deleteDialog.value = true
}
async function confirmDelete() {
  if (!toDelete.value) return
  deleting.value = true
  try {
    await deleteProduct(toDelete.value.documentId)
    notify('Product deleted.')
    deleteDialog.value = false
    await refresh()
  } catch (err: any) {
    if (err?.statusCode === 401) isAdmin.value = false
    notify(errorMessage(err), 'error')
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.login-wrap { min-height: 60vh; display: flex; align-items: center; justify-content: center; }
.login-card { width: 100%; max-width: 420px; }
</style>
