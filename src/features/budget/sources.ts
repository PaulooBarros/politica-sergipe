import { SOURCE_URLS, STATE_CODE } from "./data";

/** Direct links to the exact SICONFI queries behind each number, so anyone can check them. */
export function getSourceLinks(code: string, year: number) {
  const base = SOURCE_URLS.siconfi;
  const esfera = code === STATE_CODE ? "E" : "M";
  return [
    {
      label: "Orçamento previsto e atualizado por área (RREO Anexo 02)",
      url: `${base}/rreo?an_exercicio=${year}&nr_periodo=6&co_tipo_demonstrativo=RREO&no_anexo=RREO-Anexo%2002&id_ente=${code}`,
    },
    {
      label: "Gasto pago por área e população (DCA Anexo I-E)",
      url: `${base}/dca?an_exercicio=${year}&no_anexo=DCA-Anexo%20I-E&id_ente=${code}`,
    },
    {
      label: "Receita por origem (DCA Anexo I-C)",
      url: `${base}/dca?an_exercicio=${year}&no_anexo=DCA-Anexo%20I-C&id_ente=${code}`,
    },
    {
      label: "Mínimos de educação e saúde (RREO Anexo 14)",
      url: `${base}/rreo?an_exercicio=${year}&nr_periodo=6&co_tipo_demonstrativo=RREO&no_anexo=RREO-Anexo%2014&id_ente=${code}`,
    },
    {
      label: "Gasto com pessoal (RGF Anexo 01)",
      url: `${base}/rgf?an_exercicio=${year}&in_periodicidade=Q&nr_periodo=3&co_tipo_demonstrativo=RGF&no_anexo=RGF-Anexo%2001&co_esfera=${esfera}&co_poder=E&id_ente=${code}`,
    },
  ];
}
