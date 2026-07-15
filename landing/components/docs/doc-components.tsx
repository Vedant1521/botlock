"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 pt-10 first:pt-0 border-t border-gray-200 dark:border-border first:border-0">
      <h2 className="text-xl font-bold text-black dark:text-ink tracking-tight mb-4">{title}</h2>
      {children}
    </section>
  );
}

export function DocSubSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="mt-6 scroll-mt-24">
      <h3 className="text-sm font-semibold text-black dark:text-ink mb-3">{title}</h3>
      {children}
    </div>
  );
}

export function DocP({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 dark:text-inkMuted leading-relaxed mb-4">{children}</p>;
}

export function DocCode({ children, lang = "js" }: { children: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="relative rounded-xl border border-gray-200 dark:border-border bg-gray-100 dark:bg-raised overflow-hidden mb-4 group">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-border bg-gray-50 dark:bg-surface">
        <span className="text-xs text-gray-400 dark:text-inkSubtle font-mono">{lang}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(children);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-inkSubtle hover:text-gray-600 dark:hover:text-inkMuted transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Copy code"
        >
          {copied ? (
            <><Check className="w-3.5 h-3.5 text-accent" /> Copied</>
          ) : (
            <><Copy className="w-3.5 h-3.5" /> Copy</>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs leading-relaxed text-gray-600 dark:text-inkMuted font-mono">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function DocTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-border overflow-hidden mb-4">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200 dark:border-border bg-gray-100 dark:bg-raised">
              {headers.map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-gray-400 dark:text-inkSubtle font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-border">
            {rows.map((row, i) => (
              <tr key={i} className="bg-gray-50 dark:bg-surface hover:bg-gray-100 dark:hover:bg-raised transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2.5 text-gray-600 dark:text-inkMuted align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DocBadge({ children, color = "default" }: { children: React.ReactNode; color?: "accent" | "success" | "default" }) {
  const cls =
    color === "accent" ? "bg-accent/10 text-accent" :
    color === "success" ? "bg-emerald-500/10 text-emerald-500" :
    "bg-gray-100 dark:bg-raised text-gray-600 dark:text-inkMuted";
  return (
    <code className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-mono ${cls}`}>
      {children}
    </code>
  );
}

export function DocCallout({ type = "info", children }: { type?: "info" | "warning"; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border px-4 py-3 mb-4 text-sm ${
      type === "warning"
        ? "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400"
        : "border-accent/20 bg-accent/5 text-gray-600 dark:text-inkMuted"
    }`}>
      {children}
    </div>
  );
}
