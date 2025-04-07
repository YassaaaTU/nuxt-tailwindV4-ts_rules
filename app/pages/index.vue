<template>
  <div class="flex flex-col gap-4 items-center justify-center min-h-screen py-2 bg-base-100">
    <h1 class="text-4xl font-bold text-base-content">
      Hello World
    </h1>
    <p class="mt-4 text-lg text-base-content/75">
      Welcome to your Nuxt 3 application!
    </p>
    <button
      class="btn btn-primary btn-wide"
      @click="themeStore.toggleTheme()"
    >
      Toggle Theme
    </button>
  </div>
</template>

<script setup lang="ts">
const themeStore = useThemeStore()
</script>
