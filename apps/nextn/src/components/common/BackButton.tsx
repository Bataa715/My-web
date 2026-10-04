'use client';

/**
 * Legacy per-page floating back button.
 *
 * The global header now renders a consistent back button on every page except
 * the home page, so this component intentionally renders nothing. It is kept
 * so existing imports keep working without touching every page.
 */
export default function BackButton() {
  return null;
}
