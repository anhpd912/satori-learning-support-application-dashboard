import { MarkedExtension } from 'marked';

/**
 * Marked extensions for Satori Learning Support Application
 * - Furigana: [漢字]{かんじ}, 漢字{かんじ}, 漢字【かんじ】
 * - Underline: ++text++
 */
export const markedExtensions: MarkedExtension = {
    extensions: [
        // 1. Japanese Furigana
        {
            name: 'furigana',
            level: 'inline',
            start(src: string) {
                const match = src.match(/\[|[\u4e00-\u9faf]/);
                return match ? match.index : undefined;
            },
            tokenizer(src: string) {
                // Explicit syntax: [base]{ruby} or [base]^(ruby)
                const explicitRule = /^\[([^\]]+)\](?:\{([^\}]+)\}|\^(\([^\)]+\)))/;
                const explicitMatch = explicitRule.exec(src);
                if (explicitMatch) {
                    const base = explicitMatch[1];
                    let ruby = explicitMatch[2] || explicitMatch[3];
                    if (ruby && ruby.startsWith('(') && ruby.endsWith(')')) {
                        ruby = ruby.slice(1, -1);
                    }
                    return { type: 'furigana', raw: explicitMatch[0], base, ruby };
                }

                // Auto-matching Kanji syntax: Kanji{ruby} or Kanji【ruby】
                const autoRule = /^([\u4e00-\u9faf]+)(?:\{([^\}]+)\}|【([^】]+)】)/;
                const autoMatch = autoRule.exec(src);
                if (autoMatch) {
                    return {
                        type: 'furigana',
                        raw: autoMatch[0],
                        base: autoMatch[1],
                        ruby: autoMatch[2] || autoMatch[3],
                    };
                }
                return;
            },
            renderer(token: any) {
                return `<ruby>${token.base}<rt>${token.ruby}</rt></ruby>`;
            }
        },
        // 2. Custom Underline: ++text++
        {
            name: 'custom-underline',
            level: 'inline',
            start(src: string) {
                return src.indexOf('++');
            },
            tokenizer(src: string) {
                const rule = /^\+\+([^\+]+)\+\+/;
                const match = rule.exec(src);
                if (match) {
                    const token = {
                        type: 'custom-underline',
                        raw: match[0],
                        text: match[1],
                        tokens: [] as any[]
                    };
                    this.lexer.inline(token.text, token.tokens);
                    return token;
                }
                return;
            },
            renderer(token: any) {
                return `<u>${this.parser.parseInline(token.tokens)}</u>`;
            }
        }
    ]
};
