'use client';

import { useEffect } from 'react';
import { translateUi, type UiLang } from '@/lib/ui-dict';

/**
 * Site-wide interface translation.
 *
 * The UI is authored in Mongolian. When the visitor picks English or Japanese,
 * this walks the live DOM and swaps every known Mongolian UI string (text nodes
 * plus placeholder / title / aria-label / alt) for its translation, then keeps
 * doing so for anything React renders afterwards (route changes, dialogs,
 * toasts). Switching back to Mongolian restores the original text — no reload.
 *
 * Lesson content and user-authored data stay as written.
 */
export const LANGUAGE_KEY = 'i18nextLng';
export const LANGUAGE_EVENT = 'ui-language-change';

const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'] as const;
const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'NOSCRIPT', 'CODE', 'PRE']);

function readLang(): UiLang {
  try {
    const v = localStorage.getItem(LANGUAGE_KEY);
    return v === 'en' || v === 'ja' ? v : 'mn';
  } catch {
    return 'mn';
  }
}

export default function UiTranslator() {
  useEffect(() => {
    let lang: UiLang = readLang();

    // Per-node bookkeeping: the Mongolian original and the last value we wrote.
    // If the node's current value differs from what we wrote, React changed it,
    // so the current value is the new original.
    const textOriginal = new WeakMap<Text, string>();
    const textWritten = new WeakMap<Text, string>();
    const attrOriginal = new WeakMap<Element, Record<string, string>>();
    const attrWritten = new WeakMap<Element, Record<string, string>>();

    const skipped = (el: Element | null): boolean => {
      for (let n: Element | null = el; n; n = n.parentElement) {
        if (SKIP.has(n.tagName) || n.hasAttribute('data-no-translate')) return true;
      }
      return false;
    };

    const processText = (node: Text) => {
      if (skipped(node.parentElement)) return;
      const cur = node.nodeValue ?? '';
      let orig = textOriginal.get(node);
      const written = textWritten.get(node);
      if (orig === undefined || (written !== undefined && cur !== written)) {
        orig = cur;
        textOriginal.set(node, cur);
      }
      const out = lang === 'mn' ? orig : (translateUi(orig, lang) ?? orig);
      textWritten.set(node, out);
      if (out !== cur) node.nodeValue = out;
    };

    const processAttrs = (el: Element) => {
      if (skipped(el)) return;
      for (const attr of ATTRS) {
        if (!el.hasAttribute(attr)) continue;
        const cur = el.getAttribute(attr) ?? '';
        const origs = attrOriginal.get(el) ?? {};
        const writes = attrWritten.get(el) ?? {};
        if (origs[attr] === undefined || (writes[attr] !== undefined && cur !== writes[attr])) {
          origs[attr] = cur;
        }
        const out = lang === 'mn' ? origs[attr] : (translateUi(origs[attr], lang) ?? origs[attr]);
        writes[attr] = out;
        attrOriginal.set(el, origs);
        attrWritten.set(el, writes);
        if (out !== cur) el.setAttribute(attr, out);
      }
    };

    const processTree = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) {
        processText(root as Text);
        return;
      }
      if (root.nodeType !== Node.ELEMENT_NODE) return;
      const el = root as Element;
      processAttrs(el);
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (n.nodeType === Node.TEXT_NODE) processText(n as Text);
        else processAttrs(n as Element);
      }
    };

    // Batch DOM mutations into one pass per frame
    const pending = new Set<Node>();
    let frame = 0;
    const flush = () => {
      frame = 0;
      const nodes = Array.from(pending);
      pending.clear();
      for (const n of nodes) if (n.isConnected) processTree(n);
    };
    const schedule = (n: Node) => {
      pending.add(n);
      if (!frame) frame = requestAnimationFrame(flush);
    };

    const observer = new MutationObserver(records => {
      for (const r of records) {
        if (r.type === 'characterData') schedule(r.target);
        else if (r.type === 'attributes') schedule(r.target);
        else r.addedNodes.forEach(schedule);
      }
    });

    const apply = () => {
      document.documentElement.lang = lang;
      processTree(document.body);
    };

    apply();
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRS],
    });

    const onChange = () => {
      lang = readLang();
      apply();
    };
    window.addEventListener(LANGUAGE_EVENT, onChange);
    window.addEventListener('storage', onChange);

    return () => {
      observer.disconnect();
      window.removeEventListener(LANGUAGE_EVENT, onChange);
      window.removeEventListener('storage', onChange);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
