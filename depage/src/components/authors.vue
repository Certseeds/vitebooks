<script setup>
import { ref, onMounted } from 'vue';
import { get_authors, get_author_books } from '@/js/rustydepsmodule.js';

const state = ref(false);

const inputText = ref('');
const result = ref('');

const selectedIndex = ref(null);

const resetHandler = async () => {
    get_authors()
        .then((response) => {
            state.value = false;
            result.value = response;
        });
}

const handleButtonClick = async () => {
    try {
        get_author_books(inputText.value)
            .then((response) => {
                state.value = true;
                result.value = response;
            });
    } catch (error) {
        console.error('Error calling getdeps:', error);
        result.value = 'Failed to get dependencies';
    }
};
const handleSelect = (index, item) => {
    selectedIndex.value = index;
    inputText.value = item;
};

onMounted(() => {
    resetHandler()
});
</script>

<template>
    <div>
        <div>默认加载作者列表, 按名字获取书籍.</div>
        <button @click="resetHandler">Reset</button>
        <input v-model="inputText" placeholder="作者名" />
        <button @click="handleButtonClick">Submit</button>
        <div v-if="Array.isArray(result)">
            <table>
                <thead>
                    <tr>
                        <th v-if="!state">按作品量从高到低排名</th>
                        <th v-else>序号</th>
                        <th v-if="!state">作者</th>
                        <th v-else>书名</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in result" :key="index">
                        <td :class="{ selected: selectedIndex === index }" @click="handleSelect(index, item)">
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
</template>

<style scoped>
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
    margin-top: 20px;
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