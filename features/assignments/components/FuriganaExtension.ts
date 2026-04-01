import { Node, mergeAttributes } from '@tiptap/core';

/**
 * TipTap custom Node for Japanese Furigana (振り仮名 / ruby text).
 *
 * - Stored in markdown as: {漢字|かんじ}
 * - Rendered in the editor as: <ruby>漢字<rt>かんじ</rt></ruby>
 * - Parsed back from the {kanji|reading} pattern when loading content
 */
export const FuriganaExtension = Node.create({
    name: 'furigana',

    // Belong to the inline group so it can appear inside paragraphs
    group: 'inline',
    inline: true,

    // Atom = treated as a single unit (cannot place cursor inside)
    atom: true,

    addAttributes() {
        return {
            kanji: {
                default: null,
            },
            reading: {
                default: null,
            },
        };
    },

    // Parse from HTML <ruby> tags (when pasting or loading HTML)
    parseHTML() {
        return [
            {
                tag: 'ruby',
                getAttrs: (domNode) => {
                    const ruby = domNode as HTMLElement;
                    const rt = ruby.querySelector('rt');
                    const reading = rt?.textContent ?? '';
                    // Remove the <rt> text from the full ruby text to get the base kanji
                    const kanji = ruby.textContent?.replace(reading, '').trim() ?? '';
                    return { kanji, reading };
                },
            },
        ];
    },

    // Render as <ruby>漢字<rt>かんじ</rt></ruby> inside the editor
    renderHTML({ node, HTMLAttributes }) {
        return [
            'ruby',
            mergeAttributes(HTMLAttributes, { class: 'furigana-node' }),
            node.attrs.kanji,
            ['rt', {}, node.attrs.reading],
        ];
    },

    // Tell tiptap-markdown to serialize this node as <ruby> HTML
    // so the output is mixed markdown+HTML (bold stays **bold**, ruby stays <ruby>...</ruby>)
    addStorage() {
        return {
            markdown: {
                serialize(state: any, node: any) {
                    state.write(
                        `[${node.attrs.kanji}]{${node.attrs.reading}}`
                    );
                },
                parse: {},
            },
        };
    },
});
