import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Eleições" };

export default function ElectionsPage() {
  return (
    <ComingSoon title="Eleições">
      <p>
        Em breve: resultados das eleições por município, com dados do Tribunal Superior Eleitoral (TSE), sem cores
        partidárias.
      </p>
    </ComingSoon>
  );
}
