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

        return `
<svg viewBox="0 -960 960 960" width="16" height="16">
<path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/>
</svg>
`
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

}