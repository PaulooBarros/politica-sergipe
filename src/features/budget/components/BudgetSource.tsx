import Link from "next/link";
import SourceNote from "@/components/ui/SourceNote";
import { SOURCES } from "../data";

export default function BudgetSource({ year }: { year: number }) {
  return (
    <SourceNote>
      {SOURCES.planned}; {SOURCES.paid}; {SOURCES.revenue}. Exercício {year}. Valores sem operações
      intraorçamentárias (repasses entre órgãos do próprio ente). Como são relatórios diferentes, o pago pode passar
      levemente de 100% do autorizado.{" "}
      <Link href="/sobre" className="underline underline-offset-2">
        Metodologia
      </Link>
      .
    </SourceNote>
  );
}
