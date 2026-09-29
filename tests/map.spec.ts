import { expect, test } from "@playwright/test";

test("map renders all 75 municipalities with a legend", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("map").locator("path")).toHaveCount(75);
  await expect(page.getByRole("list", { name: "Legenda" }).getByRole("listitem")).toHaveCount(5);
});

test("clicking a municipality on the map opens its page", async ({ page }) => {
  await page.goto("/?ano=2024");
  await page.getByTestId("map").locator('path[data-code="2803500"]').click();
  await expect(page).toHaveURL(/\/municipios\/lagarto\?ano=2024/);
  await expect(page.getByRole("heading", { level: 1, name: "Lagarto" })).toBeVisible();
});

test("changing the map indicator keeps the year", async ({ page }) => {
  await page.goto("/?ano=2023");
  await page.getByLabel("Indicador").selectOption({ label: "Saúde por habitante" });
  await expect(page).toHaveURL(/indicador=saude/);
  await expect(page).toHaveURL(/ano=2023/);
});
