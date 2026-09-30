import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Editorial serif for titles and key numbers; the interface stays in Inter.
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: {
    default: "Contas públicas de Sergipe",
    template: "%s · Contas públicas de Sergipe",
  },
  description:
    "Receita, orçamento e gasto real dos 75 municípios de Sergipe e do Governo do Estado, com dados oficiais e critérios públicos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${sourceSerif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-paper-100 text-ink-700">
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-ink-900">
          Pular para o conteúdo
        </a>
        <SiteHeader />
        <main id="conteudo" className="flex-1 pb-16">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
