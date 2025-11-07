<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const navItems = [
  { name: 'Home', path: '/', icon: '' },
  { name: 'Insurance Plan', path: '/insurance-plan', icon: '' },
  { name: 'Policy', path: '/policy', icon: '' },
  { name: 'Claim', path: '/claim', icon: '' },
  { name: 'Statistics', path: '/statistics', icon: '' }
]

const isActive = (path: string) => {
  return route.path === path
}
</script>

<template>
  <nav class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center space-x-2">
          <span class="text-2xl font-bold text-blue-600">Insurance</span>
        </RouterLink>

        <!-- Navigation Links -->
        <div class="hidden md:flex space-x-1">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              isActive(item.path)
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
            ]"
          >
            <span class="mr-2">{{ item.icon }}</span>
            {{ item.name }}
          </RouterLink>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden">
          <button
            type="button"
            class="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2"
          >
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>
