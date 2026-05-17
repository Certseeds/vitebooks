<template>
	<div class="page-shell">
		<header class="hero-card">
			<div class="hero-copy">
				<p class="eyebrow">webdoc</p>
				<h1>Zip Markdown to EPUB3</h1>
				<p class="hero-text">
					在浏览器里读取 zip markdown 包, 规划章节顺序, 再调用 pandoc-wasm 输出 EPUB3.
				</p>
			</div>
			<div class="build-card">
				<div class="build-item">
					<span>当前时间</span>
					<strong>{{ runtimeLabel }}</strong>
				</div>
				<div class="build-item">
					<span>Commit Hash</span>
					<code>{{ commitHash || 'local-build' }}</code>
				</div>
			</div>
		</header>

		<main class="workspace-grid">
			<section class="panel input-panel">
				<div class="panel-header">
					<h2>输入</h2>
					<p>上传 zip, 填写元数据, 然后生成 EPUB.</p>
				</div>

				<form class="form-grid" @submit.prevent="handleGenerate">
					<label class="field field-file">
						<span>Zip 文件</span>
						<input
							accept=".zip,application/zip"
							class="file-input"
							type="file"
							@change="handleArchiveChange"
						>
					</label>

					<label class="field">
						<span>书名</span>
						<input v-model.trim="bookTitle" placeholder="例如, 福格瑞姆" type="text">
					</label>

					<label class="field">
						<span>作者列表</span>
						<input
							v-model="authorsInput"
							placeholder="AuthorA, AuthorB"
							type="text"
						>
					</label>

					<div class="field">
						<span>作品类型</span>
						<div class="segmented-control">
							<button
								:class="['segment', { active: workType === WORK_TYPES.LONG }]"
								type="button"
								@click="workType = WORK_TYPES.LONG"
							>
								长篇
							</button>
							<button
								:class="['segment', { active: workType === WORK_TYPES.COLLECTION }]"
								type="button"
								@click="workType = WORK_TYPES.COLLECTION"
							>
								小说集
							</button>
						</div>
					</div>

					<label v-if="workType === WORK_TYPES.COLLECTION" class="field field-area">
						<span>子作品名称列表</span>
						<textarea
							v-model="subworksInput"
							placeholder="每行一个名字, 顺序即生成顺序"
							rows="6"
						/>
					</label>

					<label class="field">
						<span>发布者</span>
						<input v-model="publisherInput" placeholder="可以留空" type="text">
					</label>

					<label class="field field-area">
						<span>Rights 版权信息</span>
						<textarea
							v-model="rightsInput"
							placeholder="可以留空"
							rows="3"
						/>
					</label>

					<div class="field readonly-field">
						<span>Language</span>
						<div class="readonly-value">zh-CN</div>
					</div>

					<div class="action-row">
						<button :disabled="!canGenerate" class="primary-button" type="submit">
							{{ isGenerating ? '正在生成...' : '生成并下载 EPUB' }}
						</button>
						<p class="action-hint">
							{{ actionHint }}
						</p>
					</div>
				</form>
			</section>

			<section class="panel summary-panel">
				<div class="panel-header">
					<h2>规划结果</h2>
					<p>这里展示 zip 解析后的输入顺序, 封面选择和忽略项.</p>
				</div>

				<div v-if="isLoadingArchive" class="empty-state">
					正在解析 zip 文件.
				</div>

				<div v-else-if="!archiveState" class="empty-state">
					还没有加载 zip 文件.
				</div>

				<template v-else>
					<div class="stats-grid">
						<article class="stat-card">
							<span>文件总数</span>
							<strong>{{ archiveState.files.length }}</strong>
						</article>
						<article class="stat-card">
							<span>章节输入数</span>
							<strong>{{ planState.inputFiles.length }}</strong>
						</article>
						<article class="stat-card">
							<span>封面</span>
							<strong>{{ planState.coverPath || '未提供' }}</strong>
						</article>
						<article class="stat-card">
							<span>忽略的深层文件</span>
							<strong>{{ planState.ignoredDeepPaths.length }}</strong>
						</article>
					</div>

					<div class="detail-block">
						<h3>输入顺序</h3>
						<ol class="path-list ordered">
							<li v-for="inputPath in planState.inputFiles" :key="inputPath">
								<code>{{ inputPath }}</code>
							</li>
						</ol>
					</div>

					<div v-if="archiveState.topLevelDirectories.length" class="detail-block">
						<h3>Zip 顶层目录</h3>
						<ul class="path-list compact">
							<li v-for="directoryName in archiveState.topLevelDirectories" :key="directoryName">
								<code>{{ directoryName }}</code>
							</li>
						</ul>
					</div>

					<div v-if="planState.planWarnings.length" class="detail-block warning-block">
						<h3>规划警告</h3>
						<ul class="message-list">
							<li v-for="warningMessage in planState.planWarnings" :key="warningMessage">
								{{ warningMessage }}
							</li>
						</ul>
					</div>

					<div v-if="planState.ignoredDeepPaths.length" class="detail-block">
						<h3>已忽略的深层路径</h3>
						<ul class="path-list compact">
							<li v-for="ignoredPath in planState.ignoredDeepPaths" :key="ignoredPath">
								<code>{{ ignoredPath }}</code>
							</li>
						</ul>
					</div>
				</template>
			</section>
		</main>

		<section class="panel output-panel">
			<div class="panel-header">
				<h2>生成日志</h2>
				<p>这里显示 pandoc-wasm 的结果, 包括 stderr 和结构化 warnings.</p>
			</div>

			<div v-if="statusMessage" :class="['status-banner', statusTone]">
				{{ statusMessage }}
			</div>

			<div class="log-grid">
				<article class="detail-block">
					<h3>结构化 Warnings</h3>
					<div v-if="!conversionWarnings.length" class="empty-substate">
						暂无 warnings.
					</div>
					<ul v-else class="message-list">
						<li v-for="warningMessage in conversionWarnings" :key="warningMessage">
							{{ warningMessage }}
						</li>
					</ul>
				</article>

				<article class="detail-block">
					<h3>stderr</h3>
					<pre class="log-output">{{ stderrOutput || '暂无 stderr 输出.' }}</pre>
				</article>
			</div>
		</section>
        
		<section class="panel guide-panel">
			<div class="panel-header">
				<h2>Zip 包格式要求</h2>
				<p>先看这里再上传文件. 这一区只总结当前页面实际需要的结构约束和两个常见示例.</p>
			</div>

			<div class="guide-grid">
				<article class="guide-card">
					<p class="guide-kicker">简短介绍</p>
					<h3>上传前先确认这 4 条</h3>
					<ul class="guide-list">
						<li v-for="rule in formatRules" :key="rule">
							{{ rule }}
						</li>
					</ul>
				</article>

				<article class="guide-card example-card">
					<p class="guide-kicker">长篇示例</p>
					<h3>单一 src 目录</h3>
					<p class="example-note">适用于一本书只有一条正文主线的 zip 包.</p>
					<pre class="tree-block">{{ longFormTreeExample }}</pre>
				</article>

				<article class="guide-card example-card">
					<p class="guide-kicker">小说集示例</p>
					<h3>按子目录收录作品</h3>
					<p class="example-note">页面里填写哪些子作品名, 程序就只读取哪些同名目录.</p>
					<pre class="tree-block">{{ collectionTreeExample }}</pre>
				</article>
			</div>
		</section>
	</div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import JSZip from 'jszip'
import { convert } from 'pandoc-wasm'
import shieldContent from '../resource/shield.md?raw'

const RESERVED_ROOT_FILES = new Set(['organize.md', 'meta.md', 'base.md'])
const COVER_PRIORITY = ['jpg', 'jpeg', 'png', 'webp']
const EPUB_METADATA_FILE = '__webdoc_epub-metadata.xml'
const FLAT_FILE_PREFIX = '__webdoc_file_'
const WORK_TYPES = {
	LONG: '长篇',
	COLLECTION: '小说集',
}
const formatRules = [
	'只接受 zip 文件, 不支持直接上传单个 md 文件.',
	'顶层可以放 organize.md, meta.md, base.md, 以及 cover 前缀图片(jpg, jpeg, png, webp), 其他顶层 md 会按路径排序接在保留文件后面.',
	'长篇模式只读取 src/ 下的 markdown, 最多允许两层子目录, 更深的文件会被忽略.',
	'小说集模式按你填写的子作品名称顺序读取 ./{name}/ 下的 meta.md, base.md, 以及 src.md 或 src/.',
]
const longFormTreeExample = `$ tree
.
├── cover.jpg
├── organize.md
├── base.md
├── meta.md
└── src
	├── chapter01.md
	├── chapter02.md
	├── chapter03.md
	├── chapter04.md
	├── chapter05.md
	├── chapter06.md
	├── chapter07.md
	├── chapter08.md
	├── chapter09.md
	├── chapter10.md
	├── chapter11.md
	├── chapter12.md
	├── chapter13.md
	├── chapter14.md
	├── chapter15.md
	├── chapter16.md
	├── chapter17.md
	├── chapter18.md
	├── chapter19.md
	├── chapter20.md
	├── chapter21.md
	├── chapter22.md
	├── chapter23.md
	├── chapter24.md
	├── chapter25.md
	├── chapter26.md
	├── chapter27.md
	├── chapter28.md
	├── chapter29.md
	├── chapter30.md
	├── chapter31.md
	└── chapter32.md`
const collectionTreeExample = `$ tree
.
├── cover.png
├── organize.md
├── base.md
├── meta.md
├── short-novel1
│   ├── meta.md
│   ├── base.md
│   └── src.md
├── short-novel2
│   ├── meta.md
│   ├── base.md
│   └── src
│       ├── chapter01.md
│       └── chapter02.md
└── short-novel3
	├── meta.md
	├── base.md
	└── src.md`

const commitHash = typeof __WEBDOC_COMMIT_HASH__ === 'string' ? __WEBDOC_COMMIT_HASH__ : ''

const bookTitle = ref('')
const authorsInput = ref('')
const workType = ref(WORK_TYPES.LONG)
const subworksInput = ref('')
const publisherInput = ref('')
const rightsInput = ref('')

const archiveState = ref(null)
const planState = ref(createEmptyPlan())
const isLoadingArchive = ref(false)
const isGenerating = ref(false)
const statusMessage = ref('')
const statusTone = ref('neutral')
const conversionWarnings = ref([])
const stderrOutput = ref('')
const runtimeLabel = ref(formatUtc8(new Date()))

let runtimeTimer = null

const authors = computed(() => authorsInput.value
	.split(',')
	.map((authorName) => authorName.trim())
	.filter(Boolean))

const subworkNames = computed(() => subworksInput.value
	.split(/\r?\n/)
	.map((entryName) => entryName.trim())
	.filter(Boolean))

const actionHint = computed(() => {
	if (!archiveState.value) {
		return '请先上传 zip 文件.'
	}
	if (!bookTitle.value.trim()) {
		return '书名不能为空.'
	}
	if (!authors.value.length) {
		return '请至少填写一个作者.'
	}
	if (!planState.value.inputFiles.length) {
		return '当前规划没有可用于生成的 markdown 输入.'
	}
	return '准备就绪, 点击按钮后会直接生成并下载 EPUB.'
})

const canGenerate = computed(() => Boolean(
	archiveState.value
	&& bookTitle.value.trim()
	&& authors.value.length
	&& planState.value.inputFiles.length
	&& !isGenerating.value
))

watch([workType, subworksInput], () => {
	if (!archiveState.value) {
		return
	}
	planState.value = buildPlan(archiveState.value, {
		workType: workType.value,
		subworkNames: subworkNames.value,
	})
})

onMounted(() => {
	runtimeTimer = window.setInterval(() => {
		runtimeLabel.value = formatUtc8(new Date())
	}, 1000)
})

onBeforeUnmount(() => {
	if (runtimeTimer) {
		window.clearInterval(runtimeTimer)
	}
})

function createEmptyPlan() {
	return {
		coverPath: '',
		ignoredDeepPaths: [],
		inputFiles: [],
		planWarnings: [],
	}
}

function formatUtc8(date) {
	const formatter = new Intl.DateTimeFormat('en-GB', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
		timeZone: 'Asia/Shanghai',
	})
	const parts = formatter.formatToParts(date)
	const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
	return `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`
}

function normalizePath(rawPath) {
	return rawPath
		.replace(/\\/g, '/')
		.replace(/^\.\//, '')
		.replace(/^\//, '')
}

function getPathSegments(filePath) {
	return normalizePath(filePath).split('/').filter(Boolean)
}

function isMarkdownFile(filePath) {
	return normalizePath(filePath).toLowerCase().endsWith('.md')
}

function getExtension(filePath) {
	const normalizedPath = normalizePath(filePath)
	const extensionIndex = normalizedPath.lastIndexOf('.')
	if (extensionIndex === -1) {
		return ''
	}
	return normalizedPath.slice(extensionIndex + 1).toLowerCase()
}

function comparePaths(leftPath, rightPath) {
	return leftPath.localeCompare(rightPath, 'en')
}

function isAllowedSrcMarkdown(filePath, prefixPath) {
	if (!isMarkdownFile(filePath)) {
		return false
	}
	const normalizedPrefix = normalizePath(prefixPath)
	const normalizedPath = normalizePath(filePath)
	if (!normalizedPath.startsWith(`${normalizedPrefix}/`)) {
		return false
	}
	const relativePath = normalizedPath.slice(normalizedPrefix.length + 1)
	const relativeSegments = relativePath.split('/').filter(Boolean)
	return relativeSegments.length >= 1 && relativeSegments.length <= 3
}

function chooseCoverFile(files) {
	const groupedFiles = new Map(COVER_PRIORITY.map((extensionName) => [extensionName, null]))
	for (const fileInfo of files) {
		const segments = getPathSegments(fileInfo.path)
		if (segments.length !== 1) {
			continue
		}
		const fileName = segments[0]
		const extensionName = getExtension(fileName)
		if (!fileName.toLowerCase().startsWith('cover')) {
			continue
		}
		if (!groupedFiles.has(extensionName)) {
			continue
		}
		if (!groupedFiles.get(extensionName)) {
			groupedFiles.set(extensionName, fileInfo.path)
		}
	}
	for (const extensionName of COVER_PRIORITY) {
		const matchedPath = groupedFiles.get(extensionName)
		if (matchedPath) {
			return matchedPath
		}
	}
	return ''
}

function collectAllowedSrcFiles(files, prefixPath, ignoredDeepPathSet) {
	const normalizedPrefix = normalizePath(prefixPath)
	const matchedFiles = []
	for (const fileInfo of files) {
		const normalizedPath = normalizePath(fileInfo.path)
		if (!normalizedPath.startsWith(`${normalizedPrefix}/`)) {
			continue
		}
		if (!isMarkdownFile(normalizedPath)) {
			continue
		}
		if (isAllowedSrcMarkdown(normalizedPath, normalizedPrefix)) {
			matchedFiles.push(normalizedPath)
		} else {
			ignoredDeepPathSet.add(normalizedPath)
		}
	}
	return matchedFiles.sort(comparePaths)
}

function buildPlan(snapshot, options) {
	const ignoredDeepPathSet = new Set()
	const planWarnings = []
	const selectedFiles = ['__webdoc_shield.md']
	const fileByPath = snapshot.fileByPath

	const rootMarkdownFiles = snapshot.files
		.map((fileInfo) => fileInfo.path)
		.filter((filePath) => getPathSegments(filePath).length === 1)
		.filter((filePath) => isMarkdownFile(filePath))

	const rootExtraMarkdownFiles = rootMarkdownFiles
		.filter((filePath) => !RESERVED_ROOT_FILES.has(filePath))
		.sort(comparePaths)

	for (const reservedFile of ['organize.md', 'meta.md', 'base.md']) {
		if (fileByPath.has(reservedFile)) {
			selectedFiles.push(reservedFile)
		}
	}

	selectedFiles.push(...rootExtraMarkdownFiles)

	const coverPath = chooseCoverFile(snapshot.files)

	if (options.workType === WORK_TYPES.LONG) {
		selectedFiles.push(...collectAllowedSrcFiles(snapshot.files, 'src', ignoredDeepPathSet))
	} else {
		for (const subworkName of options.subworkNames) {
			const normalizedName = normalizePath(subworkName)
			if (!snapshot.topLevelDirectories.includes(normalizedName)) {
				planWarnings.push(`未找到子作品目录 ${normalizedName}, 已跳过.`)
				continue
			}
			const subworkMetaPath = `${normalizedName}/meta.md`
			const subworkBasePath = `${normalizedName}/base.md`
			const subworkSrcPath = `${normalizedName}/src.md`
			if (fileByPath.has(subworkMetaPath)) {
				selectedFiles.push(subworkMetaPath)
			} else {
				planWarnings.push(`${normalizedName} 缺少 meta.md, 已忽略该文件.`)
			}
			if (fileByPath.has(subworkBasePath)) {
				selectedFiles.push(subworkBasePath)
			} else {
				planWarnings.push(`${normalizedName} 缺少 base.md, 已忽略该文件.`)
			}
			if (fileByPath.has(subworkSrcPath)) {
				selectedFiles.push(subworkSrcPath)
				continue
			}
			const nestedSrcFiles = collectAllowedSrcFiles(snapshot.files, `${normalizedName}/src`, ignoredDeepPathSet)
			if (nestedSrcFiles.length) {
				selectedFiles.push(...nestedSrcFiles)
			} else {
				planWarnings.push(`${normalizedName} 缺少 src.md 和 src 目录中的有效 markdown 文件.`)
			}
		}
	}

	return {
		coverPath,
		ignoredDeepPaths: Array.from(ignoredDeepPathSet).sort(comparePaths),
		inputFiles: selectedFiles,
		planWarnings,
	}
}

async function createArchiveSnapshot(file) {
	const zipArchive = await JSZip.loadAsync(file)
	const files = []
	let orderIndex = 0
	zipArchive.forEach((rawPath, zipEntry) => {
		if (zipEntry.dir) {
			return
		}
		const normalizedPath = normalizePath(rawPath)
		files.push({
			entry: zipEntry,
			index: orderIndex,
			path: normalizedPath,
		})
		orderIndex += 1
	})

	const fileByPath = new Map(files.map((fileInfo) => [fileInfo.path, fileInfo]))
	const topLevelDirectories = Array.from(new Set(files
		.map((fileInfo) => getPathSegments(fileInfo.path)[0])
		.filter(Boolean)
		.filter((segmentName) => !fileByPath.has(segmentName))))
		.sort(comparePaths)

	return {
		fileByPath,
		files,
		topLevelDirectories,
		zipArchive,
	}
}

async function handleArchiveChange(event) {
	const selectedFile = event.target.files?.[0]
	archiveState.value = null
	planState.value = createEmptyPlan()
	conversionWarnings.value = []
	stderrOutput.value = ''
	statusMessage.value = ''

	if (!selectedFile) {
		return
	}

	isLoadingArchive.value = true
	try {
		const snapshot = await createArchiveSnapshot(selectedFile)
		archiveState.value = snapshot
		planState.value = buildPlan(snapshot, {
			workType: workType.value,
			subworkNames: subworkNames.value,
		})
		statusTone.value = 'neutral'
		statusMessage.value = `已加载 ${selectedFile.name}, 共发现 ${snapshot.files.length} 个文件.`
	} catch (error) {
		console.error(error)
		statusTone.value = 'error'
		statusMessage.value = 'zip 解析失败, 请确认上传的是有效 zip 文件.'
	} finally {
		isLoadingArchive.value = false
	}
}

function sanitizeFilename(fileName) {
	const normalizedName = fileName.trim().replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
	return normalizedName || 'book'
}

function escapeXml(value) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}

function createEpubMetadataContent(gitCommitHash) {
	if (!gitCommitHash) {
		return ''
	}
	const commitIdentifier = `urn:webdoc:git:${gitCommitHash}`
	return `<dc:identifier id="WebdocCommitHash">${escapeXml(commitIdentifier)}</dc:identifier>`
}


function createFlattenedFileName(fileInfo) {
	const extension = getExtension(fileInfo.path)
	const fileNumber = String(fileInfo.index + 1).padStart(4, '0')
	return `${FLAT_FILE_PREFIX}${fileNumber}${extension ? `.${extension}` : ''}`
}

async function buildPandocFiles(snapshot, plan) {
	const loadedFiles = {
		'__webdoc_shield.md': shieldContent,
	}
	const flattenedPaths = new Map([
		['__webdoc_shield.md', '__webdoc_shield.md'],
	])
	const requiredPaths = new Set(plan.inputFiles.filter((filePath) => filePath !== '__webdoc_shield.md'))
	if (plan.coverPath) {
		requiredPaths.add(plan.coverPath)
	}
	await Promise.all(Array.from(requiredPaths).map(async (originalPath) => {
		const fileInfo = snapshot.fileByPath.get(originalPath)
		if (!fileInfo) {
			throw new Error(`zip 中缺少规划所需文件: ${originalPath}`)
		}
		const flattenedPath = createFlattenedFileName(fileInfo)
		loadedFiles[flattenedPath] = await fileInfo.entry.async('blob')
		flattenedPaths.set(originalPath, flattenedPath)
	}))
	return {
		flattenedPaths,
		loadedFiles,
	}
}

function normalizeWarningMessage(warningEntry) {
	if (typeof warningEntry === 'string') {
		return warningEntry
	}
	if (warningEntry && typeof warningEntry === 'object') {
		if (warningEntry.message) {
			return warningEntry.message
		}
		return JSON.stringify(warningEntry)
	}
	return String(warningEntry)
}

function triggerDownload(blob, fileName) {
	const objectUrl = URL.createObjectURL(blob)
	const anchorElement = document.createElement('a')
	anchorElement.href = objectUrl
	anchorElement.download = fileName
	document.body.appendChild(anchorElement)
	anchorElement.click()
	anchorElement.remove()
	URL.revokeObjectURL(objectUrl)
}

async function handleGenerate() {
	if (!canGenerate.value || !archiveState.value) {
		return
	}
	isGenerating.value = true
	statusTone.value = 'neutral'
	statusMessage.value = '正在调用 pandoc-wasm 生成 EPUB.'
	conversionWarnings.value = []
	stderrOutput.value = ''

	try {
		const outputFileName = `${sanitizeFilename(bookTitle.value)}.epub`
		const { flattenedPaths, loadedFiles: pandocFiles } = await buildPandocFiles(
			archiveState.value,
			planState.value,
		)
		const epubMetadataContent = createEpubMetadataContent(commitHash)
		const metadata = {
			author: authors.value,
			lang: 'zh-CN',
			language: 'zh-CN',
			publisher: publisherInput.value.trim(),
			rights: rightsInput.value.trim(),
			title: bookTitle.value.trim(),
		}
		const pandocOptions = {
			from: 'markdown+smart',
			to: 'epub3',
			'file-scope': true,
			'input-files': planState.value.inputFiles
				.map((inputPath) => flattenedPaths.get(inputPath) ?? inputPath),
			metadata,
			'output-file': outputFileName,
		}

		if (epubMetadataContent) {
			pandocFiles[EPUB_METADATA_FILE] = epubMetadataContent
			pandocOptions['epub-metadata'] = EPUB_METADATA_FILE
		}

		if (planState.value.coverPath) {
			pandocOptions['epub-cover-image'] = flattenedPaths.get(planState.value.coverPath)
				?? planState.value.coverPath
		}

		const result = await convert(pandocOptions, null, pandocFiles)
		conversionWarnings.value = result.warnings.map(normalizeWarningMessage)
		stderrOutput.value = result.stderr.trim()

		const outputBlob = result.files[outputFileName]
		if (!outputBlob) {
			throw new Error('pandoc-wasm 没有返回 output-file 对应的结果文件.')
		}

		triggerDownload(outputBlob, outputFileName)

		statusTone.value = result.stderr.trim() ? 'warning' : 'success'
		statusMessage.value = `已生成 ${outputFileName}, warnings 数量 ${conversionWarnings.value.length}.`
	} catch (error) {
		console.error(error)
		statusTone.value = 'error'
		statusMessage.value = error instanceof Error
			? `生成失败: ${error.message}`
			: '生成失败, 请查看控制台和 stderr 输出.'
	} finally {
		isGenerating.value = false
	}
}
</script>
