import { notFound, permanentRedirect } from "next/navigation";
import { getMunicipalityBySlug } from "@/features/municipalities/registry";

/** Short links: /aracaju -> /municipios/aracaju */
export default async function ShortLink({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  if (getMunicipalityBySlug(slug)) permanentRedirect(`/municipios/${slug}`);
  if (slug === "estado-de-sergipe" || slug === "governo") permanentRedirect("/estado");
  notFound();
}
