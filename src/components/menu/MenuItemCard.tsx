import type { MenuItem } from "@/data/menu";

export function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <li className="flex flex-col gap-1 rounded-lg border bg-card px-4 py-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
        <h4 className="min-w-0 font-semibold leading-snug text-card-foreground">{item.name}</h4>
        {item.price && (
          <span className="shrink-0 font-display text-base font-semibold text-gold">
            {item.price}
          </span>
        )}
        {item.pending && (
          <span className="shrink-0 rounded-full border border-gold-soft px-2 py-0.5 text-xs text-muted-foreground">
            Preço a confirmar
          </span>
        )}
      </div>
      {item.description && (
        <p className="text-sm text-muted-foreground">{item.description}</p>
      )}
      {item.prices && (
        <dl className="mt-1 flex flex-wrap gap-2">
          {item.prices.map((p) => (
            <div
              key={p.label}
              className="flex items-baseline gap-2 rounded-md bg-secondary px-2.5 py-1 text-sm"
            >
              <dt className="text-muted-foreground">{p.label}</dt>
              <dd className="font-display font-semibold text-gold">{p.price}</dd>
            </div>
          ))}
        </dl>
      )}
    </li>
  );
}
