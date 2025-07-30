<template>
    <div id="app">
        <div class="container">
            <h1>HTML to Markdown Converter</h1>
            <p>上传多个html文件, 将其转换到markdown格式</p>

            <!-- File Upload Section -->
            <div class="upload-section">
                <label for="html-files" class="upload-label">
                    Select HTML Files:
                </label>
                <input id="html-files" type="file" multiple accept=".html,.htm,.xhtml" @change="handleFileUpload"
                    class="file-input" />
                <div v-if="uploadedFiles.length > 0" class="file-list">
                    <h3>Uploaded Files ({{ uploadedFiles.length }}):</h3>
                    <ul>
                        <li v-for="file in uploadedFiles" :key="file.name" class="file-item">
                            {{ file.name }} ({{ formatFileSize(file.size) }})
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Convert Button -->
            <div class="convert-section">
                <button @click="convertToMarkdown" :disabled="uploadedFiles.length === 0 || isConverting"
                    class="convert-btn">
                    {{ isConverting ? 'Converting...' : 'Convert to Markdown' }}
                </button>
            </div>

            <!-- Progress and Status -->
            <div v-if="conversionStatus.length > 0" class="status-section">
                <h3>Conversion Status:</h3>
                <div class="status-list">
                    <div v-for="status in conversionStatus" :key="status.filename" class="status-item"
                        :class="{ 'success': status.success, 'error': !status.success }">
                        <span class="filename">{{ status.filename }}</span>
                        <span class="status">{{ status.message }}</span>
                    </div>
                </div>
            </div>

            <!-- Download Section -->
            <div v-if="convertedFiles.length > 0" class="download-section">
                <h3>Converted Files:</h3>
                <button @click="downloadAllFiles" class="download-all-btn">
                    Download All Markdown Files
                </button>
                <div class="converted-list">
                    <div v-for="file in convertedFiles" :key="file.filename" class="converted-item">
                        <span class="filename">{{ file.filename }}</span>
                        <button @click="downloadSingleFile(file)" class="download-btn">
                            Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { createTurndownService } from '@/tdown.js'

// Reactive data
const uploadedFiles = ref([])
const convertedFiles = ref([])
const conversionStatus = ref([])
const isConverting = ref(false)
const turndownService = ref(null)

// Initialize TurndownService
const initializeTurndownService = () => {
    turndownService.value = createTurndownService()
}

const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    uploadedFiles.value = files
    convertedFiles.value = []
    conversionStatus.value = []
}

const convertToMarkdown = async () => {
    if (uploadedFiles.value.length === 0) return

    isConverting.value = true
    conversionStatus.value = []
    convertedFiles.value = []

    for (const file of uploadedFiles.value) {
        try {
            const htmlContent = await readFileAsText(file)
            const parser = new DOMParser()
            const doc = parser.parseFromString(htmlContent, 'text/html')

            // Extract body content
            const bodyElement = doc.querySelector('body')
            const bodyContent = bodyElement ? bodyElement.innerHTML : htmlContent

            // Convert to markdown
            const markdown = turndownService.value.turndown(bodyContent)

            // Generate filename
            const originalName = file.name.replace(/\.[^/.]+$/, '') // Remove extension
            const markdownFilename = `${originalName}.md`

            convertedFiles.value.push({
                filename: markdownFilename,
                content: markdown,
                originalFile: file.name
            })

            conversionStatus.value.push({
                filename: file.name,
                message: 'Successfully converted',
                success: true
            })

        } catch (error) {
            console.error(`Error converting ${file.name}:`, error)
            conversionStatus.value.push({
                filename: file.name,
                message: `Error: ${error.message}`,
                success: false
            })
        }
    }

    isConverting.value = false
}

const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsText(file)
    })
}

const downloadSingleFile = (file) => {
    createDownload(file.content, file.filename)
}

const downloadAllFiles = () => {
    convertedFiles.value.forEach(file => {
        createDownload(file.content, file.filename)
    })
}

const createDownload = (content, filename) => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Initialize on mount
onMounted(() => {
    initializeTurndownService()
})
</script>
