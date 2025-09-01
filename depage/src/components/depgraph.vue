<!-- SPDX-FileCopyrightText: 2024-2025 Certseeds -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<template>
    <div class="dependency-graph">
        <div ref="cyContainer" class="cy-container"></div>
        <div class="controls">
            <button @click="resetLayout">重置布局</button>
            <button @click="exportData">导出数据</button>
            <div class="export-group">
                <label>导出图片:</label>
                <button @click="exportImage('webp')">WebP</button>
                <button @click="exportImage('png')">PNG</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import { get_all_books } from '@/js/rustydepsmodule.js';
import { torender } from '@/js/deps.js';

// 注册 dagre 布局扩展
cytoscape.use(dagre)

// 移除顶层的 await，将在 onMounted 中异步加载
// const allBooks = await get_all_books();
// console.log(allBooks)

const cyContainer = ref(null)
let cy = null

// 示例书籍数据
const books = [
    {
        id: '荷鲁斯崛起 Horus Heresy 1',
        chinese_name: '荷鲁斯崛起',
        english_name: 'Horus Rising',
        type: '长篇小说',
        series: {
            name: 'Horus Heresy',
            order: 1,
        },
        authors: ['Dan Abnett'],
        faction_keywords: ["荷鲁斯之子", "帝皇之子", "混沌恶魔"],
        recommended_reading: [],
    },
    {
        id: '伪神 Horus Heresy 2',
        chinese_name: '伪神',
        english_name: 'False Gods',
        type: '长篇小说',
        series: {
            name: 'Horus Heresy',
            order: 2,
        },
        authors: ["Graham McNeill"],
        faction_keywords: ["荷鲁斯之子", "吞世者", "帝皇之子", "泰坦军团", "混沌教派"],
        recommended_reading: ['荷鲁斯崛起']
    },
    {
        id: '燃烧的银河 Horus Heresy 3',
        chinese_name: '燃烧的银河',
        english_name: 'Galaxy in Falmes',
        type: '长篇小说',
        series: {
            name: 'Horus Heresy',
            order: 3,
        },
        authors: ["Ben Counter"],
        faction_keywords: ["荷鲁斯之子", "死亡守卫", "吞世者", "帝皇之子", "泰坦军团"],
        recommended_reading: ['伪神']
    }
]

const initGraph = async () => {
    if (!cyContainer.value) return

    try {
        // 异步加载书籍数据
        const allBooks = await get_all_books();
        const renderableBooks = torender(allBooks);
        console.log('Loaded books:', renderableBooks);
        // 如果有数据则使用，否则使用示例数据
        const booksData = renderableBooks;


        // 转换数据格式
        const elements = []

        // 添加节点
        booksData.forEach(book => {
            elements.push({
                data: {
                    id: book.id,
                    label: `${book.chinese_name}\n(${book.english_name})\n${book.series.name} #${book.series.order}`,
                    chinese_name: book.chinese_name,
                    english_name: book.english_name,
                    type: book.type,
                    authors: book.authors.join(', '),
                    factions: book.faction_keywords?.join(', ') || '',
                    series: book.series,
                    order: book.order
                }
            })
        })

        // 添加边（依赖关系）
        booksData.forEach(book => {
            book.dependencies?.forEach(dep => {
                elements.push({
                    data: {
                        id: `${dep} ${book.id}`,
                        source: dep,
                        target: book.id,
                        label: '前置阅读'
                    }
                })
            })
        })

        // 创建 Cytoscape 实例
        cy = cytoscape({
            container: cyContainer.value,
            elements: elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': '#4f46e5',
                        'label': 'data(label)',
                        'text-wrap': 'wrap',
                        'text-max-width': '160px',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'color': 'white',
                        'font-size': '11px',
                        'font-family': 'Arial, sans-serif',
                        'width': 140,
                        'height': 90,
                        'shape': 'round-rectangle',
                        'border-width': 2,
                        'border-color': '#312e81'
                    }
                },
                {
                    selector: 'node:hover',
                    style: {
                        'background-color': '#6366f1',
                        'border-color': '#4338ca'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 3,
                        'line-color': '#6b7280',
                        'target-arrow-color': '#6b7280',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'arrow-scale': 1.2
                    }
                },
                {
                    selector: 'edge:hover',
                    style: {
                        'line-color': '#374151',
                        'target-arrow-color': '#374151'
                    }
                }
            ],
            layout: {
                name: 'dagre',
                directed: true,
                padding: 20,
                spacingFactor: 1.5,
                rankDir: 'TB', // Top to Bottom - 确保只有向下的边
                ranker: 'longest-path', // 使用最长路径算法来确定层级
                nodeSep: 50, // 同层节点间距
                rankSep: 80, // 不同层级间距
                edgeSep: 10  // 边的间距
            }
        })

        // 添加交互事件
        cy.on('tap', 'node', (event) => {
            const node = event.target
            const data = node.data()

            alert(`书名: ${data.chinese_name} (${data.english_name})\n` +
                `类型: ${data.type}\n` +
                `系列: ${data.series.name} #${data.series.order}\n` +
                `作者: ${data.authors}\n` +
                `阵营: ${data.factions}`)
        })

        // 添加右键菜单（可选）
        cy.on('cxttap', 'node', (event) => {
            const node = event.target
            console.log('右键点击节点:', node.data())
        })

    } catch (error) {
        console.error('Failed to initialize graph:', error)
        // 如果加载失败，使用示例数据
        const elements = []
        books.forEach(book => {
            elements.push({
                data: {
                    id: book.id,
                    label: `${book.chinese_name}\n(${book.english_name})\n${book.series} #${book.order}`,
                    chinese_name: book.chinese_name,
                    english_name: book.english_name,
                    type: book.type,
                    series: book.series,
                    order: book.order,
                    authors: book.authors.join(', '),
                    factions: book.factions ? book.factions.join(', ') : '未知'
                }
            })
        })

        // 使用示例数据创建简单图
        cy = cytoscape({
            container: cyContainer.value,
            elements: elements,
            style: [{
                selector: 'node',
                style: {
                    'background-color': '#4f46e5',
                    'label': 'data(label)',
                    'text-wrap': 'wrap',
                    'text-max-width': '160px',
                    'color': 'white',
                    'font-size': '11px'
                }
            }],
            layout: { name: 'grid' }
        })
    }
}

const resetLayout = () => {
    if (cy) {
        cy.layout({
            name: 'dagre',
            directed: true,
            padding: 20,
            spacingFactor: 1.5,
            rankDir: 'TB', // Top to Bottom - 确保只有向下的边
            ranker: 'longest-path', // 使用最长路径算法来确定层级
            nodeSep: 50, // 同层节点间距
            rankSep: 80, // 不同层级间距
            edgeSep: 10  // 边的间距
        }).run()
    }
}

const exportData = () => {
    if (cy) {
        const data = cy.json()
        console.log('图数据:', data)

        // 可以将数据下载为 JSON 文件
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'dependency-graph.json'
        a.click()
        URL.revokeObjectURL(url)
    }
}

const exportImage = (format) => {
    if (!cy) return

    try {
        // 获取当前时间戳作为文件名
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
        
        // 获取图形信息来动态调整导出参数
        const nodeCount = cy.nodes().length
        const extent = cy.extent()
        const graphWidth = extent.x2 - extent.x1
        const graphHeight = extent.y2 - extent.y1
        
        // 根据节点数量和图形尺寸动态调整参数
        let scale = 1.5
        let maxWidth = 2048
        let maxHeight = 2048
        
        if (nodeCount > 50) {
            // 节点很多时，降低分辨率
            scale = 1.2
            maxWidth = 1600
            maxHeight = 1600
        } else if (nodeCount > 20) {
            // 中等节点数
            scale = 1.3
            maxWidth = 1800
            maxHeight = 1800
        }
        
        // 如果图形很大，进一步限制尺寸
        if (graphWidth > 2000 || graphHeight > 2000) {
            scale = Math.max(0.8, scale - 0.3)
            maxWidth = Math.min(maxWidth, 1400)
            maxHeight = Math.min(maxHeight, 1400)
        }
        
        console.log(`导出参数: 节点数=${nodeCount}, 尺寸=${Math.round(graphWidth)}x${Math.round(graphHeight)}, scale=${scale}, max=${maxWidth}x${maxHeight}`)
        
        // 设置导出选项 - 动态调整内存使用
        const options = {
            output: 'blob',
            bg: 'white', // 背景色
            full: true, // 导出完整图形
            scale: scale, // 动态分辨率
            maxWidth: maxWidth, // 动态最大宽度
            maxHeight: maxHeight // 动态最大高度
        }

        // 根据格式设置质量参数
        let mimeType, quality, extension
        
        switch (format.toLowerCase()) {
            case 'webp':
                mimeType = 'image/webp'
                quality = 0.9
                extension = 'webp'
                break
            case 'png':
                mimeType = 'image/png'
                quality = 1.0
                extension = 'png'
                break
            default:
                mimeType = 'image/png'
                quality = 1.0
                extension = 'png'
        }

        // 尝试导出，如果失败则降级重试
        const tryExport = (exportOptions, retryCount = 0) => {
            try {
                const blob = cy.png(exportOptions)
                
                // 如果是 PNG 或 JPEG，直接下载
                if (format === 'png' || format === 'jpeg') {
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `dependency-graph-${timestamp}.${extension}`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                    console.log('图片导出成功')
                    return
                }
                
                // 对于其他格式继续处理
                processAdvancedFormat(blob)
                
            } catch (error) {
                console.log(`导出尝试 ${retryCount + 1} 失败:`, error.message)
                
                if (error.message.includes('Out of memory') && retryCount < 3) {
                    // 降级参数
                    exportOptions.scale = Math.max(0.5, exportOptions.scale * 0.7)
                    exportOptions.maxWidth = Math.max(800, exportOptions.maxWidth * 0.7)
                    exportOptions.maxHeight = Math.max(600, exportOptions.maxHeight * 0.7)
                    
                    console.log(`降级重试: scale=${exportOptions.scale}, max=${exportOptions.maxWidth}x${exportOptions.maxHeight}`)
                    
                    // 延迟重试，给浏览器时间释放内存
                    setTimeout(() => {
                        tryExport(exportOptions, retryCount + 1)
                    }, 100)
                } else {
                    throw error
                }
            }
        }
        
        // 处理高级格式的函数
        const processAdvancedFormat = (blob) => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            const img = new Image()
            
            img.onload = () => {
                canvas.width = img.width
                canvas.height = img.height
                ctx.fillStyle = 'white'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(img, 0, 0)
                
                // 检查浏览器支持
                if (format === 'avif' && !canvas.toBlob) {
                    alert('您的浏览器不支持 AVIF 格式导出，请使用 WebP 或 PNG')
                    return
                }
                
                // 转换为目标格式
                canvas.toBlob((convertedBlob) => {
                    if (convertedBlob) {
                        const url = URL.createObjectURL(convertedBlob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `dependency-graph-${timestamp}.${extension}`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                        URL.revokeObjectURL(url)
                        console.log('高级格式图片导出成功')
                    } else {
                        alert(`导出 ${format.toUpperCase()} 格式失败，您的浏览器可能不支持此格式`)
                    }
                }, mimeType, quality)
            }
            
            img.onerror = () => {
                alert('图片处理失败')
            }
            
            // 将 blob 转换为 data URL
            const reader = new FileReader()
            reader.onload = (e) => {
                img.src = e.target.result
            }
            reader.readAsDataURL(blob)
        }
        
        // 开始导出
        tryExport(options)
        
    } catch (error) {
        console.error('导出图片失败:', error)
        alert(`导出 ${format.toUpperCase()} 图片失败: ${error.message}`)
    }
}

onMounted(async () => {
    await initGraph()
})

onUnmounted(() => {
    if (cy) {
        cy.destroy()
    }
})
</script>

<style scoped>
.dependency-graph {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.cy-container {
    width: 100%;
    height: 600px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background-color: #f9fafb;
    /* 覆盖继承的 text-align: center */
    text-align: left;
}

.controls {
    margin-top: 16px;
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
}

.export-group {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background-color: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.export-group label {
    font-size: 14px;
    font-weight: 500;
    color: #475569;
    margin-right: 4px;
}

.controls button {
    padding: 8px 16px;
    background-color: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.export-group button {
    padding: 6px 12px;
    font-size: 12px;
    background-color: #10b981;
    min-width: 50px;
}

.export-group button:hover {
    background-color: #059669;
}

.export-group button:active {
    background-color: #047857;
}

.controls button:hover {
    background-color: #4338ca;
}

.controls button:active {
    background-color: #3730a3;
}
</style>
