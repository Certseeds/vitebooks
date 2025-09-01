<!-- SPDX-FileCopyrightText: 2024-2025 Certseeds -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<script setup>
// import HelloWorld from '@/components/HelloWorld.vue'
import { ref, computed, onMounted } from 'vue';
import { initRustDep, greet } from '@/js/rustydepsmodule.js';
import Bookdeps from '@/components/bookdeps.vue';
import Authors from '@/components/authors.vue';
import FactionKeywords from '@/components/faction_keywords.vue';
import DependencyGraph from '@/components/depgraph.vue';

const selectedComponent = ref('rustydepsmodule');
const message = ref('Initializing...');

const components = {
    rustydepsmodule: Bookdeps,
    authors: Authors,
    faction_keywords: FactionKeywords,
    dependency_graph: DependencyGraph,
};

const currentComponent = computed(() => components[selectedComponent.value]);

onMounted(() => {
    initRustDep()
        .then((response) => {
            message.value = response;
            greet();
        });
});

</script>

<template>
    <!-- <HelloWorld msg="Vite + Vue" /> -->
    <p>{{ message }}</p>

    <div class="button-container">
        <p>当前界面</p>
        <button @click="selectedComponent = 'rustydepsmodule'">书籍依赖界面</button>
        <button @click="selectedComponent = 'authors'">作者信息界面</button>
        <button @click="selectedComponent = 'faction_keywords'">阵营关键字界面</button>
        <button @click="selectedComponent = 'dependency_graph'">依赖关系图</button>
    </div>

    <!-- 动态加载组件 -->
    <component :is="currentComponent" ></component>
</template>

<style scoped>

.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}

.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}

.button-container {
    display: flex;
    align-items: center;
    justify-content: center; /* 添加这行实现水平居中 */
    gap: 10px;
    width: 100%; /* 确保容器占满父元素宽度 */
}

.button-container p {
    margin: 0;
    /* 移除段落的默认外边距 */
}
</style>
