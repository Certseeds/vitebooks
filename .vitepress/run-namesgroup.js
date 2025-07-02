#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later

import fs from 'node:fs';
import path from 'node:path';
import { pinyin } from 'pinyin-pro';
import clustering from 'density-clustering'; // DBSCAN 算法

import ollama from 'ollama';

const args = process.argv;

const readArgs = function (args) {
    const result = {
        path: args[2]
    }
    return result;
}
const input = readArgs(args);



// 将中文名转为音节数组
const nameToSyllables = function (name) {
    // 获取带音节分隔的拼音
    return pinyin(name, {
        toneType: 'none',  // 无声调
        type: 'array',     // 返回数组
        v: true           // 表示声母和韵母
    });
}


const level0 = async () => {
    const allnames = path.resolve(input["path"], 'allnames.txt');
    const inputFile = await fs.readFileSync(allnames, 'utf8');
    const names = inputFile
        .split(/\r?\n/)
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(s => {
            const parts = s.split(" ");
            if (parts.length <= 1) return s; // 如果没有空格，返回整个字符串
            return parts.slice(0, parts.length - 1).join(" "); // 返回除最后一段外的所有部分
        });

    const namesPinyin = names.map(x => {
        return nameToSyllables(x).join("").replace(".", "");
    });

    console.log(namesPinyin)

    console.log("获取拼音嵌入向量...");
    const namesVectors = [];
    const length = names.length;
    for (let i = 0; i < length; i++) {
        // 这里存在问题
        // 只使用names, 则长度会极度影响输出
        // 若只使用pinyin, 输出会有点奇怪
        // 所以结合中英文, 中间加入一个相同的助embdding words
        const name_and_pinyin = `${names}'s pinyin can be represent ${namesPinyin[i]}`;
        const response = await ollama.embeddings({
            model: 'nomic-embed-text',
            prompt: name_and_pinyin
        });
        namesVectors.push(response.embedding);
    }

    console.log("嵌入向量维度:", namesVectors[0].length);
    console.log("拼音样例:", namesPinyin[0]);
    console.log("向量样例:", namesVectors[0].slice(0, 5), "...");

    // 步骤3: 使用DBSCAN聚类
    const dbscan = new clustering.DBSCAN();
    const epsilon = 1; // 聚类半径参数，需要根据数据调整
    const minPoints = 2; // 最小点数，构成聚类的最少样本数
    const clusters = dbscan.run(namesVectors, epsilon, minPoints);

    // 处理噪声点（不属于任何聚类的点）
    const noise = dbscan.noise;

    // 输出聚类结果
    console.log('聚类结果:');
    clusters.forEach((cluster, index) => {
        console.log(`Cluster ${index + 1}:`);
        cluster.forEach(pointIndex => {
            console.log(`${names[pointIndex]} (${namesPinyin[pointIndex]})`);
        });
    });


    return { clusters, noise, names };
}

(async () => {
    await level0();
})();
