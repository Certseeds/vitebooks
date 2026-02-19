// SPDX-FileCopyrightText: 2024-2026 Certseeds
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface SidebarItem {
    text: string;
    link?: string;
    items?: SidebarItem[];
}

export const sidebar: SidebarItem[] = [
    {
        text: '元数据',
        items: [
            { text: 'warhammer40k-元数据', link: '/warhammer40k/primarchs' },
            { text: '本站非官方, 不盈利, 纯免费, 严禁商用', link: '/warhammer40k/shield' },
        ],
    },
    {
        text: '荷鲁斯之乱',
        items: [
            { text: '福格瑞姆', link: '/福格瑞姆/meta' },
            { text: '天使降临', link: '/天使降临/meta' },
            { text: '军团', link: '/军团/meta' },
            { text: '深渊之战', link: '/深渊之战/meta' },
            { text: '机械教', link: '/机械教/meta' },
            { text: '异端传说', link: '/异端传说/meta' },
            { text: '堕天使', link: '/堕天使/meta' },
            { text: '千子', link: '/千子/meta' },
            { text: '宿敌', link: '/宿敌/meta' },
            { text: '黑暗时代', link: '/黑暗时代/meta' },
            { text: '流浪弃儿', link: '/流浪弃儿/meta' },
            { text: '失落救赎', link: '/失落救赎/meta' },
            { text: '无所畏惧', link: '/无所畏惧/meta' },
            { text: '原体', link: '/原体/meta' },
            { text: '惧于踏足', link: '/惧于踏足/meta' },
            { text: '背叛之影', link: '/背叛之影/meta' },
            { text: '灭绝天使', link: '/灭绝天使/meta' },
            { text: '背叛者', link: '/背叛者/meta' },
            { text: '考斯印记', link: '/考斯印记/meta' },
            { text: '伏尔甘永存', link: '/伏尔甘永存/meta' },
            { text: '不被铭记的帝国', link: '/不被铭记的帝国/meta' },
            { text: '复仇之魂', link: '/复仇之魂/meta' },
            { text: '毕索斯的诅咒', link: '/毕索斯的诅咒/meta' },
            { text: '背叛之遗', link: '/背叛之遗/meta' },
            { text: '焚天业火', link: '/焚天业火/meta' },
            { text: '无尽的战争', link: '/无尽的战争/meta' },
            { text: '法洛斯', link: '/法洛斯/meta' },
            { text: '泰拉之眼', link: '/泰拉之眼/meta' },
            { text: '通天之路', link: '/通天之路/meta' },
            { text: '无声战争', link: '/无声战争/meta' },
            { text: '卡利班天使', link: '/卡利班天使/meta' },
            { text: '多恩禁卫', link: '/多恩禁卫/meta' },
            { text: '科拉克斯', link: '/科拉克斯/meta' },
            { text: '人类之主', link: '/人类之主/meta' },
            { text: '伽罗', link: '/伽罗/meta' },
            { text: '破碎军团', link: '/破碎军团/meta' },
            { text: '塔兰', link: '/塔兰/meta' },
            { text: '毁灭风暴', link: '/毁灭风暴/meta' },
            { text: '旧泰拉', link: '/旧泰拉/meta' },
            { text: '忠诚的负担', link: '/忠诚的负担/meta' },
            { text: '狼毒', link: '/狼毒/meta' },
            { text: '生于烈焰', link: '/生于烈焰/meta' },
            { text: '黑暗之奴', link: '/黑暗之奴/meta' },
            { text: '围城先驱', link: '/围城先驱/meta' },
            { text: '泰坦之死', link: '/泰坦之死/meta' },
            { text: '被埋葬的匕首', link: '/被埋葬的匕首/meta' },
            { text: 'epub总集', link: '/warhammer40k/epub' },
            { text: 'well-done', link: '/welldone/README' },
        ],
    },
];
