export function createToolbar(editor: any) {

    const bar = document.createElement("div")

    bar.className = "flux-toolbar"

    bar.innerHTML = `

<button data-cmd="bold">B</button>
<button data-cmd="italic">I</button>
<button data-cmd="code">Code</button>
<button data-cmd="h1">H1</button>

`

    bar.addEventListener("click", (e: any) => {

        const cmd = e.target.dataset.cmd

        if (!cmd) return

        const map: any = {

            bold: "**bold**",
            italic: "*italic*",
            code: "`code`",
            h1: "# title"

        }

        editor.insert(map[cmd])
    })

    return bar
}