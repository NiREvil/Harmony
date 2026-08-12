---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Harmony"
  text: "VLESS Proxy Subscription Generator"
  tagline: "A single-file Cloudflare Worker that automatically injects clean IPs into your VLESS configurations. Zero dependencies, 30+ configs per update, 3-second timeout guarantee."
  actions:
    - theme: brand
      text: Get Started
      link: /en/1-overview
    - theme: alt
      text: View on GitHub
      link: https://github.com/NiREvil/Harmony

features:
  - icon: 🛡️
    title: Anti-Detection Features
    details: "SNI case randomization, path obfuscation with /random:N directive, Chrome TLS fingerprint, and Early Data optimization to bypass DPI filters."
  - icon: 🌐
    title: Multi-Source IP Pipeline
    details: "Fetches clean Cloudflare IPs from three independent sources (GitHub repo, Strawberry API, and static fallback) with automatic failover and deduplication."
  - icon: ⚡
    title: Edge-Deployed Performance
    details: "Runs entirely on Cloudflare Workers edge network with zero cold starts, 3-second fetch timeout, and per-request IP freshness for maximum reliability."
  - icon: 📦
    title: Universal Client Support
    details: "Generates Base64-encoded subscriptions compatible with v2rayN, NekoBox, Clash Meta, Streisand, sing-box, Xray-core, and all major VLESS clients."
---

<script setup>
import { data as posts } from './.vitepress/posts.data.js'
</script>

<div class="latest-posts-section" v-if="posts && posts.length > 0">
  <h2 class="section-title">Latest Documentation</h2>
  <div class="posts-grid">
    <article v-for="post of posts" :key="post.url" class="post-card">
      <div class="post-category">
        <span class="category-icon">{{ post.categoryIcon }}</span>
        <span class="category-text">{{ post.category }}</span>
      </div>
      <div class="post-content">
        <h3 class="post-title">
          <a :href="post.url" class="post-link">{{ post.title }}</a>
        </h3>
        <p class="post-date">
          <span class="date-icon">📅</span>
          {{ post.date.string }}
        </p>
        <p class="post-excerpt" v-if="post.excerpt">{{ post.excerpt }}</p>
        <div class="post-actions">
          <a :href="post.url" class="read-more">Read More →</a>
        </div>
      </div>
    </article>
  </div>
</div>

<style scoped>
.latest-posts-section {
  max-width: 1152px;
  margin: 4rem auto 0;
  padding: 0 24px;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 2.5rem;
  text-align: center;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  border-radius: 2px;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 2.5rem;
}

.post-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  flex-direction: column;
}

.post-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  border-color: var(--vp-c-brand-1);
}

.post-card:hover::before {
  transform: scaleX(1);
}

.post-category {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-icon {
  font-size: 1rem;
}

.post-content {
  padding: 1rem 1.5rem 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.15rem;
  font-weight: 600;
  line-height: 1.4;
}

.post-link {
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: color 0.3s ease;
}

.post-link:hover {
  color: var(--vp-c-brand-1);
}

.post-date {
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.date-icon {
  font-size: 0.9rem;
}

.post-excerpt {
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0 0 1.25rem 0;
  font-size: 0.9rem;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}

.read-more {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.85rem;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.read-more:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
}

@media (max-width: 768px) {
  .latest-posts-section {
    padding: 0 16px;
  }

  .posts-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .post-content {
    padding: 1rem 1.25rem 1.25rem;
  }

  .section-title {
    font-size: 1.6rem;
  }
}

/* VitePress dark mode */
html.dark .post-card {
  background: var(--vp-c-bg-alt);
}

html.dark .post-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}
</style>
