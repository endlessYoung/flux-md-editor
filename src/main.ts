import { FluxEditor } from "./core/FluxEditor"
import { MarkdownPreview } from "./preview/MarkdownPreview"
import "./style/editor.css"

const editorEl = document.getElementById("editor")!
const previewEl = document.getElementById("preview")!

const preview = new MarkdownPreview(previewEl)

const editor = new FluxEditor({
    container: editorEl,
    initialValue: `# FluxMDEditor 使用指南

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
    }
})

setupToolbar(editor)
setupThemeToggle()
setupSplitter()

preview.render(editor.getMarkdown())

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

            iconEl.textContent = isDark ? "🌙" : "☀"
        }
    })

    if (iconEl) {

        iconEl.textContent = initialDark ? "🌙" : "☀"
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