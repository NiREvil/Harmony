import { defineConfig } from 'vitepress'
import footnote from 'markdown-it-footnote'
import mathjax3 from 'markdown-it-mathjax3'
import attrs from 'markdown-it-attrs'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'
import { InlineLinkPreviewElementTransform } from '@nolebase/vitepress-plugin-inline-link-preview/markdown-it'
import { withMermaid } from 'vitepress-plugin-mermaid'

const base = '/Harmony/'
const siteUrl = `https://NiREvil.github.io${base}`

export default withMermaid(defineConfig({
  base: base,
  cleanUrls: true,
  ignoreDeadLinks: true,
  title: 'Harmony',
  description: 'Documentation for Harmony Project',

  head: [
    ['link', { rel: 'icon', href: `${base}favicon.ico` }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' }],
    [
      'link',
      {
        href: 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&family=Inter:wght@100..900&display=swap',
        rel: 'stylesheet',
      },
    ],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    [
      'link',
      { rel: 'stylesheet', href: 'https://unpkg.com/video.js@8.17.4/dist/video-js.min.css' },
    ],
    ['script', { src: 'https://unpkg.com/video.js@8.17.4/dist/video.min.js' }],
    [
      'style',
      {},
      `:root { --vp-font-family-base: 'Inter', 'Vazirmatn', sans-serif; } .video-js { width: 100%; max-width: 960px; height: auto; aspect-ratio: 16/9; }`,
    ],
  ],

  markdown: {
    config: (md) => {
      md.use(footnote)
      md.use(attrs)
      md.use(mathjax3)
      md.use(tabsMarkdownPlugin)
      md.use(InlineLinkPreviewElementTransform, {
        tag: 'NolebaseInlineLinkPreview',
      })
    },
    lineNumbers: true,
  },

  mermaid: {
    theme: 'default',
  },

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '🏠 Home', link: '/' },
      { text: '📖 Docs', link: '/en/1-overview' },
      { text: '⚡ Quick Start', link: '/en/2-quick-start' },
      {
        text: '🔗 Resources',
        items: [
          { text: 'GitHub Repository', link: 'https://github.com/NiREvil/Harmony' },
          { text: 'Telegram Channel', link: 'https://t.me/F_NiREvil/6448' },
        ],
      },
    ],

    search: { provider: 'local' },

    docFooter: { prev: 'Previous page', next: 'Next page' },

    lastUpdated: {
      text: 'Last updated',
      formatOptions: { dateStyle: 'medium', timeStyle: 'short' },
    },

    editLink: {
      pattern: 'https://github.com/NiREvil/Harmony/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/NiREvil/Harmony' },
      { icon: 'telegram', link: 'https://t.me/F_NiREvil/6448' },
    ],

    footer: {
      copyright: '© 2026 NiREvil — Freedom to Dream',
      message: '',
    },

    returnToTopLabel: 'Back to top',
    sidebarMenuLabel: 'Menu',
    darkModeSwitchLabel: 'Theme',
  },

  locales: {
    en: {
      label: 'English',
      lang: 'en-US',
      dir: 'ltr',
      themeConfig: {
        outline: { level: [2, 3], label: 'On this page' },

        sidebar: {
          '/en/': [
            {
              text: '🧭 Get Started',
              collapsed: false,
              items: [
                { text: 'Overview', link: '/en/1-overview' },
                { text: 'Quick Start', link: '/en/2-quick-start' },
                { text: 'Deploy to Cloudflare Workers', link: '/en/3-deploy-to-cloudflare-workers' },
                { text: 'Architecture Overview', link: '/en/4-architecture-overview' },
              ],
            },
            {
              text: '⚙️ Configuration',
              collapsed: false,
              items: [
                { text: 'VLESS Configuration Groups', link: '/en/5-vless-configuration-groups' },
                { text: 'UUID and Hostname Setup', link: '/en/6-uuid-and-hostname-setup' },
                { text: 'Ports and ALPN Settings', link: '/en/7-ports-and-alpn-settings' },
              ],
            },
            {
              text: '🌐 IP Data Pipeline',
              collapsed: false,
              items: [
                { text: 'IP Data Sources', link: '/en/8-ip-data-sources' },
                { text: 'Static IP Fallback Strategy', link: '/en/9-static-ip-fallback-strategy' },
                { text: 'Dynamic IP Fetching Pipeline', link: '/en/10-dynamic-ip-fetching-pipeline' },
              ],
            },
            {
              text: '📦 Output & Delivery',
              collapsed: false,
              items: [
                { text: 'VLESS Link Builder', link: '/en/11-vless-link-builder' },
                { text: 'Base64 Subscription Output', link: '/en/12-base64-subscription-output' },
                { text: 'Fake Subscription Info Headers', link: '/en/13-fake-subscription-info-headers' },
              ],
            },
            {
              text: '🛡️ Anti-Detection Techniques',
              collapsed: false,
              items: [
                { text: 'SNI Case Randomization', link: '/en/14-sni-case-randomization' },
                { text: 'Path Obfuscation', link: '/en/15-path-obfuscation' },
                { text: 'Fingerprint and Early Data', link: '/en/16-fingerprint-and-early-data' },
              ],
            },
            {
              text: '📚 Reference',
              collapsed: false,
              items: [
                { text: 'cf-clean.json Reference', link: '/en/17-cf-clean-json-reference' },
              ],
            },
          ],
        },
      },
    },
  },

  vite: {
    optimizeDeps: {
      exclude: [
        'video.js',
        '@nolebase/vitepress-plugin-inline-link-preview/client',
      ],
    },
    ssr: {
      noExternal: [
        /@nolebase\/vitepress-plugin-.*/,
        '@nolebase/ui',
      ],
    },
  },
}))
