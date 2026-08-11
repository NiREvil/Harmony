import { createContentLoader } from 'vitepress'

const base = '/Harmony/'
const EXCERPT_MAX_LENGTH = 120
const MAX_TOTAL_POSTS = 10

function stripHtmlAndTruncate(html, maxLength) {
  if (!html) return ''
  let text = html
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/\u200B|\u00A0/gi, ' ')
    .replace(/\s\s+/g, ' ')
    .trim()
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

function formatDate(raw) {
  const date = raw ? new Date(raw) : new Date()
  if (isNaN(date.getTime())) return { time: 0, string: 'N/A' }
  return {
    time: +date,
    string: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }
}

function categorizePost(url) {
  const n = parseInt(url.match(/\/en\/(\d+)-/)?.[1] ?? '0', 10)
  if (n >= 1 && n <= 4) return { title: 'Get Started', icon: '🧭' }
  if (n >= 5 && n <= 7) return { title: 'Configuration', icon: '⚙️' }
  if (n >= 8 && n <= 10) return { title: 'IP Data Pipeline', icon: '🌐' }
  if (n >= 11 && n <= 13) return { title: 'Output & Delivery', icon: '📦' }
  if (n >= 14 && n <= 16) return { title: 'Anti-Detection', icon: '🛡️' }
  if (n === 17) return { title: 'Reference', icon: '📚' }
  return { title: 'Doc', icon: '📄' }
}

export default createContentLoader(
  ['en/**/*.md'],
  {
    excerpt: true,
    transform(raw) {
      return raw
        .filter(({ frontmatter, url }) => frontmatter.title && !url.includes('index.md'))
        .map((page) => {
          const categoryInfo = categorizePost(page.url)
          return {
            title: page.frontmatter.title,
            url: `${base}${page.url.replace(/^\//, '')}`.replace(/\.md$/, '.html'),
            excerpt: stripHtmlAndTruncate(
              page.frontmatter.description || page.excerpt,
              EXCERPT_MAX_LENGTH
            ),
            date: formatDate(page.frontmatter.date || page.frontmatter.lastUpdated),
            category: categoryInfo.title,
            categoryIcon: categoryInfo.icon,
            author: page.frontmatter.author || 'NiREvil',
          }
        })
        .sort((a, b) => b.date.time - a.date.time)
        .slice(0, MAX_TOTAL_POSTS)
    },
  }
)
