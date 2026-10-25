import type { MenuCategory } from "@/data/menu";
import { MenuItemCard } from "./MenuItemCard";

export function CategorySection({ category }: { category: MenuCategory }) {
  return (
    <section id={category.id} aria-labelledby={`${category.id}-title`} className="scroll-mt-36">
      <div className="overflow-hidden rounded-xl border bg-card md:grid md:grid-cols-[2fr_3fr]">
        <div className="relative h-44 md:h-full md:min-h-64">
          <img
            src={category.image}
            alt={category.imageAlt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="bg-fade absolute inset-x-0 bottom-0 h-16 md:hidden" />
        </div>
        <div className="p-4 sm:p-6">
          <h2
            id={`${category.id}-title`}
            className="font-display text-2xl font-bold tracking-wide text-gold-gradient sm:text-3xl"
          >
            {category.title}
          </h2>
          <div className="gold-rule my-3" />
          {category.note && (
            <p className="mb-4 rounded-md border-l-2 border-primary bg-secondary px-3 py-2 text-sm">
              {category.note}
            </p>
          )}
          <div className="space-y-5">
            {category.groups.map((g, i) => (
              <div key={g.title ?? i}>
                {g.title && (
                  <h3 className="mb-2 flex flex-wrap items-baseline gap-x-3 font-display text-lg text-foreground">
                    {g.title}
                    {g.note && <span className="text-sm text-gold">{g.note}</span>}
                  </h3>
                )}
                <ul className="grid gap-2 sm:grid-cols-2">
                  {g.items.map((item) => (
                    <MenuItemCard key={item.name} item={item} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] uppercase tracking-widest text-muted-foreground">
            Imagens meramente ilustrativas
          </p>
        </div>
      </div>
    </section>
  );
}
