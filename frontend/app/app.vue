<template>
  <v-app>
    <AppHeader />
    <v-main class="bg-background">
      <NuxtPage />
      <AppFooter />
    </v-main>
    <CartDrawer />

    <v-snackbar v-model="notice.show" :color="notice.color" :timeout="3000" location="top right">
      {{ notice.text }}
      <template #actions>
        <v-btn variant="text" icon="mdi-close" @click="notice.show = false" />
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
const { notice } = useNotify()
</script>
