import { FluxEditor } from "./core/FluxEditor"
import { MarkdownPreview } from "./preview/MarkdownPreview"
import "./style/editor.css"

let syncScrollEnabled = true
let slashMenuEnabled = true
let imagePasteEnabled = true
let currentLayout: "split" | "edit" | "preview" = "split"
let autoSaveEnabled = true
let showStatsEnabled = true

const editorEl = document.getElementById("editor")!
const previewEl = document.getElementById("preview")!

const preview = new MarkdownPreview(previewEl)

const draft = window.localStorage.getItem("flux-draft")

const editor = new FluxEditor({
    container: editorEl,
    initialValue: draft || `# FluxMDEditor 使用指南

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
`,

    onChange(md) {

        preview.render(md)
        if (autoSaveEnabled) {
            try {
                window.localStorage.setItem("flux-draft", md)
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
setupThemeToggle()
setupSplitter()
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
            onClick: () => editor.insert("\n```ts\nconsole.log(\"Hello FluxMDEditor\")\n```\n")
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

function setupSplitter() {

    const app = document.querySelector<HTMLElement>(".app")
    const editorPanel = document.querySelector<HTMLElement>(".editor-panel")
    const preview = document.getElementById("preview") as HTMLElement | null
    const splitter = document.getElementById("splitter")

    if (!app || !editorPanel || !preview || !splitter) return

    let dragging = false

    splitter.addEventListener("mousedown", (event) => {

        event.preventDefault()
        dragging = true
        document.body.classList.add("is-resizing")
    })

    window.addEventListener("mousemove", (event) => {

        if (!dragging) return

        const rect = app.getBoundingClientRect()

        const minPercent = 20
        const maxPercent = 80

        const x = event.clientX - rect.left

        const percent = (x / rect.width) * 100

        const clamped = Math.min(maxPercent, Math.max(minPercent, percent))

        editorPanel.style.flex = `0 0 ${clamped}%`

        preview.style.flex = `0 0 ${100 - clamped}%`
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
            insert: () => editor.insert("\n```ts\nconsole.log(\"Hello FluxMDEditor\")\n```\n")
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

            // 仅在行首或空行时触发更自然，这里简化处理：总是打开
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

    panel.innerHTML = `
  <div class="settings-panel-header">
    <div class="settings-panel-title">编辑器设置</div>
  </div>
  <div class="settings-panel-subtitle">调节常用开关，让写作更顺手。</div>

  <div class="settings-section">
    <div class="settings-section-title">体验</div>
    <div class="settings-item">
      <div class="settings-item-label">
        <span class="settings-item-label-main">同步滚动预览</span>
        <span class="settings-item-label-sub">根据编辑区滚动位置同步右侧预览</span>
      </div>
      <button class="settings-switch" data-key="syncScroll" data-checked="true">
        <span class="settings-switch-thumb"></span>
      </button>
    </div>
    <div class="settings-item">
      <div class="settings-item-label">
        <span class="settings-item-label-main">启用「/」命令面板</span>
        <span class="settings-item-label-sub">在编辑区按 / 召唤常用 Markdown 模板</span>
      </div>
      <button class="settings-switch" data-key="slashMenu" data-checked="true">
        <span class="settings-switch-thumb"></span>
      </button>
    </div>
    <div class="settings-item">
      <div class="settings-item-label">
        <span class="settings-item-label-main">粘贴图片自动插入</span>
        <span class="settings-item-label-sub">将剪贴板中的图片转为内嵌链接插入文档</span>
      </div>
      <button class="settings-switch" data-key="imagePaste" data-checked="true">
        <span class="settings-switch-thumb"></span>
      </button>
    </div>
    <div class="settings-item">
      <div class="settings-item-label">
        <span class="settings-item-label-main">自动保存草稿</span>
        <span class="settings-item-label-sub">定期将内容保存到本地，下次可继续编辑</span>
      </div>
      <button class="settings-switch" data-key="autoSave" data-checked="true">
        <span class="settings-switch-thumb"></span>
      </button>
    </div>
    <div class="settings-item">
      <div class="settings-item-label">
        <span class="settings-item-label-main">显示字数与阅读时间</span>
        <span class="settings-item-label-sub">在底部状态栏显示当前文档统计信息</span>
      </div>
      <button class="settings-switch" data-key="showStats" data-checked="true">
        <span class="settings-switch-thumb"></span>
      </button>
    </div>
  </div>

  <div class="settings-section">
    <div class="settings-section-title">其他</div>
    <div class="settings-item">
      <div class="settings-item-label">
        <span class="settings-item-label-main">反馈与建议</span>
        <span class="settings-item-label-sub">觉得好用 / 有想法都可以告诉作者</span>
      </div>
      <a class="settings-feedback-link" href="mailto:fluxmd-feedback@example.com?subject=FluxMDEditor%20反馈">发送邮件</a>
    </div>
  </div>

  <div class="settings-section">
    <div class="settings-section-title">排版</div>
    <div class="settings-item">
      <div class="settings-item-label">
        <span class="settings-item-label-main">编辑区字号</span>
        <span class="settings-item-label-sub">调整 CodeMirror 中的字体大小</span>
      </div>
      <select class="settings-select" data-key="editorFontSize">
        <option value="14px">14px</option>
        <option value="15px" selected>15px</option>
        <option value="16px">16px</option>
        <option value="18px">18px</option>
      </select>
    </div>
    <div class="settings-item">
      <div class="settings-item-label">
        <span class="settings-item-label-main">预览区字号</span>
        <span class="settings-item-label-sub">调整右侧预览文本字号</span>
      </div>
      <select class="settings-select" data-key="previewFontSize">
        <option value="13px">13px</option>
        <option value="14px" selected>14px</option>
        <option value="15px">15px</option>
        <option value="16px">16px</option>
      </select>
    </div>
  </div>
`

    document.body.appendChild(overlay)
    document.body.appendChild(panel)

    function syncFromState() {

        const switches = panel.querySelectorAll<HTMLButtonElement>(".settings-switch")

        switches.forEach((sw) => {

            const key = sw.dataset.key

            if (key === "syncScroll") {

                sw.dataset.checked = String(syncScrollEnabled)

            } else if (key === "slashMenu") {

                sw.dataset.checked = String(slashMenuEnabled)

            } else if (key === "imagePaste") {

                sw.dataset.checked = String(imagePasteEnabled)

            } else if (key === "autoSave") {

                sw.dataset.checked = String(autoSaveEnabled)

            } else if (key === "showStats") {

                sw.dataset.checked = String(showStatsEnabled)
            }
        })

        const selects = panel.querySelectorAll<HTMLSelectElement>(".settings-select")

        selects.forEach((sel) => {

            const key = sel.dataset.key

            if (key === "editorFontSize") {

                sel.value = getComputedStyle(document.documentElement)
                    .getPropertyValue("--flux-editor-font-size")
                    .trim() || "15px"

            } else if (key === "previewFontSize") {

                sel.value = getComputedStyle(document.documentElement)
                    .getPropertyValue("--flux-preview-font-size")
                    .trim() || "14px"
            }
        })
    }

    syncFromState()

    function open() {

        overlay.classList.add("is-open")
        panel.classList.add("is-open")
    }

    function close() {

        overlay.classList.remove("is-open")
        panel.classList.remove("is-open")
    }

    settingsBtn.addEventListener("click", (event) => {

        event.preventDefault()

        if (panel.classList.contains("is-open")) {

            close()

        } else {

            syncFromState()
            open()
        }
    })

    overlay.addEventListener("click", () => {

        close()
    })

    panel.addEventListener("click", (event) => {

        const target = event.target as HTMLElement

        const sw = target.closest<HTMLButtonElement>(".settings-switch")

        if (!sw) return

        const key = sw.dataset.key

        if (!key) return

        if (key === "syncScroll") {

            syncScrollEnabled = !syncScrollEnabled

        } else if (key === "slashMenu") {

            slashMenuEnabled = !slashMenuEnabled

        } else if (key === "imagePaste") {

            imagePasteEnabled = !imagePasteEnabled

        } else if (key === "autoSave") {

            autoSaveEnabled = !autoSaveEnabled

        } else if (key === "showStats") {

            showStatsEnabled = !showStatsEnabled
        }

        persistSettings()
        syncFromState()
    })

    panel.addEventListener("change", (event) => {

        const target = event.target as HTMLSelectElement

        if (!target.classList.contains("settings-select")) return

        const key = target.dataset.key

        if (!key) return

        if (key === "editorFontSize") {

            document.documentElement.style.setProperty("--flux-editor-font-size", target.value)

        } else if (key === "previewFontSize") {

            document.documentElement.style.setProperty("--flux-preview-font-size", target.value)
        }

        persistSettings()
    })

    function persistSettings() {

        const payload = {
            syncScroll: syncScrollEnabled,
            slashMenu: slashMenuEnabled,
            imagePaste: imagePasteEnabled,
            autoSave: autoSaveEnabled,
            showStats: showStatsEnabled,
            editorFontSize: getComputedStyle(document.documentElement)
                .getPropertyValue("--flux-editor-font-size")
                .trim(),
            previewFontSize: getComputedStyle(document.documentElement)
                .getPropertyValue("--flux-preview-font-size")
                .trim()
        }

        try {

            window.localStorage.setItem("flux-settings", JSON.stringify(payload))

        } catch {
            // 忽略本地存储失败
        }
    }

    // 从本地存储恢复设置
    try {

        const stored = window.localStorage.getItem("flux-settings")

        if (stored) {

            const parsed = JSON.parse(stored) as Partial<{
                syncScroll: boolean
                slashMenu: boolean
                imagePaste: boolean
                autoSave: boolean
                showStats: boolean
                editorFontSize: string
                previewFontSize: string
            }>

            if (typeof parsed.syncScroll === "boolean") syncScrollEnabled = parsed.syncScroll
            if (typeof parsed.slashMenu === "boolean") slashMenuEnabled = parsed.slashMenu
            if (typeof parsed.imagePaste === "boolean") imagePasteEnabled = parsed.imagePaste
            if (typeof parsed.autoSave === "boolean") autoSaveEnabled = parsed.autoSave
            if (typeof parsed.showStats === "boolean") showStatsEnabled = parsed.showStats

            if (parsed.editorFontSize) {
                document.documentElement.style.setProperty("--flux-editor-font-size", parsed.editorFontSize)
            }

            if (parsed.previewFontSize) {
                document.documentElement.style.setProperty(
                    "--flux-preview-font-size",
                    parsed.previewFontSize
                )
            }

            syncFromState()
        }

    } catch {
        // 忽略解析失败
    }
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

    bar.innerHTML = `<span>${words} 字</span><span>预计 ${minutes} 分钟阅读</span>`
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