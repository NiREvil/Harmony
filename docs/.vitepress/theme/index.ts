import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import { useRoute } from 'vitepress';
import './styles.css';
import './vars.css';
import 'viewerjs/dist/viewer.min.css';
import '@nolebase/vitepress-plugin-inline-link-preview/client/style.css';
import './custom.css';
import Ltr from './components/Ltr.vue';
import imageViewer from 'vitepress-plugin-image-viewer';
import vImageViewer from 'vitepress-plugin-image-viewer/lib/vImageViewer.vue';
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client';
import { NolebaseInlineLinkPreview } from '@nolebase/vitepress-plugin-inline-link-preview/client';
export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp?.(ctx);

    ctx.app.component('vImageViewer', vImageViewer);
    enhanceAppWithTabs(ctx.app);
    ctx.app.component('NolebaseInlineLinkPreview', NolebaseInlineLinkPreview);
    ctx.app.component('CitationLink', CitationLink);
    ctx.app.component('Ltr', Ltr);
  },
  setup() {
    const route = useRoute();
    imageViewer(route);
  }
} satisfies Theme;
