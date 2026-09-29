import type { Metadata } from "next";
import ComingSoon from "@/components/ui/ComingSoon";

export const metadata: Metadata = { title: "Quiz cívico" };

export default function QuizPage() {
  return (
    <ComingSoon title="Quiz cívico">
      <p>
        Em breve: perguntas sobre como funcionam a prefeitura, a Câmara, o Governo do Estado e a Assembleia, sempre com
        a fonte da resposta.
      </p>
    </ComingSoon>
  );
}
