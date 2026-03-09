import MarkdownIt from "markdown-it"
import hljs from "highlight.js"

import markdownItKatex from "markdown-it-katex"
import markdownItAnchor from "markdown-it-anchor"
import markdownItToc from "markdown-it-toc-done-right"

import mermaid from "mermaid"

import "highlight.js/styles/github-dark.css"
import "katex/dist/katex.min.css"

export class MarkdownPreview {

    private el: HTMLElement
    private md: MarkdownIt

    constructor(el: HTMLElement) {

        this.el = el

        mermaid.initialize({ startOnLoad: false })

        this.md = new MarkdownIt({

            html: true,
            linkify: true,

            highlight: (str: string, lang: string) => {

                let code = ""
                const language = lang || "text"

                if (lang && hljs.getLanguage(lang)) {

                    code = hljs.highlight(str, { language: lang }).value

                } else {

                    code = this.escapeHtml(str)

                }

                const lines = code.split("\n")

                const lineNumbers = lines
                    .map((_, i) => `<span>${i + 1}</span>`)
                    .join("")

                return `
<div class="flux-code-block">
  <div class="flux-code-header">
    <div class="flux-code-header-main">
      <span class="flux-code-lang">${language}</span>
    </div>
    <div class="flux-code-actions">
      <button class="flux-copy-btn" type="button" aria-label="复制代码">
        ${this.copyIcon()}
      </button>
    </div>
  </div>
  <div class="flux-code-body">
    <div class="flux-code-lines">${lineNumbers}</div>
    <pre><code class="hljs ${language}">${code}</code></pre>
  </div>
</div>
`

            }

        })
            .use(markdownItKatex)
            .use(markdownItAnchor)
            .use(markdownItToc)

    }

    render(markdown: string) {

        const html = this.md.render(markdown)

        this.el.innerHTML = `<div class="preview-inner">${html}</div>`

        this.renderMermaid()
        this.bindCopyButtons()
        this.renderOutline()

    }

    private renderMermaid() {

        const blocks = this.el.querySelectorAll("code.language-mermaid")

        blocks.forEach((block, i) => {

            const parent = block.parentElement!

            const id = "mermaid-" + i

            const code = block.textContent || ""

            const div = document.createElement("div")

            div.className = "mermaid"

            div.id = id

            div.textContent = code

            parent.replaceWith(div)

        })

        mermaid.init(undefined, this.el.querySelectorAll(".mermaid"))

    }

    private copyIcon() {
        return `<i class="fa-solid fa-copy flux-copy-icon" aria-hidden="true"></i>`
    }

    private escapeHtml(str: string) {

        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")

    }

    private bindCopyButtons() {

        const buttons = this.el.querySelectorAll<HTMLButtonElement>(".flux-copy-btn")

        buttons.forEach((btn) => {

            btn.addEventListener("click", async (event) => {

                event.preventDefault()

                const card = btn.closest(".flux-code-block")

                const codeEl = card?.querySelector("pre code")

                const text = codeEl?.textContent || ""

                if (!text) return

                try {

                    await navigator.clipboard.writeText(text)

                    btn.classList.add("copied")

                    const originalLabel = btn.getAttribute("aria-label") || ""

                    btn.setAttribute("aria-label", "已复制")

                    this.showToast("代码已复制到剪贴板")

                    setTimeout(() => {

                        btn.classList.remove("copied")

                        if (originalLabel) {

                            btn.setAttribute("aria-label", originalLabel)
                        }

                    }, 1600)
                } catch {
                    // 忽略复制失败，保持静默
                }
            })
        })
    }

    private showToast(message: string) {

        let toast = document.querySelector<HTMLElement>(".flux-toast")

        if (!toast) {

            toast = document.createElement("div")

            toast.className = "flux-toast"

            document.body.appendChild(toast)
        }

        toast.textContent = message

        toast.classList.add("visible")

        setTimeout(() => {

            toast?.classList.remove("visible")

        }, 1800)
    }

    private renderOutline() {

        const toc = document.getElementById("toc-panel")

        if (!toc) return

        toc.innerHTML = ""

        const title = document.createElement("div")

        title.className = "toc-title"
        title.textContent = "大纲"

        toc.appendChild(title)

        const headings = this.el.querySelectorAll<HTMLElement>("h1, h2, h3")

        if (!headings.length) {

            const empty = document.createElement("div")

            empty.className = "toc-empty"
            empty.textContent = "当前文档暂无标题"

            toc.appendChild(empty)

            return
        }

        const list = document.createElement("ul")

        list.className = "toc-list"

        headings.forEach((h) => {

            const level = Number(h.tagName.substring(1)) || 1

            let id = h.id

            if (!id) {

                id = h.textContent?.toLowerCase().replace(/\s+/g, "-") || ""

                if (id) h.id = id
            }

            const li = document.createElement("li")

            li.className = "toc-item"

            const link = document.createElement("a")

            link.className = `toc-link level-${level}`
            link.textContent = h.textContent || ""
            link.href = `#${id}`

            link.addEventListener("click", (event) => {

                event.preventDefault()

                h.scrollIntoView({ behavior: "smooth", block: "start" })
            })

            li.appendChild(link)
            list.appendChild(li)
        })

        toc.appendChild(list)
    }

}