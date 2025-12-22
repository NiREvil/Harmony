<template>
  <a :href="url" class="citation-link">
    <img :src="faviconUrl" alt="favicon" class="favicon-icon" />
    {{ label || 'منبع' }}
  </a>
</template>

<script setup>
const props = defineProps({
  url: String,
  label: String
})

const faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(props.url).hostname}`
</script>

<style>
.citation-link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: blue;
}
.favicon-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}
</style>
