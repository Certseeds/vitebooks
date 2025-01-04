import { defineConfig } from 'vitepress'
import mdFootnote from "markdown-it-footnote"

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "vitebooks",
    description: "Vite Books Collection",
    srcExclude: [
        "README.md",
        "LICENSE_AGPL_V3_0.md"
    ],
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: 'Home', link: '/' }
            , { text: "无所畏惧", link: '/无所畏惧/meta' }
            , { text: "法洛斯", link: '/法洛斯/meta' }
            , { text: "warhammer40k-元数据", link: '/warhammer40k/primarchs' }
            , { text: "dep-page", link: "/depage/index.html", target: '_blank' }
        ],
        sidebar: [
            {
                text: '荷鲁斯之乱',
                items: [
                    { text: "深渊之战", link: '/深渊之战/meta' }
                    , { text: "异端传说", link: '/异端传说/meta' }
                    , { text: "黑暗时代", link: '/黑暗时代/meta' }
                    , { text: "无所畏惧", link: '/无所畏惧/meta' }
                    , { text: "原体", link: '/原体/meta' }
                    , { text: "惧于踏足", link: '/惧于踏足/meta' }
                    , { text: "背叛之影", link: '/背叛之影/meta' }
                    , { text: "不被铭记的帝国", link: '/不被铭记的帝国/meta' }
                    , { text: "复仇之魂", link: '/复仇之魂/meta' }
                    , { text: "背叛之遗", link: '/背叛之遗/meta' }
                    , { text: "无尽的战争", link: '/无尽的战争/meta' }
                    , { text: "法洛斯", link: '/法洛斯/meta' }
                    , { text: "泰拉之眼", link: '/泰拉之眼/meta' }
                    , { text: "忠诚的负担", link: '/忠诚的负担/meta' }
                    , { text: "epub总集", link: '/warhammer40k/epub' }
                    , { text: "well-done", link: '/welldone/README' }
                ]
            },
            {
                text: '元数据',
                items: [
                    { text: "warhammer40k-元数据", link: '/warhammer40k/primarchs' }
                    ,
                ]
            }
        ],
        socialLinks: [
            { icon: 'github', link: 'https://github.com/Certseeds/vitebooks' }
        ],
        footer: {
            copyright: `2024-${new Date().getFullYear()} Certseeds`
        },
        lastUpdated: {
            formatOptions: {
                era: "short",
                year: "numeric",
                month: "long",
                weekday: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: false,
                timeZone: "UTC",
                timeZoneName: "longGeneric",
                fractionalSecondDigits: 3,
                formatMatcher: "basic",
            },
        },
    },
    head: [
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:locale', content: 'zh-CN' }],
        ['meta', { property: 'og:title', content: 'ViteBooks | VitePress Powered Static Book Site' }],
        ['meta', { property: 'og:site_name', content: 'ViteBooks' }],
        ['meta', { property: 'og:image', content: 'https://vitebooks.certseeds.com/favicon.ico' }],
        ['meta', { property: 'og:url', content: 'https://vitebooks.certseeds.com' }],
        ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
        ['meta', { property: 'twitter:title', content: 'ViteBooks | VitePress Powered Static Book Site' }],
        ['meta', { property: 'twitter:image', content: 'https://vitebooks.certseeds.com/favicon.ico' }],
        ['meta', { property: 'twitter:description', content: 'warhammer cn translation collect and reformat' }],
        ['meta', { property: 'keywords', content: 'vitepress, warhammer, nodejs, llm' }],
        ['meta', { property: 'robots', content: 'index, follow' }],
        ['meta', { property: 'author', content: 'Certseeds' }],
    ],
    markdown: {
        config: (md) => {
            md.use(mdFootnote)
        },
    },
    sitemap: {
        hostname: 'https://vitebooks.certseeds.com'
    },
    lastUpdated: true,
    metaChunk: true
})
