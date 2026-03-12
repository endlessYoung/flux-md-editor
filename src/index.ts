import { FluxEditor } from "./core/FluxEditor"
import { MarkdownPreview } from "./preview/MarkdownPreview"
import { createFluxMdApp } from "./app"
import "./style/editor.css"

export interface FluxMdEditorInstance {
    getMarkdown: () => string
    setMarkdown: (md: string) => void
    destroy: () => void
}

export interface CreateFluxMdEditorOptions {
    editorEl: HTMLElement
    previewEl: HTMLElement
    initialValue?: string
}

export function createFluxMdEditor(options: CreateFluxMdEditorOptions): FluxMdEditorInstance {
    const editor = new FluxEditor({
        container: options.editorEl,
        initialValue: options.initialValue ?? ""
    })

    const preview = new MarkdownPreview(options.previewEl)
    preview.render(editor.getMarkdown())

    return {
        getMarkdown: () => editor.getMarkdown(),
        setMarkdown(md: string) {
            editor.setMarkdown(md)
            preview.render(md)
        },
        destroy() {
            // 预留：未来可以在这里清理事件等资源
        }
    }
}

export { FluxEditor } from "./core/FluxEditor"
export { MarkdownPreview } from "./preview/MarkdownPreview"
export { createFluxMdApp } from "./app"
