<script setup>
// import HelloWorld from '@/components/HelloWorld.vue'
import Rustydepsmodule from '@/components/rustydepsmodule.vue';
</script>

<template>
    <div>请输入书名以获取推荐阅读列表: 推荐自下而上阅读</div>
    <!-- <HelloWorld msg="Vite + Vue" /> -->
    <Rustydepsmodule></Rustydepsmodule>
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
</style>
