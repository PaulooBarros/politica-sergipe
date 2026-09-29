import { expect, test } from "@playwright/test";

test.describe("overview", () => {
  test("shows state totals, territories and the state government", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Sergipe em números" })).toBeVisible();
    await expect(page.getByTestId("stat-planned")).toContainText("R$");
    await expect(page.getByTestId("stat-paid")).toContainText("R$");
    await expect(page.getByTestId("stat-execution")).toContainText("%");
    await expect(page.getByTestId("stat-per-capita")).toContainText("R$");
    await expect(page.getByTestId("territory-table").locator("tbody tr")).toHaveCount(8);
    await expect(page.getByRole("link", { name: /Ver orçamento do Estado/ })).toBeVisible();
  });

  test("search finds a municipality and opens its page", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Encontre seu município").fill("itabai");
    const results = page.getByRole("main").getByRole("listitem").getByRole("link");
    await expect(results.filter({ hasText: "Itabaianinha" })).toBeVisible();
    await results.filter({ hasText: /^Itabaiana/ }).first().click();
    await expect(page.getByRole("heading", { level: 1, name: "Itabaiana" })).toBeVisible();
  });

  test("navigation reaches every section", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Principal" });
    for (const [label, heading] of [
      ["Municípios", "Municípios de Sergipe"],
      ["Governo do Estado", "Governo do Estado de Sergipe"],
      ["Eleições", "Eleições"],
      ["Quiz", "Quiz cívico"],
      ["Sobre os dados", "Sobre os dados"],
    ]) {
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    }
  });
});

test.describe("municipality page", () => {
  test("shows headline numbers, summary, areas and comparisons", async ({ page }) => {
    await page.goto("/municipios/aracaju?ano=2025");
    await expect(page.getByRole("heading", { level: 1, name: "Aracaju" })).toBeVisible();
    await expect(page.getByText("Território: Grande Aracaju")).toBeVisible();
    await expect(page.getByTestId("summary")).toContainText("Em 2025, Aracaju pagou");
    await expect(page.getByTestId("stat-planned")).toContainText("R$");
    await expect(page.getByTestId("stat-per-capita")).toContainText("Média dos municípios de Sergipe");
    await expect(page.getByTestId("area-table")).toContainText("Saúde");
    await expect(page.getByTestId("area-table")).toContainText("Educação");
    await expect(page.getByText(/Tesouro Nacional – SICONFI/).first()).toBeVisible();
  });

  test("year filter updates the URL and the numbers", async ({ page }) => {
    await page.goto("/municipios/aracaju?ano=2025");
    const paid = page.getByTestId("stat-paid");
    const before = await paid.textContent();
    await page.getByLabel("Ano").selectOption("2021");
    await expect(page).toHaveURL(/ano=2021/);
    await expect(paid).not.toHaveText(before!);
    await expect(page.getByTestId("summary")).toContainText("Em 2021");
  });

  test("clicking an area focuses the evolution chart on it", async ({ page }) => {
    await page.goto("/municipios/lagarto?ano=2025");
    await page.getByTestId("area-table").getByRole("link", { name: "Educação" }).click();
    await expect(page).toHaveURL(/area=12/);
    await expect(page.locator("#evolucao")).toContainText("Gasto real por habitante em Educação");
  });

  test("unknown municipality returns the not-found page", async ({ page }) => {
    const res = await page.goto("/municipios/nao-existe");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
  });

  test("every municipality page loads", async ({ request }) => {
    test.setTimeout(300_000);
    const html = await (await request.get("/municipios")).text();
    const slugs = [...new Set([...html.matchAll(/href="\/municipios\/([a-z0-9-]+)\?/g)].map((m) => m[1]))];
    expect(slugs).toHaveLength(75);
    for (const slug of slugs) {
      const res = await request.get(`/municipios/${slug}`);
      expect(res.status(), slug).toBe(200);
    }
  });
});

test.describe("municipality list", () => {
  test("filters by territory", async ({ page }) => {
    await page.goto("/municipios?ano=2025");
    await expect(page.getByTestId("result-count")).toContainText("75 municípios");
    await page.getByLabel("Território").selectOption({ label: "Centro-Sul Sergipano" });
    await expect(page).toHaveURL(/territorio=centro-sul-sergipano/);
    await expect(page.getByTestId("result-count")).toContainText("5 municípios");
  });

  test("sorts by population", async ({ page }) => {
    await page.goto("/municipios?ano=2025");
    await page.getByRole("link", { name: "População" }).click();
    await expect(page).toHaveURL(/ordem=populacao/);
    await expect(page.getByTestId("municipality-table").locator("tbody tr").first()).toContainText("Aracaju");
  });

  test("searches by name without accents", async ({ page }) => {
    await page.goto("/municipios");
    await page.getByLabel("Buscar por nome").fill("sao cristovao");
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(page.getByTestId("result-count")).toContainText("1 município");
    await expect(page.getByTestId("municipality-table")).toContainText("São Cristóvão");
  });
});

test("state government page shows its budget", async ({ page }) => {
  await page.goto("/estado?ano=2024");
  await expect(page.getByRole("heading", { level: 1, name: "Governo do Estado de Sergipe" })).toBeVisible();
  await expect(page.getByTestId("summary")).toContainText("Em 2024, o Governo do Estado pagou");
  await expect(page.getByTestId("area-table")).toContainText("Saúde");
});
