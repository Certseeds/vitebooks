import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "vitebooks",
  description: "Vite Books Collection",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
      { text: "无所畏惧", link: '/无所畏惧'}
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: "无所畏惧", link: '/无所畏惧'}
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Certseeds/vitebooks' }
    ]
  }
})
