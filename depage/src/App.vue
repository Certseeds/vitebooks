<script setup>
// import HelloWorld from '@/components/HelloWorld.vue'
import { ref, computed, onMounted } from 'vue';
import { initRustDep, greet } from '@/js/rustydepsmodule.js';
import Rustydepsmodule from '@/components/bookdeps.vue';
import Authors from '@/components/authors.vue';

const selectedComponent = ref('rustydepsmodule');
const message = ref('Initializing...');

const components = {
    rustydepsmodule: Rustydepsmodule,
    authors: Authors,
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
    </div>

    <!-- 动态加载组件 -->
    <component :is="currentComponent"></component>
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
    gap: 10px;
    /* 控制按钮之间的间距 */
}

.button-container p {
    margin: 0;
    /* 移除段落的默认外边距 */
}
</style>
