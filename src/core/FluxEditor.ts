import { EditorState } from "@codemirror/state"
import { EditorView, keymap } from "@codemirror/view"
import { markdown } from "@codemirror/lang-markdown"

export interface FluxEditorOptions {

    container: HTMLElement
    initialValue?: string
    onChange?: (value: string) => void
}

export class FluxEditor {

    private view: EditorView

    constructor(options: FluxEditorOptions) {

        const state = EditorState.create({

            doc: options.initialValue || "",

            extensions: [

                markdown(),

                keymap.of([
                    {
                        key: "Mod-b",
                        run: (view) => this.toggleWrap(view, "**")
                    },
                    {
                        key: "Mod-i",
                        run: (view) => this.toggleWrap(view, "_")
                    },
                    {
                        key: "Mod-e",
                        run: (view) => this.toggleWrap(view, "`")
                    }
                ]),

                EditorView.updateListener.of((update) => {

                    if (update.docChanged) {

                        const value = update.state.doc.toString()

                        options.onChange?.(value)
                    }
                })
            ]
        })

        this.view = new EditorView({
            state,
            parent: options.container
        })
    }

    getMarkdown() {

        return this.view.state.doc.toString()
    }

    setMarkdown(md: string) {

        this.view.dispatch({

            changes: {
                from: 0,
                to: this.view.state.doc.length,
                insert: md
            }
        })
    }

    insert(text: string) {

        const pos = this.view.state.selection.main.head

        this.view.dispatch({

            changes: {
                from: pos,
                insert: text
            }
        })
    }

    focus() {

        this.view.focus()
    }

    getDom() {

        return this.view.dom
    }

    private toggleWrap(view: EditorView, marker: string) {

        const { state } = view

        const range = state.selection.main

        const doc = state.doc

        const selected = doc.sliceString(range.from, range.to)

        const hasMarker =
            selected.startsWith(marker) && selected.endsWith(marker) && selected.length > marker.length * 2

        const replacement = hasMarker
            ? selected.slice(marker.length, selected.length - marker.length)
            : marker + (selected || "文本") + marker

        view.dispatch({

            changes: {
                from: range.from,
                to: range.to,
                insert: replacement
            },

            selection: {
                anchor: hasMarker
                    ? range.from
                    : range.from + marker.length,
                head: hasMarker
                    ? range.from + replacement.length
                    : range.from + replacement.length - marker.length
            }
        })

        return true
    }
}