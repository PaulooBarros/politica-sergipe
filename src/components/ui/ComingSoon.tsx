import Link from "next/link";
import type { ReactNode } from "react";
import PageHeader from "./PageHeader";

export default function ComingSoon({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <PageHeader breadcrumb={[{ label: "Início", href: "/" }, { label: title }]} eyebrow="Em construção" title={title} />
      <div className="page py-8">
        <div className="card max-w-2xl p-6 text-body text-ink-700">
          {children}
          <p className="mt-3">
            Enquanto isso, veja o{" "}
            <Link href="/" className="link">
              mapa do orçamento
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}
