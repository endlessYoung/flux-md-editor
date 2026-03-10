import { EditorState } from "@codemirror/state"
import { EditorView, keymap } from "@codemirror/view"
import { markdown } from "@codemirror/lang-markdown"
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands"

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

                history(),

                keymap.of([
                    // 自定义快捷键优先
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
                    },
                    {
                        key: "Alt-ArrowUp",
                        run: (view) => this.moveLine(view, -1)
                    },
                    {
                        key: "Alt-ArrowDown",
                        run: (view) => this.moveLine(view, 1)
                    },
                    {
                        key: "Shift-Alt-ArrowDown",
                        run: (view) => this.duplicateLine(view)
                    },
                    // 标准编辑和撤销/重做等快捷键
                    ...defaultKeymap,
                    ...historyKeymap
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

    private moveLine(view: EditorView, direction: -1 | 1) {

        const { state } = view
        const doc = state.doc
        const sel = state.selection.main

        const line = doc.lineAt(sel.anchor)

        if ((direction === -1 && line.number === 1) || (direction === 1 && line.number === doc.lines)) {
            return false
        }

        const lineStart = line.from
        const lineNextStart =
            line.number < doc.lines
                ? doc.line(line.number + 1).from
                : line.to

        const column = sel.anchor - lineStart

        if (direction === -1) {

            const upper = doc.line(line.number - 1)
            const upperStart = upper.from
            const regionFrom = upperStart
            const regionTo = lineNextStart

            const upperText = doc.sliceString(upperStart, lineStart)
            const lineText = doc.sliceString(lineStart, lineNextStart)

            const insert = lineText + upperText

            view.dispatch({
                changes: {
                    from: regionFrom,
                    to: regionTo,
                    insert
                },
                selection: {
                    anchor: regionFrom + column
                }
            })

            return true
        }

        // direction === 1
        const next = doc.line(line.number + 1)
        const nextStart = next.from
        const nextNextStart =
            next.number < doc.lines
                ? doc.line(next.number + 1).from
                : next.to

        const regionFrom = lineStart
        const regionTo = nextNextStart

        const lineText = doc.sliceString(lineStart, nextStart)
        const nextText = doc.sliceString(nextStart, nextNextStart)

        const insert = nextText + lineText

        view.dispatch({
            changes: {
                from: regionFrom,
                to: regionTo,
                insert
            },
            selection: {
                anchor: regionFrom + (nextText.length > 0 ? column : 0)
            }
        })

        return true
    }

    private duplicateLine(view: EditorView) {

        const { state } = view
        const doc = state.doc
        const sel = state.selection.main

        const line = doc.lineAt(sel.anchor)
        const lineStart = line.from
        const lineNextStart =
            line.number < doc.lines
                ? doc.line(line.number + 1).from
                : line.to

        const text = doc.sliceString(lineStart, lineNextStart)

        view.dispatch({
            changes: {
                from: lineNextStart,
                to: lineNextStart,
                insert: text
            },
            selection: {
                anchor: lineNextStart + (sel.anchor - lineStart)
            }
        })

        return true
    }
}