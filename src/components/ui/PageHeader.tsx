import type { ReactNode } from "react";

type Props = {
  eyebrow?: ReactNode;
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
};

export default function PageHeader({ eyebrow, title, description, aside }: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6 pb-6">
      <div className="max-w-3xl">
        {eyebrow && <div className="mb-2 text-sm text-ink-500">{eyebrow}</div>}
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">{title}</h1>
        {description && <div className="mt-2 text-base leading-relaxed text-ink-700">{description}</div>}
      </div>
      {aside}
    </header>
  );
}
