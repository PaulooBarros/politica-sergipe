import Link from "next/link";
import type { ReactNode } from "react";
import PageHeader from "./PageHeader";

export default function ComingSoon({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <PageHeader eyebrow="Em construção" title={title} />
      <div className="mt-8 max-w-2xl rounded-lg border-l-4 border-alert-500 bg-alert-50 px-5 py-4 text-ink-900">
        {children}
        <p className="mt-3">
          Enquanto isso, veja o <Link href="/" className="text-brand-700 underline underline-offset-2">panorama do orçamento</Link>.
        </p>
      </div>
    </>
  );
}
