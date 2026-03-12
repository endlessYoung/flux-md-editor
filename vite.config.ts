import { defineConfig } from "vite"
import { resolve } from "node:path"

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "FluxMDEditor",
            fileName: (format) => `flux-md-editor.${format}.js`,
            formats: ["es", "umd"]
        }
    }
})

