'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Markdown } from 'tiptap-markdown';
import { FuriganaExtension } from './FuriganaExtension';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

// ─── Toolbar ────────────────────────────────────────────────────────────────

interface MenuBarProps {
    editor: any;
    onFuriganaClick: () => void;
}

const MenuBar = ({ editor, onFuriganaClick }: MenuBarProps) => {
    if (!editor) return null;

    const ToolbarButton = ({
        isActive = false,
        onClick,
        children,
        title,
    }: {
        isActive?: boolean;
        onClick: () => void;
        children: React.ReactNode;
        title: string;
    }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`w-8 h-8 rounded shrink-0 flex items-center justify-center text-sm font-bold transition-colors ${isActive
                    ? 'bg-blue-100 text-[#1A8DFF]'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
        >
            {children}
        </button>
    );

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold (Ctrl+B)"
            >
                <span className="font-serif font-bold text-[15px]">B</span>
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic (Ctrl+I)"
            >
                <span className="font-serif italic text-[15px]">I</span>
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                title="Underline (Ctrl+U)"
            >
                <span className="font-serif font-bold underline text-[15px]">U</span>
            </ToolbarButton>

            <div className="w-px h-5 bg-gray-300 mx-1" />

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
            >
                H1
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
            >
                H2
            </ToolbarButton>

            <div className="w-px h-5 bg-gray-300 mx-1" />

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Ordered List"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
            </ToolbarButton>

            <div className="w-px h-5 bg-gray-300 mx-1" />

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Quote"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M14.707 20h3.5l1.656-2.484c1.114-1.671 1.83-3.666 2.062-5.753l.075-.68v-7.083h-9v11h4.814l-3.107 5z M3.707 20h3.5l1.656-2.484c1.114-1.671 1.83-3.666 2.062-5.753l.075-.68v-7.083h-9v11h4.814l-3.107 5z"></path></svg>
            </ToolbarButton>

            <div className="w-px h-5 bg-gray-300 mx-1" />

            {/* ─── Furigana Button ─── */}
            <button
                type="button"
                onClick={onFuriganaClick}
                title="Thêm Furigana (振り仮名) — chọn chữ trước rồi bấm"
                className="h-8 px-2 rounded shrink-0 flex items-center justify-center gap-1 text-xs font-bold transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-300"
            >
                <span className="text-[11px] leading-none" style={{ fontFamily: 'serif' }}>ふ</span>
                <span className="text-[10px] leading-none">Phiên âm</span>
            </button>

            <div className="flex-1" />

            {/* Undo / Redo */}
            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                title="Undo"
                className="w-8 h-8 rounded flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                title="Redo"
                className="w-8 h-8 rounded flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path></svg>
            </button>
        </div>
    );
};

// ─── Furigana Popover ────────────────────────────────────────────────────────

interface FuriganaPopoverProps {
    kanji: string;
    reading: string;
    onKanjiChange: (v: string) => void;
    onReadingChange: (v: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

const FuriganaPopover = ({ kanji, reading, onKanjiChange, onReadingChange, onConfirm, onCancel }: FuriganaPopoverProps) => (
    <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-72">
        <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <span className="text-gray-600 text-[10px] font-bold" style={{ fontFamily: 'serif' }}>ふ</span>
            </div>
            <h4 className="text-sm font-bold text-gray-800">Thêm Furigana (振り仮名)</h4>
        </div>

        {/* Preview */}
        {(kanji || reading) && (
            <div className="bg-gray-50 rounded-lg p-2 mb-3 text-center border border-gray-100">
                <ruby className="text-lg font-medium text-gray-800" style={{ fontFamily: 'serif' }}>
                    {kanji || '漢字'}
                    <rt className="text-xs text-gray-500">{reading || 'かんじ'}</rt>
                </ruby>
            </div>
        )}

        <div className="flex flex-col gap-2">
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Chữ Kanji / Kana</label>
                <input
                    autoFocus
                    type="text"
                    value={kanji}
                    onChange={(e) => onKanjiChange(e.target.value)}
                    placeholder="漢字"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    style={{ fontFamily: 'serif' }}
                    onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Cách đọc (Furigana)</label>
                <input
                    type="text"
                    value={reading}
                    onChange={(e) => onReadingChange(e.target.value)}
                    placeholder="かんじ"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                    style={{ fontFamily: 'serif' }}
                    onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
                />
            </div>
        </div>

        <div className="flex gap-2 mt-3">
            <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
                Hủy
            </button>
            <button
                type="button"
                onClick={onConfirm}
                disabled={!kanji || !reading}
                className="flex-1 py-2 text-sm font-bold text-white bg-[#1A8DFF] hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed rounded-lg transition"
            >
                Chèn
            </button>
        </div>

    </div>
);

// ─── Main Editor Component ───────────────────────────────────────────────────

export default function RichTextEditor({ value, onChange, placeholder, className = '' }: RichTextEditorProps) {
    // Furigana popover state
    const [furiganaOpen, setFuriganaOpen] = useState(false);
    const [furiganaKanji, setFuriganaKanji] = useState('');
    const [furiganaReading, setFuriganaReading] = useState('');
    const popoverRef = useRef<HTMLDivElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline.extend({
                addStorage() {
                    return {
                        markdown: {
                            serialize: { open: '++', close: '++', exp: '++' },
                        },
                    };
                },
            }),
            FuriganaExtension,
            // html: true → furigana as <ruby> (handled by FuriganaExtension anyway)
            // bold/italic/heading/list remain proper markdown syntax
            Markdown.configure({ html: true }),
        ],
        content: preprocessMarkdown(value),
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            // Output: mixed markdown + HTML for underline (<u>) and furigana (<ruby>)
            onChange((editor.storage as any).markdown.getMarkdown());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm xl:prose-base focus:outline-none min-h-[120px] max-w-none text-gray-900',
            },
        },
    });

    // Sync external value changes
    useEffect(() => {
        if (editor && value !== (editor.storage as any).markdown.getMarkdown()) {
            editor.commands.setContent(preprocessMarkdown(value));
        }
    }, [value, editor]);

    // Close popover on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setFuriganaOpen(false);
            }
        };
        if (furiganaOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [furiganaOpen]);

    const handleFuriganaClick = () => {
        if (!editor) return;
        // Pre-fill kanji from current selection
        const { from, to } = editor.state.selection;
        const selected = editor.state.doc.textBetween(from, to, '');
        setFuriganaKanji(selected);
        setFuriganaReading('');
        setFuriganaOpen(true);
    };

    const handleFuriganaConfirm = () => {
        if (!editor || !furiganaKanji || !furiganaReading) return;

        // Delete selected text first (user may have pre-selected kanji)
        const { from, to } = editor.state.selection;
        if (from !== to) {
            editor.chain().focus().deleteSelection().run();
        }

        // Insert furigana node
        editor.chain().focus().insertContent({
            type: 'furigana',
            attrs: { kanji: furiganaKanji, reading: furiganaReading },
        }).run();

        setFuriganaOpen(false);
        setFuriganaKanji('');
        setFuriganaReading('');
    };

    return (
        <div
            ref={popoverRef}
            className={`border border-gray-200 rounded-xl bg-white overflow-visible shadow-sm focus-within:border-[#1A8DFF] focus-within:ring-1 focus-within:ring-[#1A8DFF] transition-all relative ${className}`}
        >
            <MenuBar editor={editor} onFuriganaClick={handleFuriganaClick} />

            {/* Furigana Popover */}
            {furiganaOpen && (
                <FuriganaPopover
                    kanji={furiganaKanji}
                    reading={furiganaReading}
                    onKanjiChange={setFuriganaKanji}
                    onReadingChange={setFuriganaReading}
                    onConfirm={handleFuriganaConfirm}
                    onCancel={() => setFuriganaOpen(false)}
                />
            )}

            <div className="p-4 relative" onClick={() => editor?.commands.focus()}>
                <EditorContent editor={editor} />
                {editor?.isEmpty && placeholder && (
                    <div className="absolute top-4 left-4 text-gray-400 pointer-events-none text-sm font-medium">
                        {placeholder}
                    </div>
                )}
            </div>

            <style jsx global>{`
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #9ca3af;
                    pointer-events: none;
                    height: 0;
                }
                .ProseMirror h1 { font-size: 1.5em; font-weight: bold; margin-bottom: 0.5em; margin-top: 0.5em; }
                .ProseMirror h2 { font-size: 1.25em; font-weight: bold; margin-bottom: 0.5em; margin-top: 0.5em; }
                .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 0.5em; }
                .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 0.5em; }
                .ProseMirror blockquote { border-left: 3px solid #e5e7eb; padding-left: 1rem; color: #4b5563; font-style: italic; }

                /* Furigana node styling inside TipTap editor */
                .ProseMirror ruby.furigana-node {
                    color: #111827;
                    background: #f3f4f6;
                    border-radius: 4px;
                    padding: 0 3px;
                    cursor: default;
                }
                .ProseMirror ruby.furigana-node rt {
                    color: #374151;
                    font-size: 0.6em;
                }
            `}</style>
        </div>
    );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Pre-processes markdown content to convert custom extensions (furigana, underline)
 * into raw HTML tags so that TipTap (with html: true) can parse them into nodes.
 */
function preprocessMarkdown(markdown: string): string {
    if (!markdown) return '';

    // 1. Furigana
    // [漢字]{かんじ} or [漢字]^(かんじ) -> <ruby>漢字<rt>かんじ</rt></ruby>
    let processed = markdown.replace(
        /\[([^\]]+)\](?:\{([^\}]+)\}|\^(\([^\)]+\)))/g,
        (_, base, reading1, reading2) => {
            let reading = reading1 || (reading2 ? reading2.slice(1, -1) : '');
            return `<ruby>${base}<rt>${reading}</rt></ruby>`;
        }
    );

    // 漢字{かんじ} or 漢字【かんじ】 -> <ruby>漢字<rt>かんじ</rt></ruby>
    processed = processed.replace(
        /([\u4e00-\u9faf]+)(?:\{([^\}]+)\}|【([^】]+)】)/g,
        '<ruby>$1<rt>$2$3</rt></ruby>'
    );

    // 2. Custom Underline: ++text++ -> <u>text</u>
    processed = processed.replace(/\+\+([^\+]+)\+\+/g, '<u>$1</u>');

    return processed;
}

