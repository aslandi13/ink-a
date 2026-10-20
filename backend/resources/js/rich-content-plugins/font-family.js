import { Mark, mergeAttributes } from '@tiptap/core'

export default Mark.create({
    name: 'fontFamily',

    addAttributes() {
        return {
            font: {
                default: null,
                parseHTML: (element) => element.getAttribute('data-font'),
                renderHTML: (attributes) => (attributes.font ? { 'data-font': attributes.font } : {}),
            },
        }
    },

    parseHTML() {
        return [{ tag: 'span[data-font]' }]
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes), 0]
    },

    addCommands() {
        return {
            setFontFamily:
                (font) =>
                ({ commands }) =>
                    font === 'sans' ? commands.unsetMark(this.name) : commands.setMark(this.name, { font }),
        }
    },
})
