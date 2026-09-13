# Visual System

## Creative north star

A quiet, practical finance ledger. The interface prioritizes amounts, dates, and actions over decoration; its mobile surfaces should feel immediately legible during a quick daily check.

## Typography

Use a system sans-serif stack with a clear three-level hierarchy: page title, monetary value, and supporting metadata. Monetary values use tabular numerals when available. Never rely on color alone to communicate a debit, credit, payment, or error.

## Color

Use semantic surfaces, text, border, primary-action, positive, negative, and warning tokens with WCAG AA contrast. Positive and negative color reinforce an explicit text label, icon, or sign; do not use gradients or color-only status indicators.

## Layout and spacing

Use one content column at phone widths with 16px gutters, 44px minimum touch targets, and fixed bottom navigation for the main areas. Forms use one field per row and one primary action. At 768px and above, content may widen and summaries may become a grid; no feature may become hover-only.

## Components and states

Cards summarize one financial concept. List rows expose description, category, date, amount, and status in reading order. Forms show inline validation and an explicit impact summary before irreversible financial actions. Loading uses structural skeletons; empty, error, disabled, and saved states use concise Brazilian Portuguese copy. Focus remains visible for keyboard users.

## Motion

Use only short feedback transitions. Respect reduced-motion preferences and never animate monetary values in a way that obscures the final amount.
