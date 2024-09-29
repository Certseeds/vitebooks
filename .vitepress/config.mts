import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "vitebooks",
    description: "Vite Books Collection",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: 'Home', link: '/' },
            { text: "无所畏惧", link: '/无所畏惧/meta.html' }
        ],
        sidebar: [
            {
                text: 'Books',
                items: [
                    { text: "无所畏惧", link: '/无所畏惧/meta.html' }
                ]
            }
        ],
        socialLinks: [
            { icon: 'github', link: 'https://github.com/Certseeds/vitebooks' }
        ],
        search: {
            provider: "local", //启用vitepress本身的搜索
        },
        
    }
})
