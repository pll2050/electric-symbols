<template>
  <div class="page">
    <div class="header">
      <NuxtLink to="/" class="btn-back">← 뒤로가기</NuxtLink>
      <h1 class="title">벡터 그래픽 에디터</h1>
    </div>

    <div class="content">
      <VectorEditor />
    </div>
  </div>
</template>

<script setup lang="ts">
import VectorEditor from '~/components/VectorEditor.vue'

useHead({
  title: '벡터 그래픽 에디터 - Electric Symbols'
})
</script>

<style scoped>
.page {
  @apply flex flex-col h-screen;
}

.header {
  @apply bg-white border-b border-gray-200 p-4 flex items-center gap-4 shadow-sm;
}

.btn-back {
  @apply px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition;
}

.title {
  @apply text-2xl font-bold text-gray-800;
}

.content {
  @apply flex-1 overflow-hidden;
}
</style>
