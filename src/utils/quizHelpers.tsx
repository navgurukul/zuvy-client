// filepath: /home/ngr/Documents/zuvy-client/src/utils/quiz-helpers.ts
import React from 'react';
import { ellipsis } from '@/lib/utils';

// Helper to check for code blocks
export const isCodeQuestion = (html: string): boolean => {
    return !!html && html.includes('<pre') && html.includes('<code');
};

// Helper to extract plain text
const extractTextFromHTML = (html: string): string => {
    if (typeof document === 'undefined') {
        return html.replace(/<[^>]*>/g, ' ').trim();
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
};

// Helper to sanitize HTML (remove images, flatten headings)
const sanitizeQuestionHTML = (html: string): string => {
    if (typeof document === 'undefined') {
        return html;
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.querySelectorAll('img').forEach((img) => img.remove());
    tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
        const textNode = document.createTextNode(heading.textContent || '');
        heading.replaceWith(textNode);
    });
    return tempDiv.innerHTML;
};

/**
 * Renders a preview for a quiz question.
 * Handles code blocks and regular HTML content differently.
 * @param questionHtml The HTML content of the question.
 * @param options Truncation lengths for code and text.
 * @returns A React Node to be rendered.
 */
export const renderQuestionPreview = (
    questionHtml: string | null | undefined,
    options: { codeLength?: number; textLength?: number } = {}
): React.ReactNode => {
    const { codeLength = 50, textLength = 70 } = options;

    if (!questionHtml) {
        return 'No question available';
    }

    // Fallback for Server-Side Rendering
    if (typeof window === 'undefined') {
        const plainText = extractTextFromHTML(questionHtml);
        return ellipsis(plainText, textLength);
    }

    if (isCodeQuestion(questionHtml)) {
        const textContent = extractTextFromHTML(questionHtml);
        const preview = ellipsis(textContent, codeLength);
        return <div className="p-2 text-sm text-gray-700 font-mono">{preview}</div>;
    } else {
        const sanitizedHTML = sanitizeQuestionHTML(questionHtml);
        const truncatedQuestion = ellipsis(sanitizedHTML, textLength);
        return <span dangerouslySetInnerHTML={{ __html: truncatedQuestion }} />;
    }
};