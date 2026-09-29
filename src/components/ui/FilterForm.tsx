"use client";

import Form from "next/form";
import type { ReactNode } from "react";

type Props = {
  /** Path the GET form navigates to; "" keeps the current route. */
  action?: string;
  children: ReactNode;
  className?: string;
};

/**
 * GET form that writes its fields to the URL. Selects submit on change, so
 * filters are shareable links and work without extra client state.
 */
export default function FilterForm({ action = "", children, className }: Props) {
  return (
    <Form
      action={action}
      scroll={false}
      replace
      className={className}
      onChange={(e) => {
        if (e.target instanceof HTMLSelectElement) e.currentTarget.requestSubmit();
      }}
    >
      {children}
    </Form>
  );
}
