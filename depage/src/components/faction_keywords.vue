<!-- SPDX-FileCopyrightText: 2024-2025 Certseeds -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<script setup>
import { ref, onMounted, watch, toRaw } from 'vue';
import { get_faction_keywords, get_faction_keywords_map } from '@/js/rustydepsmodule.js';

const inputText = ref('');
const result = ref('');
const keywords_map = ref({});
const keywords_to_books = ref([])
const selectedIndex = ref(new Set());
const unionNames = ref([]);

const resetHandler = async () => {
    keywords_map.value = await get_faction_keywords();
    keywords_to_books.value = await get_faction_keywords_map();
    result.value = keywords_map.value;
    selectedIndex.value.clear();
    unionNames.value = [];
}

const handleSelect = (index, item) => {
    if (selectedIndex.value.has(index)) {
        selectedIndex.value.delete(index);
        return;
    }
    selectedIndex.value.add(index);
};

const handleButtonClick = async () => {
    if (selectedIndex.value.size === 0) {
        unionNames.value = [];
        return;
    } else if (selectedIndex.value.size === 1) {
        unionNames.value = toRaw(keywords_to_books.value)
            .get(result.value[selectedIndex.value.values().next().value]);
        return;
    }
    const allInter = [...selectedIndex.value]
        .map(id => result.value[id])
        .map(name => {
            return toRaw(keywords_to_books.value).get(name)
        })
        .reduce((prev, next) => {
            return prev.intersection(next);
        });
    unionNames.value = allInter;
}
watch(selectedIndex, (newSelectedIndex, oldSelectedIndex) => {
    if (newSelectedIndex.size === 0) {
        inputText.value = '';
        return;
    } else if (newSelectedIndex.size === 1) {
        inputText.value = result.value[newSelectedIndex.values().next().value];
        return;
    }
    const str = new Array(...(newSelectedIndex))
        .map((index) => result.value[index])
        .join(', ');
    console.log(str);
    inputText.value = str;
}, { deep: true });

onMounted(() => {
    resetHandler()
});
</script>

<template>
    <div>
        <div>默认加载阵营关键字排名, 复选阵营关键字框以交叉查询对应书籍.</div>
        <button @click="resetHandler">Reset</button>
        <input v-model="inputText" placeholder="作者名" />
        <button @click="handleButtonClick">Submit</button>
        <div class="container">
            <div class="table-container">
                <div v-if="Array.isArray(result)">
                    <table>
                        <thead>
                            <tr>
                                <th>按作品量从高到低排名</th>
                                <th>阵营关键字</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in result" :key="index">
                                <td :class="{ selected: selectedIndex.has(index) }" @click="handleSelect(index, item)">
                                    {{ index + 1 }}
                                </td>
                                <td>
                                    {{ item }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p v-else>{{ result }}</p>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>书名</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="name in unionNames" :key="name">
                            <td>
                                {{ name }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    gap: 20px;
    /* 间距，可根据需要调整 */
    margin-top: 20px;
}

.table-container {
    flex: 1;
    /* 每个表格占据相同的宽度 */
    overflow-x: auto;
    /* 如果内容过多，允许水平滚动 */
}

p {
    font-size: 1.2em;
    color: #42b983;
}

input {
    margin-right: 10px;
    padding: 5px;
    font-size: 1em;
}

button {
    padding: 5px 10px;
    font-size: 1em;
    background-color: #42b983;
    color: white;
    border: none;
    cursor: pointer;
}

button:hover {
    background-color: #369f6b;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    border: 1px solid #ddd;
    padding: 8px;
}

th {
    background-color: #f2f2f2;
    text-align: left;
}

.selected {
    background-color: #d3d3d3;
    /* 选中时的背景色 */
    cursor: pointer;
}
</style>