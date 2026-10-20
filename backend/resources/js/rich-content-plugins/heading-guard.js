import { Extension } from '@tiptap/core'

const isHeading = (node) => node?.type.name === 'heading' && node.content.size > 0
const isEmptyParagraph = (node) => node?.type.name === 'paragraph' && node.content.size === 0

export default Extension.create({
    name: 'headingGuard',

    priority: 1000,

    addKeyboardShortcuts() {
        return {
            Backspace: ({ editor }) => {
                const { selection } = editor.state
                const { $from, empty } = selection
                if (!empty || $from.parentOffset !== 0 || !isHeading($from.parent)) return false
                const parent = $from.node($from.depth - 1)
                const index = $from.index($from.depth - 1)
                if (index === 0) return true
                const before = parent.child(index - 1)
                if (isEmptyParagraph(before)) {
                    const to = $from.before()
                    return editor.chain().deleteRange({ from: to - before.nodeSize, to }).run()
                }
                return true
            },
            Delete: ({ editor }) => {
                const { selection } = editor.state
                const { $from, empty } = selection
                if (!empty || $from.parentOffset !== $from.parent.content.size) return false
                const parent = $from.node($from.depth - 1)
                const index = $from.index($from.depth - 1)
                if (index + 1 >= parent.childCount || !isHeading(parent.child(index + 1))) return false
                if (isEmptyParagraph($from.parent)) {
                    const from = $from.before()
                    return editor.chain().deleteRange({ from, to: from + $from.parent.nodeSize }).run()
                }
                return true
            },
        }
    },
})
