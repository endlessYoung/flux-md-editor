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

  exportHtmlDocument(markdown: string, title = "FluxMDEditor 文档") {

    const html = this.md.render(markdown)

    const css = `
body {
  margin: 0;
  padding: 32px 16px 40px;
  font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", system-ui, sans-serif;
  background: #f5f5f7;
  color: #0f172a;
}

.preview-inner {
  max-width: 840px;
  margin: 0 auto;
}

.preview-inner h1,
.preview-inner h2,
.preview-inner h3,
.preview-inner h4,
.preview-inner h5,
.preview-inner h6 {
  font-weight: 650;
  color: #0f172a;
}

.preview-inner h1 {
  font-size: 28px;
  margin: 0 0 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
}

.preview-inner h2 {
  font-size: 22px;
  margin: 28px 0 12px;
}

.preview-inner h3 {
  font-size: 18px;
  margin: 20px 0 10px;
}

.preview-inner p {
  margin: 10px 0;
  color: #1f2933;
  line-height: 1.7;
}

.preview-inner a {
  color: #2563eb;
  text-decoration: none;
  border-bottom: 1px solid rgba(37, 99, 235, 0.28);
  padding-bottom: 1px;
}

.preview-inner a:hover {
  color: #1d4ed8;
  border-bottom-color: rgba(29, 78, 216, 0.65);
}

.preview-inner ul,
.preview-inner ol {
  margin: 10px 0 10px 22px;
}

.preview-inner code:not(pre code) {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.9em;
}

.preview-inner pre {
  margin: 16px 0;
  padding: 12px 14px;
  border-radius: 10px;
  background: #020617;
  overflow: auto;
}

.preview-inner pre code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 13px;
}

.preview-inner blockquote {
  margin: 16px 0;
  padding: 10px 14px;
  border-left: 3px solid #2563eb;
  background: rgba(239, 246, 255, 0.9);
  border-radius: 0 10px 10px 0;
  color: #1e293b;
}

.preview-inner table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin: 16px 0;
}

.preview-inner th,
.preview-inner td {
  border: 1px solid rgba(226, 232, 240, 0.9);
  padding: 6px 10px;
}

.preview-inner th {
  background: rgba(248, 250, 252, 0.96);
  font-weight: 600;
}

.preview-inner img {
  max-width: 100%;
  border-radius: 10px;
  display: block;
  margin: 14px auto;
}

.flux-code-block {
  margin: 24px 0;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #020617;
  overflow: hidden;
}

.flux-code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: radial-gradient(circle at 0 0, #0f172a, #020617);
  color: #9ca3af;
}

.flux-code-lang {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.flux-code-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.flux-code-lines {
  padding: 10px 0 10px 10px;
  background: rgba(15, 23, 42, 0.9);
  color: #6b7280;
  font-size: 11px;
  text-align: right;
}

.flux-code-lines span {
  display: block;
  padding: 0 6px;
}

.flux-code-body {
  display: grid;
  grid-template-columns: auto 1fr;
}

.flux-code-body pre {
  margin: 0;
  border-radius: 0;
  background: transparent;
}
`

    const doc = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${this.escapeHtml(title)}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.7/dist/katex.min.css" />
  <style>
${css}
  </style>
</head>
<body>
  <div class="preview-inner">
${html}
  </div>
</body>
</html>`

    return doc
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