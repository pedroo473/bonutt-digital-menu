import { describe, expect, it } from "vitest";
import { menu, searchMenu } from "@/data/menu";

const find = (name: string) =>
  menu.flatMap((c) => c.groups.flatMap((g) => g.items)).find((i) => i.name === name);

describe("cardápio Bonutt", () => {
  it("Picanha com fritas custa R$ 109,90", () => {
    expect(find("Picanha com fritas")?.price).toBe("R$ 109,90");
  });
  it("Lagunitas IPA chopp 500 ml custa R$ 24,00", () => {
    const chopp = menu.find((c) => c.id === "chopp")!;
    const item = chopp.groups[1]!.items.find((i) => i.name === "Lagunitas IPA");
    expect(item?.prices?.[1]).toEqual({ label: "500 ml", price: "R$ 24,00" });
  });
  it("long necks ficam com preço pendente", () => {
    expect(find("Blue Moon")?.pending).toBe(true);
  });
  it("pesquisa ignora acentos", () => {
    const r = searchMenu("agua de coco");
    expect(r.flatMap((c) => c.groups.flatMap((g) => g.items)).map((i) => i.name)).toEqual([
      "Água de Coco (caixinha)",
    ]);
  });
});
