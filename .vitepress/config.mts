import { defineConfig } from 'vitepress'
import mdFootnote from "markdown-it-footnote"

const hostURL = 'https://vitebooks.certseeds.com'

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
            , { text: "epub总集", link: '/warhammer40k/epub' }
            , { text: "warhammer40k-元数据", link: '/warhammer40k/primarchs' }
            , { text: "dep-page", link: "/depage/index.html", target: '_blank' }
            , { text: "web-cmp-translate", link: "/web-cmp-trans/index.html", target: '_blank' }
        ],
        sidebar: [
            {
                text: '元数据',
                items: [
                    { text: "warhammer40k-元数据", link: '/warhammer40k/primarchs' }
                    , { text: "本站非官方, 不盈利, 纯免费, 严禁商用", link: "warhammer40k/shield" }
                    ,
                ]
            },
            {
                text: '荷鲁斯之乱',
                items: [
                    { text: "福格瑞姆", link: '/福格瑞姆/meta' }
                    , { text: "天使降临", link: '/天使降临/meta' }
                    , { text: "军团", link: '/军团/meta' }
                    , { text: "深渊之战", link: '/深渊之战/meta' }
                    , { text: "机械教", link: '/机械教/meta' }
                    , { text: "异端传说", link: '/异端传说/meta' }
                    , { text: "堕天使", link: '/堕天使/meta' }
                    , { text: "千子", link: '/千子/meta' }
                    , { text: "宿敌", link: '/宿敌/meta' }
                    , { text: "黑暗时代", link: '/黑暗时代/meta' }
                    , { text: "流浪弃儿", link: '/流浪弃儿/meta' }
                    , { text: "失落救赎", link: '/失落救赎/meta' }
                    , { text: "无所畏惧", link: '/无所畏惧/meta' }
                    , { text: "原体", link: '/原体/meta' }
                    , { text: "惧于踏足", link: '/惧于踏足/meta' }
                    , { text: "背叛之影", link: '/背叛之影/meta' }
                    , { text: "背叛者", link: '/背叛者/meta' }
                    , { text: "考斯印记", link: '/考斯印记/meta' }
                    , { text: "不被铭记的帝国", link: '/不被铭记的帝国/meta' }
                    , { text: "复仇之魂", link: '/复仇之魂/meta' }
                    , { text: "背叛之遗", link: '/背叛之遗/meta' }
                    , { text: "无尽的战争", link: '/无尽的战争/meta' }
                    , { text: "法洛斯", link: '/法洛斯/meta' }
                    , { text: "泰拉之眼", link: '/泰拉之眼/meta' }
                    , { text: "无声战争", link: '/无声战争/meta' }
                    , { text: "卡利班天使", link: '/卡利班天使/meta' }
                    , { text: "科拉克斯", link: '/科拉克斯/meta' }
                    , { text: "人类之主", link: '/人类之主/meta' }
                    , { text: "破碎军团", link: '/破碎军团/meta' }
                    , { text: "塔兰", link: '/塔兰/meta' }
                    , { text: "毁灭风暴", link: '/毁灭风暴/meta' }
                    , { text: "忠诚的负担", link: '/忠诚的负担/meta' }
                    , { text: "狼毒", link: '/狼毒/meta' }
                    , { text: "黑暗之奴", link: '/黑暗之奴/meta' }
                    , { text: "围城先驱", link: '/围城先驱/meta' }
                    , { text: "泰坦之死", link: '/泰坦之死/meta' }
                    , { text: "被埋葬的匕首", link: '/被埋葬的匕首/meta' }
                    , { text: "epub总集", link: '/warhammer40k/epub' }
                    , { text: "well-done", link: '/welldone/README' }
                ]
            }
        ],
        socialLinks: [
            { icon: 'github', link: 'https://github.com/Certseeds/vitebooks' }
        ],
        footer: {
            copyright: `2024-${new Date().getFullYear()} Certseeds; this page is licensed under CC BY-NC-SA 4.0; 本站非官方, 不盈利, 纯免费, 严禁商用`
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
        ['meta', { property: 'og:title', content: 'ViteBooks | Static Book Site Powered by VitePress' }],
        ['meta', { property: 'og:site_name', content: 'ViteBooks' }],
        ['meta', { property: 'og:image', content: `${hostURL}/favicon.ico` }],
        ['meta', { property: 'og:url', content: `${hostURL}` }],
        ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
        ['meta', { property: 'twitter:title', content: 'ViteBooks | Static Book Site Powered by VitePress' }],
        ['meta', { property: 'twitter:image', content: `${hostURL}/favicon.ico` }],
        ['meta', { property: 'twitter:description', content: 'warhammer cn translation collect and reformat' }],
        ['meta', { property: 'keywords', content: 'vitepress, warhammer, nodejs, llm' }],
        ['meta', { property: 'robots', content: 'index, follow' }],
        ['meta', { property: 'author', content: 'Certseeds' }],
        ['meta', { property: 'copyleft', content: 'CC BY-NC-SA 4.0' }],
        ['link', { property: 'license', href: "http://creativecommons.org/licenses/by-nc-sa/4.0/" }],

    ],
    markdown: {
        config: (md) => {
            md.use(mdFootnote)
        },
    },
    sitemap: {
        hostname: hostURL
    },
    lastUpdated: true,
    metaChunk: true
})
