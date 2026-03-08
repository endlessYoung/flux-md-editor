import { EditorState } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
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
}