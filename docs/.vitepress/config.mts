import { defineConfig } from 'vitepress';
import footnote from 'markdown-it-footnote';
import mathjax3 from 'markdown-it-mathjax3';
import attrs from 'markdown-it-attrs';
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs';
import { InlineLinkPreviewElementTransform } from '@nolebase/vitepress-plugin-inline-link-preview/markdown-it';

const base = '/Harmony/';
const siteUrl = `https://NiREvil.github.io${base}`;

export default defineConfig({
  base: base,
  cleanUrls: true,
  ignoreDeadLinks: true,
  title: "Documents",
  description: "Documentation for Harmony Project",

  head: [
    ['link', { rel: 'icon', href: `${base}favicon.ico` }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' }],
    [
      'link',
      {
        href: 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&display=swap',
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
      `
      :root { --vp-font-family-base: 'Vazirmatn', sans-serif; }
      .video-js {
        width: 100%;
        max-width: 960px;
        height: auto;
        aspect-ratio: 16/9;
      }
    `,
    ],
  ],

  markdown: {
  config: (md) => {
    md.use(footnote);
    md.use(attrs);
    md.use(mathjax3);
    md.use(tabsMarkdownPlugin);
    md.use(InlineLinkPreviewElementTransform, {
      tag: 'NolebaseInlineLinkPreview'
    });
  },
  lineNumbers: true,
},

  mermaid: {
    theme: 'default'
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      dir: 'ltr',
      themeConfig: {
        logo: '/logo.svg',
        nav: [
          { text: '🏠 Home', link: '/' },
          { text: '📚 Overview', link: '/1/overview' },
          { text: '🧠 Deep Dive', link: '/2/harmony_configuration_system' },
        ],
        sidebar: {
          '/1/': [
            {
              text: 'Get Started',
              items: [
                { text: 'Overview', link: '/1/overview' },
                { text: 'Quick Start', link: '/1/quick_start' },
                { text: 'Understanding VLESS Basics', link: '/1/understanding_vless_protocol_basics' },
                { text: 'Cloudflare Workers Setup', link: '/1/cloudflare_workers_setup_guide' },
              ]
            }
          ],
          '/2/': [
            {
              text: 'Deep Dive',
              collapsed: false,
              items: [
                { text: 'Configuration System', link: '/2/harmony_configuration_system' },
                { text: 'IP Management', link: '/2/ip_management_and_clean_ip_sources' },
                { text: 'WebSocket Proxy', link: '/2/websocket_proxy_implementation' },
                { text: 'Stream Processing', link: '/2/stream_processing_and_header_handling' },
              ],
            },
            {
              text: 'Network & Security',
              collapsed: true,
              items: [
                { text: 'TCP-UDP Handling', link: '/2/tcp_udp_proxy_handling' },
                { text: 'DNS Resolution', link: '/2/dns_resolution_and_query_processing' },
                { text: 'UUID Validation', link: '/2/uuid_validation_and_user_management' }, // اصلاح غلط تایپی
                { text: 'Scamalytics', link: '/2/scamalytics_integration' },
              ],
            },
            {
              text: 'Persian Resources',
              collapsed: true,
              items: [
                { text: 'توضیحات فارسی', link: '/2/persian' },
                { text: 'Troubleshoot', link: '/2/troubleshoot' },
              ],
            },
          ],
        },
        
        search: { provider: 'local' },
        
        docFooter: { prev: 'Previous page', next: 'Next page' },
        
        lastUpdated: {
          text: 'Last updated',
          formatOptions: { dateStyle: 'medium', timeStyle: 'short' },
        },
        
        editLink: {
          pattern: 'https://github.com/NiREvil/Harmony/edit/main/docs/:path', // اصلاح مسیر گیت‌هاب بر اساس یوزرنیم شما
          text: 'Edit this page on GitHub',
        },
        
        socialLinks: [
          { icon: 'github', link: 'https://github.com/NiREvil/Harmony' },
          { icon: 'telegram', link: 'https://t.me/F_NiREvil/6448' },
        ],
        
        footer: {
          copyright: '© 2026 REvil — All Rights Reserved.',
          message: '',
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
});
