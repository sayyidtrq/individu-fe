<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <Navbar />
    <RouterView />
  </div>
</template>

<style>
@import './assets/base.css';
</style>


