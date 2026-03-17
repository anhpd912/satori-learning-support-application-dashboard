'use client';

import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { markedExtensions } from '@/shared/utils/markedExtensions';

// Register custom extensions (Furigana, Underline, etc.)
marked.use(markedExtensions);

/**
 * Allowlist for DOMPurify when rendering question text.
 *
 * WHY these tags?
 *  - Standard markdown output: p, strong, em, h1-h6, ul, ol, li, blockquote, code, pre, br, hr
 *  - Underline (no markdown equivalent): <u>
 *  - Japanese furigana (ruby text): <ruby>, <rt>, <rp>
 *
 * Anything else (script, iframe, img with on*, etc.) is scrubbed.
 */
const ALLOWED_TAGS = [
    'p', 'br', 'hr',
    'strong', 'em', 'u', 's',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'code', 'pre',
    // Japanese ruby (furigana)
    'ruby', 'rt', 'rp',
];

const ALLOWED_ATTR = [
    'class', // needed for ruby.furigana-node class
];

interface SafeMarkdownProps {
    /** Raw content from DB: mixed markdown + HTML (<u>, <ruby>) */
    content: string;
    className?: string;
}

/**
 * Safely renders mixed markdown+HTML content from the database.
 *
 * Pipeline:
 *   DB content (markdown + HTML tags)
 *   → marked.parse()  (markdown → HTML)
 *   → DOMPurify.sanitize()  (strip dangerous tags & attributes)
 *   → dangerouslySetInnerHTML  (render)
 *
 * Safe against XSS: no <script>, no event handlers (onclick, onerror…),
 * no <iframe>, no <img src=x onerror=…>. Only the whitelisted tags remain.
 */
export default function SafeMarkdown({ content, className = '' }: SafeMarkdownProps) {
    const safeHtml = useMemo(() => {
        if (!content) return '';

        // 1. Parse markdown → HTML (marked handles **bold**, *italic*, # heading, etc.)
        //    The raw HTML tags in content (<u>, <ruby>) pass through unchanged.
        const rawHtml = marked.parse(content, { async: false }) as string;

        // 2. Sanitize: strip anything not in the allowlist
        const clean = DOMPurify.sanitize(rawHtml, {
            ALLOWED_TAGS,
            ALLOWED_ATTR,
        });

        return clean;
    }, [content]);

    return (
        <div
            className={`safe-markdown ${className}`}
            // Safe: content has been sanitized by DOMPurify above
            dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
    );
}
