import { menu, type MenuCategory, type MenuGroup, type MenuItem } from "@/data/menu";
import { supabase } from "@/lib/supabase";

// Only these food and non-alcoholic categories are managed by this dashboard.
export const MANAGED_CATEGORY_IDS = [
  "promocoes",
  "pao-de-alho",
  "porcoes",
  "carnes-especiais",
  "linguicas",
  "pasteis-de-angu",
  "coxinhas-bolinhos",
  "petiscos",
  "aguas",
  "sucos",
  "refrigerantes",
  "energeticos",
] as const;

export type ManagedCategoryId = (typeof MANAGED_CATEGORY_IDS)[number];

type CategoryRow = {
  id: string;
  title: string;
  note: string | null;
  active: boolean;
  sort_order: number;
};

type PriceOptionRow = { label: string; price: number | string };

type ProductRow = {
  id: string;
  category_id: string;
  group_title: string | null;
  group_note: string | null;
  group_order: number;
  name: string;
  description: string | null;
  price: number | string | null;
  price_options: PriceOptionRow[] | null;
  pending: boolean;
  no_price: boolean;
  active: boolean;
  sort_order: number;
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function displayPrice(value: number | string): string {
  return currency.format(Number(value));
}

function mapProductsToGroups(rows: ProductRow[]): MenuGroup[] {
  const groups = new Map<string, MenuGroup>();

  for (const row of rows) {
    const key = String(row.group_order) + "|" + (row.group_title ?? "") + "|" + (row.group_note ?? "");
    let group = groups.get(key);

    if (!group) {
      group = {
        ...(row.group_title ? { title: row.group_title } : {}),
        ...(row.group_note ? { note: row.group_note } : {}),
        items: [],
      };
      groups.set(key, group);
    }

    const item: MenuItem = {
      name: row.name,
      ...(row.description ? { description: row.description } : {}),
      ...(row.price !== null ? { price: displayPrice(row.price) } : {}),
      ...(row.price_options?.length
        ? {
            prices: row.price_options.map((option) => ({
              label: option.label,
              price: displayPrice(option.price),
            })),
          }
        : {}),
      ...(row.pending ? { pending: true } : {}),
      ...(row.no_price ? { noPrice: true } : {}),
    };

    group.items.push(item);
  }

  return Array.from(groups.values());
}

/**
 * Loads the managed categories from Supabase and merges them into the original
 * catalogue. Categories outside the dashboard's scope remain untouched.
 * Returning null means the database is not configured/seeded and the static
 * menu should continue to be used.
 */
export async function loadPublishedMenu(): Promise<MenuCategory[] | null> {
  if (!supabase) return null;

  try {
    const [categoryResult, productResult] = await Promise.all([
      supabase.from("menu_categories").select("*").in("id", [...MANAGED_CATEGORY_IDS]).order("sort_order"),
      supabase
        .from("menu_products")
        .select("*")
        .in("category_id", [...MANAGED_CATEGORY_IDS])
        .eq("active", true)
        .order("sort_order"),
    ]);

    if (categoryResult.error) throw categoryResult.error;
    if (productResult.error) throw productResult.error;

    const categories = (categoryResult.data ?? []) as CategoryRow[];
    const products = (productResult.data ?? []) as ProductRow[];

    if (categories.length === 0) return null;

    const categoryMap = new Map(categories.map((category) => [category.id, category]));
    const productsByCategory = new Map<string, ProductRow[]>();

    for (const product of products) {
      const current = productsByCategory.get(product.category_id) ?? [];
      current.push(product);
      productsByCategory.set(product.category_id, current);
    }

    return menu.flatMap((original) => {
      if (!MANAGED_CATEGORY_IDS.includes(original.id as ManagedCategoryId)) return [original];

      const storedCategory = categoryMap.get(original.id);
      if (!storedCategory) return [original];
      if (!storedCategory.active) return [];

      const storedProducts = productsByCategory.get(original.id) ?? [];
      if (storedProducts.length === 0) return [];

      return [
        {
          ...original,
          title: storedCategory.title,
          ...(storedCategory.note ? { note: storedCategory.note } : { note: undefined }),
          groups: mapProductsToGroups(storedProducts),
        },
      ];
    });
  } catch (error) {
    console.error("Não foi possível carregar o cardápio atualizado do Supabase:", error);
    return null;
  }
}
