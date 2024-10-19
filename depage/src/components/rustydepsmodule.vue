<script setup>
import { ref, onMounted } from 'vue';
import { initRustDep, getdeps } from '@/js/rustydepsmodule.js';

const message = ref('Initializing...');

const inputText = ref('');
const result = ref('');

const handleButtonClick = async () => {
    try {
        const depsResult = await getdeps(inputText.value);
        result.value = depsResult;
    } catch (error) {
        console.error('Error calling getdeps:', error);
        result.value = 'Failed to get dependencies';
    }
};

onMounted(() => {
    initRustDep()
        .then((response) => {
            message.value = response;
        });
});
</script>

<template>
    <div>
        <p>{{ message }}</p>
        <input v-model="inputText" placeholder="Enter text" />
        <button @click="handleButtonClick">Submit</button>
        <div v-if="Array.isArray(result)">
            <table>
                <thead>
                    <tr>
                        <th>依赖层级</th>
                        <th>每一层依赖的书</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in result" :key="index">
                        <td>{{ index + 1 }}</td>
                        <td>
                            <div v-for="(subItem, subIndex) in item" :key="subIndex">
                                {{ subItem }}
                            </div>
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
</style>