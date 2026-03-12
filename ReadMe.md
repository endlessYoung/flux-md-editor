## FluxMDEditor

**本地优先、纯前端的 Markdown 编辑器**，支持代码高亮、KaTeX、Mermaid，大纲、同步滚动、自动保存等特性，可作为独立页面使用，也可以打成 npm 包集成到其他项目中。

---

## 📦 安装（作为 npm 库使用）

```bash
npm install flux-md-editor
```

---

## 🚀 核心 API 用法（不依赖框架）

入口：`src/index.ts` 暴露了一个核心方法：

```ts
import { createFluxMdEditor } from "flux-md-editor"
import "flux-md-editor/dist/flux-md-editor.css"

const editorEl = document.getElementById("editor")!
const previewEl = document.getElementById("preview")!

const instance = createFluxMdEditor({
  editorEl,
  previewEl,
  initialValue: "# Hello FluxMDEditor"
})

// 读取当前 Markdown
const md = instance.getMarkdown()

// 设置 Markdown
instance.setMarkdown("## 更新后的内容")

// 不再需要时销毁（预留扩展点）
instance.destroy()
```

HTML 结构示例：

```html
<div id="editor"></div>
<div id="preview"></div>
```

---

## 🌱 在 Vue 项目里如何使用（简单示例）

目前库本身没有强绑定 Vue，你可以在项目里自己封一层组件，类似：

```vue
<template>
  <div class="flux-md-editor">
    <div ref="editorEl"></div>
    <div ref="previewEl"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from "vue"
import { createFluxMdEditor } from "flux-md-editor"
import "flux-md-editor/dist/flux-md-editor.css"

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
}>()

const editorEl = ref<HTMLElement | null>(null)
const previewEl = ref<HTMLElement | null>(null)
let instance: ReturnType<typeof createFluxMdEditor> | null = null

onMounted(() => {
  if (!editorEl.value || !previewEl.value) return
  instance = createFluxMdEditor({
    editorEl: editorEl.value,
    previewEl: previewEl.value,
    initialValue: props.modelValue
  })
})

watch(
  () => props.modelValue,
  (val) => {
    if (instance && val !== instance.getMarkdown()) {
      instance.setMarkdown(val)
    }
  }
)

onBeforeUnmount(() => {
  instance?.destroy()
  instance = null
})
</script>
```

在业务组件中使用：

```vue
<FluxMdEditor v-model="content" />
```

---

## ⚛️ 在 React 项目里如何使用（简单示例）

同样在宿主项目里封一层：

```tsx
import React, { useEffect, useRef } from "react"
import { createFluxMdEditor } from "flux-md-editor"
import "flux-md-editor/dist/flux-md-editor.css"

export function FluxMdEditorReact(props: { value: string; onChange?: (v: string) => void }) {
  const editorRef = useRef<HTMLDivElement | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!editorRef.current || !previewRef.current) return

    const instance = createFluxMdEditor({
      editorEl: editorRef.current,
      previewEl: previewRef.current,
      initialValue: props.value
    })

    return () => {
      instance.destroy()
    }
  }, [])

  return (
    <div className="flux-md-editor">
      <div ref={editorRef} />
      <div ref={previewRef} />
    </div>
  )
}
```

在 React 应用中：

```tsx
<FluxMdEditorReact value={content} onChange={setContent} />
```

---