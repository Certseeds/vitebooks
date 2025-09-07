<!-- SPDX-FileCopyrightText: 2024-2025 Certseeds -->
<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<template>
    <div class="dependency-graph">
        <!-- 阵营筛选面板 -->
        <div class="faction-filter-panel" v-if="allFactions.length > 0">
            <div class="filter-header">
                <button @click="toggleFactionFilter" class="filter-toggle">
                    <span>🏛️ 阵营筛选 ({{ selectedFactions.size }}/{{ allFactions.length }})</span>
                    <span class="toggle-icon">{{ showFactionFilter ? '▲' : '▼' }}</span>
                </button>
                <div class="filter-quick-actions" v-if="showFactionFilter">
                    <button @click="selectAllFactions" :disabled="isAllSelected" class="quick-btn">全选</button>
                    <button @click="clearAllFactions" :disabled="isNoneSelected" class="quick-btn">清空</button>
                </div>
            </div>
            
            <div v-if="showFactionFilter" class="faction-checkboxes">
                <div class="checkbox-grid">
                    <label 
                        v-for="faction in allFactions" 
                        :key="faction" 
                        class="faction-checkbox"
                        :class="{ 'selected': selectedFactions.has(faction) }"
                    >
                        <input 
                            type="checkbox" 
                            :checked="selectedFactions.has(faction)"
                            @change="toggleFaction(faction)"
                        />
                        <span class="faction-name">{{ faction }}</span>
                        <span class="faction-count">
                            ({{ booksData.filter(book => book.faction_keywords?.includes(faction)).length }})
                        </span>
                    </label>
                </div>
            </div>
        </div>

        <div ref="cyContainer" class="cy-container">
            <div v-if="isLoading" class="loading-overlay">
                <div class="loading-spinner"></div>
                <div>加载中...</div>
            </div>
        </div>
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
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import { get_all_books } from '@/js/rustydepsmodule.js';
import { torender } from '@/js/deps.js';

// 注册 dagre 布局扩展
cytoscape.use(dagre)

const cyContainer = ref(null)
let cy = null

// 响应式的书籍数据
const booksData = ref([])
const isLoading = ref(true)

// 阵营筛选相关状态
const allFactions = ref([])
const selectedFactions = ref(new Set())
const showFactionFilter = ref(false)

// 计算属性：获取所有阵营关键字
const extractAllFactions = computed(() => {
    if (!booksData.value || booksData.value.length === 0) return []
    
    const factionSet = new Set()
    booksData.value.forEach(book => {
        if (book.faction_keywords && Array.isArray(book.faction_keywords)) {
            book.faction_keywords.forEach(faction => {
                if (faction && faction.trim()) {
                    factionSet.add(faction.trim())
                }
            })
        }
    })
    
    return Array.from(factionSet).sort()
})

// 计算属性：根据阵营筛选后的书籍数据
const filteredBooksData = computed(() => {
    if (!booksData.value || booksData.value.length === 0) return []
    if (selectedFactions.value.size === 0) return booksData.value
    
    return booksData.value.filter(book => {
        if (!book.faction_keywords || !Array.isArray(book.faction_keywords)) return false
        
        // 检查书籍的阵营关键字中是否有任一在选中的阵营中
        return book.faction_keywords.some(faction => 
            selectedFactions.value.has(faction.trim())
        )
    })
})
// 计算属性：将书籍数据转换为 Cytoscape 元素
const elements = computed(() => {
    if (!filteredBooksData.value || filteredBooksData.value.length === 0) return []
    
    const result = []

    // 添加节点
    filteredBooksData.value.forEach(book => {
        result.push({
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

    // 添加边（依赖关系）- 只在筛选后的书籍之间创建边
    const filteredIds = new Set(filteredBooksData.value.map(book => book.id))
    filteredBooksData.value.forEach(book => {
        book.dependencies?.forEach(dep => {
            // 只有当依赖的书籍也在筛选结果中时才添加边
            if (filteredIds.has(dep)) {
                result.push({
                    data: {
                        id: `${dep} ${book.id}`,
                        source: dep,
                        target: book.id,
                        label: '前置阅读'
                    }
                })
            }
        })
    })

    return result
})

// 加载书籍数据的函数
const loadBooksData = async () => {
    try {
        isLoading.value = true
        const allBooks = await get_all_books();
        const renderableBooks = torender(allBooks);
        console.log('Loaded books:', renderableBooks);
        booksData.value = renderableBooks;
        
        // 初始化阵营筛选 - 默认全选
        initializeFactionFilter();
    } catch (error) {
        console.error('Failed to load books data:', error)
        // 如果加载失败，使用示例数据
        booksData.value = exampleBooks;
        initializeFactionFilter();
    } finally {
        isLoading.value = false
    }
}

// 初始化阵营筛选器
const initializeFactionFilter = () => {
    // 更新所有阵营列表
    allFactions.value = extractAllFactions.value
    
    // 默认全选所有阵营
    selectedFactions.value = new Set(allFactions.value)
    
    console.log('Initialized factions:', allFactions.value)
    console.log('Selected factions:', Array.from(selectedFactions.value))
}

// 示例书籍数据（作为后备数据）
const exampleBooks = [
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
        dependencies: [],
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
        dependencies: ['荷鲁斯崛起 Horus Heresy 1']
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
        dependencies: ['伪神 Horus Heresy 2']
    }
]

// 初始化 Cytoscape 实例
const initCytoscape = () => {
    if (!cyContainer.value) return

    // 销毁已存在的实例
    if (cy) {
        cy.destroy()
        cy = null
    }

    // 创建新的 Cytoscape 实例
    cy = cytoscape({
        container: cyContainer.value,
        elements: [], // 初始为空，会通过 watch 更新
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
            rankDir: 'TB',
            ranker: 'longest-path',
            nodeSep: 50,
            rankSep: 80,
            edgeSep: 10
        }
    })

    // 添加交互事件
    addCytoscapeEvents()
}

// 添加 Cytoscape 事件监听器
const addCytoscapeEvents = () => {
    if (!cy) return

    // 节点点击事件
    cy.on('tap', 'node', (event) => {
        const node = event.target
        const data = node.data()

        alert(`书名: ${data.chinese_name} (${data.english_name})\n` +
            `类型: ${data.type}\n` +
            `系列: ${data.series.name} #${data.series.order}\n` +
            `作者: ${data.authors}\n` +
            `阵营: ${data.factions}`)
    })

    // 右键菜单
    cy.on('cxttap', 'node', (event) => {
        const node = event.target
        console.log('右键点击节点:', node.data())
    })
}

// 阵营筛选相关方法
const toggleFaction = (faction) => {
    if (selectedFactions.value.has(faction)) {
        selectedFactions.value.delete(faction)
    } else {
        selectedFactions.value.add(faction)
    }
    // 触发响应式更新
    selectedFactions.value = new Set(selectedFactions.value)
}

const selectAllFactions = () => {
    selectedFactions.value = new Set(allFactions.value)
}

const clearAllFactions = () => {
    selectedFactions.value = new Set()
}

const isAllSelected = computed(() => {
    return selectedFactions.value.size === allFactions.value.length
})

const isNoneSelected = computed(() => {
    return selectedFactions.value.size === 0
})

const toggleFactionFilter = () => {
    showFactionFilter.value = !showFactionFilter.value
}

// 监听阵营数据变化，更新筛选器
watch(extractAllFactions, (newFactions) => {
    if (newFactions.length > 0) {
        allFactions.value = newFactions
        // 如果当前没有选中任何阵营，则默认全选
        if (selectedFactions.value.size === 0) {
            selectedFactions.value = new Set(newFactions)
        }
    }
}, { immediate: true })
const updateGraph = () => {
    if (!cy || !elements.value) return

    // 更新元素
    cy.elements().remove()
    cy.add(elements.value)

    // 重新应用布局
    cy.layout({
        name: 'dagre',
        directed: true,
        padding: 20,
        spacingFactor: 1.5,
        rankDir: 'TB',
        ranker: 'longest-path',
        nodeSep: 50,
        rankSep: 80,
        edgeSep: 10
    }).run()
}

// 监听 elements 变化，实时更新图形
watch(elements, () => {
    updateGraph()
}, { deep: true })

// 监听容器变化，重新初始化
watch(cyContainer, (newContainer) => {
    if (newContainer) {
        initCytoscape()
        updateGraph()
    }
})

const resetLayout = () => {
    if (cy) {
        cy.layout({
            name: 'dagre',
            directed: true,
            padding: 20,
            spacingFactor: 1.5,
            rankDir: 'TB',
            ranker: 'longest-path',
            nodeSep: 50,
            rankSep: 80,
            edgeSep: 10
        }).run()
    }
}

// 手动刷新数据的方法
const refreshData = async () => {
    await loadBooksData()
}

// 暴露一些方法供外部使用
const updateBooksData = (newData) => {
    booksData.value = newData
    initializeFactionFilter()
}

// 导出组件方法供父组件使用
defineExpose({
    refreshData,
    updateBooksData,
    booksData,
    filteredBooksData,
    allFactions,
    selectedFactions,
    toggleFaction,
    selectAllFactions,
    clearAllFactions
})

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
    // 初始化 Cytoscape
    initCytoscape()
    
    // 加载数据
    await loadBooksData()
})

onUnmounted(() => {
    if (cy) {
        cy.destroy()
        cy = null
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

.faction-filter-panel {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 16px;
    padding: 12px;
}

.filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.filter-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    padding: 8px;
    border-radius: 6px;
    transition: background-color 0.2s;
}

.filter-toggle:hover {
    background-color: #e5e7eb;
}

.toggle-icon {
    font-size: 12px;
    transition: transform 0.2s;
}

.filter-quick-actions {
    display: flex;
    gap: 8px;
}

.quick-btn {
    padding: 4px 12px;
    background-color: #6366f1;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.2s;
}

.quick-btn:hover:not(:disabled) {
    background-color: #5856ec;
}

.quick-btn:disabled {
    background-color: #d1d5db;
    cursor: not-allowed;
}

.faction-checkboxes {
    max-height: 300px;
    overflow-y: auto;
    border-top: 1px solid #e5e7eb;
    padding-top: 12px;
}

.checkbox-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 8px;
}

.faction-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
    border: 1px solid transparent;
}

.faction-checkbox:hover {
    background-color: #f1f5f9;
}

.faction-checkbox.selected {
    background-color: #eff6ff;
    border-color: #3b82f6;
}

.faction-checkbox input[type="checkbox"] {
    margin: 0;
    cursor: pointer;
}

.faction-name {
    font-weight: 500;
    color: #374151;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.faction-count {
    font-size: 12px;
    color: #6b7280;
    background-color: #f3f4f6;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 500;
}

.cy-container {
    width: 100%;
    height: 600px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background-color: #f9fafb;
    position: relative;
    /* 覆盖继承的 text-align: center */
    text-align: left;
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(249, 250, 251, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 6px;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top: 4px solid #4f46e5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 12px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

.info {
    display: flex;
    gap: 16px;
    margin-left: auto;
    font-size: 14px;
    color: #6b7280;
}

.info span {
    padding: 4px 8px;
    background-color: #f3f4f6;
    border-radius: 4px;
    font-weight: 500;
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

.controls button:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
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

.controls button:hover:not(:disabled) {
    background-color: #4338ca;
}

.controls button:active:not(:disabled) {
    background-color: #3730a3;
}
</style>
