# FluxMDEditor

> A modern, extensible Markdown editor with first-class support for Vue and React.

FluxMDEditor is a lightweight yet powerful **Markdown editor framework** designed for modern web applications.
It provides a **framework-agnostic core** with official adapters for **Vue** and **React**, enabling developers to integrate a fully featured Markdown editing experience in minutes.

---

## ✨ Features

* ⚡ **Fast and lightweight**
* 🧩 **Plugin architecture**
* 🧠 **Framework-agnostic core**
* ⚛️ **React support**
* 🟢 **Vue support**
* 🖋 **Live Markdown preview**
* 🎨 **Theme system**
* 📦 **Modular architecture**
* 🔌 **Extensible plugin ecosystem**

---

# 📦 Installation

## Install Core

```bash
npm install @fluxmd/core
```

---

## Vue

```bash
npm install @fluxmd/vue
```

Usage:

```vue
<script setup>
import { FluxEditor } from "@fluxmd/vue"
</script>

<template>
  <FluxEditor />
</template>
```

---

## React

```bash
npm install @fluxmd/react
```

Usage:

```tsx
import { FluxEditor } from "@fluxmd/react"

export default function App() {
  return <FluxEditor />
}
```

---

# 🚀 Quick Start

Using the core editor directly:

```ts
import { FluxEditor } from "@fluxmd/core"

const editor = new FluxEditor({
  container: document.getElementById("editor"),
  initialValue: "# Hello FluxMDEditor"
})
```

---

# 🧩 Plugin System

FluxMDEditor is designed with a **plugin-first architecture**.

Create a plugin:

```ts
export default {
  name: "example",

  install(editor) {
    console.log("Plugin installed")
  }
}
```

Register plugin:

```ts
editor.use(plugin)
```

---

# 🔧 Development

Clone repository:

```bash
git clone https://github.com/fluxmd/fluxmd-editor.git
```

Install dependencies:

```bash
pnpm install
```

Start playground:

```bash
pnpm dev
```

---

# 🗺 Roadmap

### v0.1

* Core editor

---

# 🤝 Contributing

Contributions are welcome!

Please follow these steps:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Submit a pull request

---

# 📄 License

MIT License.

---

# ⭐ Support

If you like this project, please give it a **star** on GitHub.
It helps the project grow and reach more developers.

---

# 💡 Inspiration

FluxMDEditor is inspired by modern editor ecosystems such as:

* Typora
* Obsidian
* Notion
