import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";

export default function NotFound() {
  return (
    <>
      <PageHeader title="Página não encontrada" />
      <div className="page py-8">
        <p className="text-body text-ink-700">
          Não achamos o que você procurava. Volte ao{" "}
          <Link href="/" className="link">
            início
          </Link>{" "}
          ou veja a{" "}
          <Link href="/municipios" className="link">
            lista de municípios
          </Link>
          .
        </p>
      </div>
    </>
  );
}
