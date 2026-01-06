import { createContentLoader } from 'vitepress'

const base = '/Harmony/';
const EXCERPT_MAX_LENGTH = 120;
const MAX_TOTAL_POSTS = 10;

function stripHtmlAndTruncate(html, maxLength) {
  if (!html) return '';
  let text = html
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&ZeroWidthSpace;|&nbsp;/gi, ' ')
    .replace(/\s\s+/g, ' ')
    .trim();
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function formatDate(raw) {
  const date = raw ? new Date(raw) : new Date();
  if (isNaN(date.getTime())) return { time: 0, string: 'N/A' };

  return {
    time: +date,
    string: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
}

function categorizePost(url) {
  if (url.includes('/1/')) return { title: 'Get Started', icon: '📚' };
  if (url.includes('/2/')) return { title: 'Deep Dive', icon: '🧠' };
  return { title: 'Doc', icon: '📄' };
}

export default createContentLoader(
  ['1/*.md', '2/*.md'],
  {
    excerpt: true,
    transform(raw) {
      return raw
        .filter(({ frontmatter, url }) => 
          frontmatter.title && 
          !url.includes('index.md')
        )
        .map((page) => {
          const categoryInfo = categorizePost(page.url);
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
            author: page.frontmatter.author || 'REvil',
          };
        })
        .sort((a, b) => b.date.time - a.date.time)
        .slice(0, MAX_TOTAL_POSTS);
    },
  }
)
