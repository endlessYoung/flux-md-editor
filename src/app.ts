import { FluxEditor } from "./core/FluxEditor"
import { MarkdownPreview } from "./preview/MarkdownPreview"
import "./style/editor.css"

let syncScrollEnabled = true
let slashMenuEnabled = true
let imagePasteEnabled = true
let currentLayout: "split" | "edit" | "preview" = "split"
let autoSaveEnabled = true
let showStatsEnabled = true
let currentFileName: string | null = null
let lastDraftContent: string | null = null

const DEFAULT_GUIDE_MD = `# FluxMDEditor 使用指南

> 一份覆盖常用 Markdown 语法的速查手册，建议先随便改一改感受一下。

## 1. 标题（Heading）

# H1 标题
## H2 标题
### H3 标题
#### H4 标题

---

## 2. 文本样式（Inline）

普通文本，支持 **加粗**、_斜体_、**_加粗+斜体_**、~~删除线~~、以及 \`行内代码\`。

也可以组合使用，比如：**函数 \`render()\` 非常关键**。

---

## 3. 列表（List）

### 无序列表

- 列表项 1
- 列表项 2
  - 子项 2.1
  - 子项 2.2

### 有序列表

1. 第一步
2. 第二步
3. 第三步

---

## 4. 引用（Blockquote）

> 这是一个引用块，可以用来强调一句话或一段话。
> 支持多行显示。

---

## 5. 链接与图片（Links & Images）

行内链接示例：[访问 FluxMDEditor 仓库](https://github.com/)  

图片示例（请替换为你自己的图片地址）：

![示例图片](https://images.pexels.com/photos/2706379/pexels-photo-2706379.jpeg)

---

## 6. 表格（Table）

| 功能模块 | 说明             | 状态   |
| -------- | ---------------- | ------ |
| 编辑器   | CodeMirror 编辑  | ✅ 已完成 |
| 预览区   | markdown-it 渲染 | ✅ 已完成 |
| 代码高亮 | highlight.js     | ✅ 已完成 |
| 公式     | KaTeX            | ✅ 已完成 |
| Mermaid  | 流程图 / 时序图 | ✅ 已完成 |

---

## 7. 代码块（Code Block）

### 普通代码块

\`\`\`ts
function hello(name: string) {
  console.log(\`Hello, \${name}\`)
}

hello("FluxMDEditor")
\`\`\`

### 指定语言高亮

\`\`\`json
{
  "name": "FluxMDEditor",
  "features": ["Markdown", "Code Highlight", "KaTeX", "Mermaid"]
}
\`\`\`

---

## 8. Mermaid 图（流程图示例）

使用 \`mermaid\` 语言块时，会自动渲染成图形：

\`\`\`mermaid
graph TD
  A[输入 Markdown] --> B[FluxEditor]
  B --> C[Markdown-It 渲染]
  C --> D[Preview 预览面板]
  D --> E{满意吗?}
  E -->|是| F[完成]
  E -->|否| B
\`\`\`

---

## 9. 数学公式（KaTeX）

行内公式示例：圆的面积公式为 $S = \\pi r^2$。  

块级公式示例：

$$
\\int_{0}^{2\\pi} \\sin(x) \\, dx = 0
$$

---

## 10. 目录（TOC）占位（可选）

下面是一种常见的 TOC 写法（需要在渲染逻辑中开启相应插件，这里已启用）：

[[toc]]

---

欢迎根据自己的需求删除/修改这份指南，开始真正写你的文档吧 🎯
`

export interface FluxMdAppInstance {
    getMarkdown: () => string
    setMarkdown: (md: string) => void
    destroy: () => void
}

export function createFluxMdApp(): FluxMdAppInstance {
    const editorEl = document.getElementById("editor")
    const previewEl = document.getElementById("preview")

    if (!editorEl || !previewEl) {
        throw new Error("FluxMDEditor: missing #editor or #preview element")
    }

    const preview = new MarkdownPreview(previewEl)

    const draft = window.localStorage.getItem("flux-draft")
    lastDraftContent = draft

    const editor = new FluxEditor({
        container: editorEl,
        initialValue: draft || DEFAULT_GUIDE_MD,
        onChange(md) {
            preview.render(md)
            if (autoSaveEnabled) {
                try {
                    window.localStorage.setItem("flux-draft", md)
                    lastDraftContent = md
                } catch {
                    // ignore
                }
            }
            if (showStatsEnabled) {
                updateStatusBar(md)
            }
        }
    })

    setupToolbar(editor)
    setupFileActions(editor, preview)
    setupThemeToggle()
    setupSplitterV2()
    setupSlashCommands(editor, editorEl)
    setupImagePaste(editor)
    setupScrollSync(editor, previewEl)
    setupBackToTop(editor, previewEl)
    setupSettings()
    setupLayoutToggle()
    setupTocToggle()

    preview.render(editor.getMarkdown())
    if (showStatsEnabled) {
        updateStatusBar(editor.getMarkdown())
    }

    return {
        getMarkdown: () => editor.getMarkdown(),
        setMarkdown(md: string) {
            editor.setMarkdown(md)
            preview.render(md)
            if (showStatsEnabled) updateStatusBar(md)
        },
        destroy() {
            // TODO: 日后可以在这里集中清理事件监听等资源
        }
    }
}

function setupToolbar(editor: FluxEditor) {
    const toolbar = document.getElementById("editor-toolbar")
    if (!toolbar) return

    const buttons: { label: string; title: string; onClick: () => void }[] = [
        {
            label: "H1",
            title: "插入一级标题",
            onClick: () => editor.insert("\n# 标题\n")
        },
        {
            label: "H2",
            title: "插入二级标题",
            onClick: () => editor.insert("\n## 小节标题\n")
        },
        {
            label: "List",
            title: "插入无序列表",
            onClick: () => editor.insert("\n- 列表项 1\n- 列表项 2\n")
        },
        {
            label: "Code",
            title: "插入代码块",
            onClick: () => editor.insert('\n```ts\nconsole.log("Hello FluxMDEditor")\n```\n')
        },
        {
            label: "Mermaid",
            title: "插入 mermaid 流程图示例",
            onClick: () =>
                editor.insert(
                    "\n```mermaid\ngraph TD\n  A[开始] --> B[编辑 Markdown]\n  B --> C{预览是否满意?}\n  C -->|是| D[完成]\n  C -->|否| B\n```\n"
                )
        },
        {
            label: "Table",
            title: "插入表格示例",
            onClick: () =>
                editor.insert(
                    "\n| 功能 | 说明 |\n| ---- | ---- |\n| 预览 | 实时渲染 Markdown |\n| 代码高亮 | 使用 highlight.js |\n"
                )
        }
    ]

    for (const config of buttons) {
        const btn = document.createElement("button")
        btn.className = "toolbar-btn"
        btn.textContent = config.label
        btn.title = config.title
        btn.addEventListener("click", (event) => {
            event.preventDefault()
            config.onClick()
        })
        toolbar.appendChild(btn)
    }
}

function setupFileActions(editor: FluxEditor, preview: MarkdownPreview) {
    const openBtn = document.getElementById("file-open-btn")
    const saveBtn = document.getElementById("file-save-btn")
    const exportBtn = document.getElementById("file-export-btn")

    if (!openBtn && !saveBtn && !exportBtn) return

    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = ".md,text/markdown,text/plain"
    fileInput.style.display = "none"
    document.body.appendChild(fileInput)

    fileInput.addEventListener("change", () => {
        const file = fileInput.files?.[0]
        if (!file) return

        currentFileName = file.name

        const reader = new FileReader()
        reader.onload = () => {
            const text = typeof reader.result === "string" ? reader.result : ""
            if (!text) return
            editor.setMarkdown(text)
        }
        reader.readAsText(file)
    })

    openBtn?.addEventListener("click", (event) => {
        event.preventDefault()
        fileInput.click()
    })

    saveBtn?.addEventListener("click", (event) => {
        event.preventDefault()

        const md = editor.getMarkdown()
        const blob = new Blob([md], { type: "text/markdown;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = currentFileName || "FluxMDEditor-note.md"
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
    })

    exportBtn?.addEventListener("click", (event) => {
        event.preventDefault()

        const md = editor.getMarkdown()
        const title = currentFileName || "FluxMDEditor 文档"
        const html = preview.exportHtmlDocument(md, title)
        const blob = new Blob([html], { type: "text/html;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = (currentFileName || "FluxMDEditor-note.md").replace(/\.md$/i, "") + ".html"
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
    })
}

function setupThemeToggle() {
    const toggle = document.getElementById("theme-toggle")
    if (!toggle) return

    const iconEl = toggle.querySelector<HTMLElement>(".theme-toggle-icon")

    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches
    const stored = window.localStorage.getItem("flux-theme")
    const initialDark = stored ? stored === "dark" : prefersDark

    applyTheme(initialDark)

    toggle.addEventListener("click", () => {
        const isDark = document.documentElement.classList.toggle("flux-theme-dark")
        window.localStorage.setItem("flux-theme", isDark ? "dark" : "light")
        if (iconEl) {
            iconEl.innerHTML = isDark
                ? '<i class="fa-solid fa-moon"></i>'
                : '<i class="fa-solid fa-sun"></i>'
        }
    })

    if (iconEl) {
        iconEl.innerHTML = initialDark
            ? '<i class="fa-solid fa-moon"></i>'
            : '<i class="fa-solid fa-sun"></i>'
    }
}

function applyTheme(isDark: boolean) {
    if (isDark) {
        document.documentElement.classList.add("flux-theme-dark")
    } else {
        document.documentElement.classList.remove("flux-theme-dark")
    }
}

function setupSplitterV2() {
    const app = document.querySelector<HTMLElement>(".app")
    const editorPanel = document.querySelector<HTMLElement>(".editor-panel")
    const preview = document.getElementById("preview") as HTMLElement | null
    const splitter = document.getElementById("splitter")

    if (!app || !editorPanel || !preview || !splitter) return

    let dragging = false
    let startX = 0
    let startEditorWidth = 0
    let totalWidth = 0

    splitter.addEventListener("mousedown", (event) => {
        event.preventDefault()

        const appRect = app.getBoundingClientRect()
        const editorRect = editorPanel.getBoundingClientRect()

        dragging = true
        startX = event.clientX
        startEditorWidth = editorRect.width
        totalWidth = appRect.width

        document.body.classList.add("is-resizing")
    })

    window.addEventListener("mousemove", (event) => {
        if (!dragging) return
        if (!totalWidth) return

        const delta = event.clientX - startX
        const minWidth = totalWidth * 0.2

        const tocVisible = !document.body.classList.contains("flux-toc-hidden")
        const toc = document.getElementById("toc-panel")
        const tocWidth = tocVisible && toc ? toc.getBoundingClientRect().width : 0
        const splitterWidth = splitter.getBoundingClientRect().width

        const availableForPanels = totalWidth - tocWidth - splitterWidth
        if (availableForPanels <= 0) return

        const maxRatio = tocVisible ? 0.6 : 0.7
        const maxWidth = availableForPanels * maxRatio

        let nextWidth = startEditorWidth + delta
        nextWidth = Math.max(minWidth, Math.min(maxWidth, nextWidth))

        const minPreviewWidth = 320
        let nextPreviewWidth = availableForPanels - nextWidth
        if (nextPreviewWidth < minPreviewWidth) {
            nextPreviewWidth = minPreviewWidth
            nextWidth = availableForPanels - minPreviewWidth
        }

        const editorPercent = (nextWidth / totalWidth) * 100
        const previewPercent = (nextPreviewWidth / totalWidth) * 100

        editorPanel.style.flex = `0 0 ${editorPercent}%`
        preview.style.flex = `0 0 ${previewPercent}%`
    })

    window.addEventListener("mouseup", () => {
        if (!dragging) return
        dragging = false
        document.body.classList.remove("is-resizing")
    })
}

type SlashCommand = {
    label: string
    description: string
    insert: () => void
}

function setupSlashCommands(editor: FluxEditor, editorContainer: HTMLElement) {
    const commands: SlashCommand[] = [
        {
            label: "H1 标题",
            description: "插入一级标题",
            insert: () => editor.insert("\n# 新的章节标题\n")
        },
        {
            label: "H2 标题",
            description: "插入二级标题",
            insert: () => editor.insert("\n## 小节标题\n")
        },
        {
            label: "无序列表",
            description: "快速创建列表结构",
            insert: () => editor.insert("\n- 列表项 1\n- 列表项 2\n")
        },
        {
            label: "代码块",
            description: "插入多行代码区域",
            insert: () => editor.insert('\n```ts\nconsole.log("Hello FluxMDEditor")\n```\n')
        },
        {
            label: "Mermaid 图",
            description: "插入 mermaid 流程图示例",
            insert: () =>
                editor.insert(
                    "\n```mermaid\ngraph TD\n  A[开始] --> B[编辑 Markdown]\n  B --> C{预览是否满意?}\n  C -->|是| D[完成]\n  C -->|否| B\n```\n"
                )
        },
        {
            label: "引用块",
            description: "插入一段高亮引用",
            insert: () => editor.insert("\n> 这是一段引用内容，可以用来强调说明。\n")
        },
        {
            label: "任务列表",
            description: "插入一个简单的 Todo 列表",
            insert: () => editor.insert("\n- [ ] 待完成事项 1\n- [x] 已完成事项 2\n")
        },
        {
            label: "分割线",
            description: "插入一条水平分割线",
            insert: () => editor.insert("\n---\n")
        }
    ]

    const menu = document.createElement("div")
    menu.className = "slash-menu"

    const list = document.createElement("div")
    list.className = "slash-menu-list"

    commands.forEach((cmd, index) => {
        const item = document.createElement("button")
        item.className = "slash-menu-item"
        if (index === 0) item.classList.add("is-active")
        item.type = "button"
        item.dataset.index = String(index)
        item.innerHTML = `
  <span class="slash-menu-item-label">${cmd.label}</span>
  <span class="slash-menu-item-desc">${cmd.description}</span>
`
        item.addEventListener("click", (event) => {
            event.preventDefault()
            cmd.insert()
            hideMenu()
        })
        list.appendChild(item)
    })

    menu.appendChild(list)
    document.body.appendChild(menu)

    let open = false
    let activeIndex = 0

    function openMenu() {
        if (open) return
        open = true
        const rect = editorContainer.getBoundingClientRect()
        menu.style.left = `${rect.left + 16}px`
        menu.style.top = `${rect.top + 56}px`
        menu.classList.add("is-open")
    }

    function hideMenu() {
        if (!open) return
        open = false
        menu.classList.remove("is-open")
    }

    function updateActive(next: number) {
        const items = menu.querySelectorAll<HTMLButtonElement>(".slash-menu-item")
        if (!items.length) return
        items.forEach((el) => el.classList.remove("is-active"))
        const clamped = (next + items.length) % items.length
        activeIndex = clamped
        items[clamped].classList.add("is-active")
    }

    editorContainer.addEventListener("keydown", (event) => {
        if (!slashMenuEnabled) return

        if (event.key === "/" && !open) {
            event.preventDefault()
            openMenu()
            return
        }

        if (!open) return

        if (event.key === "Escape") {
            hideMenu()
            return
        }

        if (event.key === "ArrowDown") {
            event.preventDefault()
            updateActive(activeIndex + 1)
            return
        }

        if (event.key === "ArrowUp") {
            event.preventDefault()
            updateActive(activeIndex - 1)
            return
        }

        if (event.key === "Enter") {
            event.preventDefault()
            const cmd = commands[activeIndex]
            cmd.insert()
            hideMenu()
        }
    })
}

function setupImagePaste(editor: FluxEditor) {
    const dom = editor.getDom()

    dom.addEventListener("paste", (event: ClipboardEvent) => {
        if (!imagePasteEnabled) return

        const items = event.clipboardData?.items
        if (!items) return

        const images: File[] = []
        for (const item of items) {
            if (item.kind === "file") {
                const file = item.getAsFile()
                if (file && file.type.startsWith("image/")) {
                    images.push(file)
                }
            }
        }

        if (!images.length) return
        event.preventDefault()

        images.forEach((file) => {
            const reader = new FileReader()
            reader.onload = () => {
                const result = reader.result
                if (typeof result === "string") {
                    editor.insert(`\n![粘贴图片](${result})\n`)
                }
            }
            reader.readAsDataURL(file)
        })
    })
}

function setupScrollSync(editor: FluxEditor, preview: HTMLElement) {
    const scroller = editor.getDom().querySelector(".cm-scroller") as HTMLElement | null
    if (!scroller) return

    scroller.addEventListener("scroll", () => {
        if (!syncScrollEnabled) return

        const maxEditor = scroller.scrollHeight - scroller.clientHeight
        const maxPreview = preview.scrollHeight - preview.clientHeight
        if (maxEditor <= 0 || maxPreview <= 0) return

        const ratio = scroller.scrollTop / maxEditor
        preview.scrollTop = ratio * maxPreview
    })
}

function setupBackToTop(editor: FluxEditor, preview: HTMLElement) {
    const btn = document.getElementById("back-to-top")
    if (!btn) return

    const scroller = editor.getDom().querySelector(".cm-scroller") as HTMLElement | null

    btn.addEventListener("click", () => {
        if (scroller) scroller.scrollTop = 0
        preview.scrollTop = 0
        window.scrollTo({ top: 0, behavior: "smooth" })
    })
}

function setupSettings() {
    const settingsBtn = document.getElementById("settings-toggle")
    if (!settingsBtn) return

    const overlay = document.createElement("div")
    overlay.className = "settings-overlay"

    const panel = document.createElement("div")
    panel.className = "settings-panel"

    panel.innerHTML = `...` // 为简洁起见，这里可以继续从 main.ts 原样剪切你的设置面板 HTML 和逻辑

    // v1 先不完全展开，以你现有 main.ts 为准继续搬运
}

function setupLayoutToggle() {
    const buttons = document.querySelectorAll<HTMLButtonElement>(".layout-toggle")
    if (!buttons.length) return

    const root = document.documentElement

    function apply(layout: "split" | "edit" | "preview") {
        currentLayout = layout
        root.dataset.layout = layout
        buttons.forEach((btn) => {
            btn.classList.toggle("is-active", btn.dataset.layout === layout)
        })
    }

    buttons.forEach((btn) => {
        btn.addEventListener("click", (event) => {
            event.preventDefault()
            const layout = btn.dataset.layout as "split" | "edit" | "preview" | undefined
            if (!layout) return
            apply(layout)
        })
    })

    apply(currentLayout)
}

function setupTocToggle() {
    const btn = document.getElementById("toc-toggle")
    const toc = document.getElementById("toc-panel")
    if (!btn || !toc) return

    btn.addEventListener("click", (event) => {
        event.preventDefault()
        const hidden = document.body.classList.toggle("flux-toc-hidden")
        btn.classList.toggle("is-active", !hidden)
    })
}

function updateStatusBar(markdown: string) {
    const bar = document.getElementById("status-bar")
    if (!bar) return

    if (!showStatsEnabled) {
        bar.textContent = ""
        return
    }

    const plain = markdown
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`[^`]*`/g, "")
        .replace(/!\[[^\]]*]\([^)]*\)/g, "")
        .replace(/\[[^\]]*]\([^)]*\)/g, "")
        .replace(/[#>*\-]+/g, "")
        .replace(/\s+/g, " ")
        .trim()

    const length = plain.length
    const words = length
    const minutes = Math.max(1, Math.round(length / 500))

    let statusText = ""
    if (!autoSaveEnabled) {
        statusText = "自动保存已关闭"
    } else if (lastDraftContent !== null && lastDraftContent === markdown) {
        statusText = "草稿已自动保存"
    } else {
        statusText = "有未保存更改"
    }

    bar.innerHTML = `<span>${words} 字</span><span>预计 ${minutes} 分钟阅读</span><span>${statusText}</span>`
}

