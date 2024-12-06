---
prev:
  text: 'dependencies'
  link: '/warhammer40k/dependencies'
---

<script setup>

import { ref, onMounted } from 'vue'

const epubs = ref([]);
const epubLength = ref(0);
onMounted(() => {
    const allAElement = document.querySelectorAll("a");
    console.log(allAElement)
    epubs.value = Array.from(allAElement)
        .map(a => a.href)
        .filter(href => href.endsWith(".epub"));
    const epubSet = new Set(epubs.value);
    epubs.value = Array.from(epubSet);
    console.log(epubs.value)
    epubLength.value = epubs.value.length;
})
const handleButtonClick = () => {
    const download = (epub) => {
        const link = document.createElement('a');
        link.href = epub;
        link.style.display = 'none';
        link.target = '_blank';
        link.rel = 'noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
  }
  epubs.value.forEach(epub => download(epub));
}

</script>

<div>目前共计{{epubLength}}本书</div>

<button @click="handleButtonClick">一键下载所有epub(注意弹窗)</button>
