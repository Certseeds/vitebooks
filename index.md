---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "vitebooks"
  text: "Vite Books Collection"
  tagline: 一些markdown格式的电子书
  actions:
    - theme: brand
      text: 无所畏惧
      link: /无所畏惧/meta
    - theme: brand
      text: 不被铭记的帝国
      link: /不被铭记的帝国/meta
    - theme: brand
      text: warhammer40k-元数据
      link: /warhammer40k/primarchs
features:
  - title: 完全由markdown构建
    details: 每一个小节是单独的markdown文件
  - title: 由git进行版本管理
    details: 每一个变更都能被记录下来
  - title: 自动化
    details: 通过脚本实现拆分src, 替换词汇, 添加脚注, 添加链接等功能
  - title: LLM驱动的人名检测
    details: 一键检索所有译名, 替换简单轻松, 提升观感.
---

<script setup>

import "@nanoseeds/wh40k-icon/dist/warhammer40k.css"
import adeptus_terra from "@nanoseeds/wh40k-icon/dist/svgs/adeptus-terra.svg?no-inline"
import adeptus_astartes from "@nanoseeds/wh40k-icon/dist/svgs/adeptus-astartes.svg?no-inline"

</script>

stories between

<div style="display: flex; align-items: center;">
  <img :src="adeptus_astartes" alt="adeptus_astartes" width="100" height="100"/> of
  <img :src="adeptus_terra" alt="adeptus_terra" width="100" height="100"/>

  <span style="margin: 0 10px;">and</span>

  <div class="wh40k-heretic-astartes" style="font-size: 50px; width: 50px; height: 50px;"></div> of <i class="wh40k-chaos-star-01" style="font-size: 50px; width: 50px; height: 50px;"></i>
</div>
