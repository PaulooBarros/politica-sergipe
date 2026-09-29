import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";

export default function NotFound() {
  return (
    <>
      <PageHeader title="Página não encontrada" />
      <p className="mt-6 text-ink-700">
        Não achamos o que você procurava. Volte ao{" "}
        <Link href="/" className="text-brand-700 underline underline-offset-2">panorama</Link> ou veja a{" "}
        <Link href="/municipios" className="text-brand-700 underline underline-offset-2">lista de municípios</Link>.
      </p>
    </>
  );
}
