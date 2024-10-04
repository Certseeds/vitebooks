import { defineConfig } from 'vitepress'
import mdFootnote from "markdown-it-footnote"

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "vitebooks",
    description: "Vite Books Collection",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: 'Home', link: '/' }
            , { text: "无所畏惧", link: '/无所畏惧/meta' }
            , { text: "不被铭记的帝国", link: '/不被铭记的帝国/meta' }
            , { text: "warhammer40k-元数据", link: '/warhammer40k/primarchs' }

        ],
        sidebar: [
            {
                text: 'Books',
                items: [
                    { text: "无所畏惧", link: '/无所畏惧/meta' }
                    , { text: "不被铭记的帝国", link: '/不被铭记的帝国/meta' }
                    , { text: "warhammer40k-元数据", link: '/warhammer40k/primarchs' }

                ]
            }
        ],
        socialLinks: [
            { icon: 'github', link: 'https://github.com/Certseeds/vitebooks' }
        ],
        search: {
            provider: "local", //启用vitepress本身的搜索
        },
    },
    markdown: {
        config: (md) => {
            md.use(mdFootnote)
        },
    },
    sitemap: {
        hostname: 'https://vitebooks.certseeds.com'
    },
    lastUpdated: true
})
