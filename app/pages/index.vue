<template>
  <div class="page">
    <div class="header">
      <h1 class="title">전기 심볼 제작 프로젝트</h1>
      <p class="subtitle">JointJS+를 사용한 벡터 그래픽 에디터</p>
    </div>

    <div class="content">
      <div class="card-grid">
        <!-- 벡터 에디터 카드 -->
        <NuxtLink to="/vector-editor" class="card card-featured">
          <div class="card-icon">✏️</div>
          <h2 class="card-title">벡터 그래픽 에디터</h2>
          <p class="card-description">
            선, 사각형, 원, 삼각형 등을 그릴 수 있는 벡터 그래픽 에디터입니다.
          </p>
          <span class="badge">START HERE</span>
        </NuxtLink>

        <!-- 가이드 문서 카드 -->
        <a href="/SYMBOL_CREATION_GUIDE.md" target="_blank" class="card">
          <div class="card-icon">📚</div>
          <h2 class="card-title">심볼 제작 가이드</h2>
          <p class="card-description">
            SVG 기반 벡터 그래픽 제작 범용 가이드입니다.
          </p>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Electric Symbols - 전기 심볼 제작',
  meta: [
    {
      name: 'description',
      content: 'JointJS+를 사용한 전기 회로도 심볼 개발 프로젝트'
    }
  ]
})
</script>

<style scoped>
.page {
  @apply min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100;
}

.header {
  @apply bg-white shadow-sm p-8 text-center;
}

.title {
  @apply text-4xl font-bold text-gray-800 mb-2;
}

.subtitle {
  @apply text-lg text-gray-600;
}

.content {
  @apply max-w-4xl mx-auto p-8;
}

.card-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.card {
  @apply bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer hover:scale-105 relative;
}

.card-featured {
  @apply ring-2 ring-blue-500;
}

.card-icon {
  @apply text-5xl mb-4;
}

.card-title {
  @apply text-xl font-bold text-gray-800 mb-2;
}

.card-description {
  @apply text-gray-600 text-sm;
}

.badge {
  @apply absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded;
}
</style>
