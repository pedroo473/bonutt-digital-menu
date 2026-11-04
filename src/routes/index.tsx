import { ScrollReveal } from "@/components/menu/ScrollReveal";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Music,
  PartyPopper,
  Search,
  Utensils,
  Trees,
  ShoppingBag,
  CalendarDays,
  MessageCircle,
  MapPin,
  X,
} from "lucide-react";
import hero from "@/assets/menu/hero.jpg";
import eventos from "@/assets/menu/eventos.jpg";
import { contact, menu, searchMenu } from "@/data/menu";
import { CategorySection } from "@/components/menu/CategorySection";
import { loadPublishedMenu } from "@/lib/catalog";

const TITLE = "Cardápio Bonutt — Carnes & Conveniência";
const DESC =
  "Cardápio digital da Bonutt: promoções da semana, porções, carnes especiais, pastéis de angu, chopp, cervejas especiais, drinks e eventos.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState(menu);
  const [showTop, setShowTop] = useState(false);
  const categoryScrollRef = useRef<HTMLUListElement>(null);

  const scrollCategories = (direction: "left" | "right") => {
    categoryScrollRef.current?.scrollBy({
      left: direction === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };
  const results = useMemo(() => searchMenu(query, catalog), [query, catalog]);
  const searching = query.trim().length > 0;

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void loadPublishedMenu().then((publishedMenu) => {
      if (!cancelled && publishedMenu) setCatalog(publishedMenu);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <a
        href="#cardapio"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-foreground"
      >
        Pular para o cardápio
      </a>

      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
          <a href="#topo" className="shrink-0" aria-label="Bonutt — voltar ao início">
            <img
              src="/logo-bonutt.png"
              alt="Bonutt Carnes & Conveniência"
              width={84}
              height={57}
              className="h-11 w-auto sm:h-12"
            />
          </a>
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Pesquisar produto</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar produto..."
              className="h-10 w-full rounded-full border border-input bg-card pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {searching && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar pesquisa"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <X className="h-4 w-4" />
              </button>
            )}
                    </label>

          <a
  href="https://bonuttcarnes.com/"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Acessar o delivery da Bonutt"
  className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.04] hover:brightness-110 hover:shadow-lg hover:shadow-primary/30 active:translate-y-0 active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-ring sm:px-4 sm:text-sm"
>
  <ShoppingBag
    className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] group-hover:scale-110"
    aria-hidden="true"
  />
  <span className="sm:hidden">Delivery</span>
  <span className="hidden sm:inline">Peça pelo Delivery</span>
</a>
        </div>
        <nav aria-label="Categorias" className="mx-auto max-w-6xl">
          <div className="flex items-center gap-1 px-2 sm:px-3">
            {/* Seta esquerda: visível em computadores */}
            <button
              type="button"
              onClick={() => scrollCategories("left")}
              aria-label="Ver categorias anteriores"
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors hover:bg-gold/10 focus:outline-none focus:ring-2 focus:ring-ring sm:flex"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Barra horizontal: permite deslizar no celular */}
            <ul
              ref={categoryScrollRef}
              className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto overscroll-x-contain scroll-smooth px-2 pb-2 pt-1 touch-pan-x"
            >
              {(searching ? results : catalog).map((c) => (
                <li key={c.id} className="shrink-0">
                  <a
                    href={`#${c.id}`}
                    className="block rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:border-gold hover:text-gold focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {c.title}
                  </a>
                </li>
              ))}

              <li className="shrink-0">
                <a
                  href="#eventos"
                  className="block rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  Eventos
                </a>
              </li>
            </ul>

            {/* Seta direita: visível em computadores */}
            <button
              type="button"
              onClick={() => scrollCategories("right")}
              aria-label="Ver próximas categorias"
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors hover:bg-gold/10 focus:outline-none focus:ring-2 focus:ring-ring sm:flex"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </header>

      <main id="topo">
        <section className="relative isolate overflow-hidden">
          <img
            src={hero}
            alt="Carnes grelhadas, pastéis e chopp gelado na mesa da Bonutt"
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-45"
          />

        
<section
  id="atalhos"
  aria-labelledby="atalhos-title"
  className="border-y border-gold/20 bg-background"
>
  <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">

    <div className="mb-9 text-center">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
        Experiência Bonutt
      </span>

      <h2
        id="atalhos-title"
        className="mt-2 font-display text-3xl font-bold text-gold-gradient sm:text-4xl"
      >
        Explore o Bonutt
      </h2>

      <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
        Cardápio, espaço e informações em um só lugar.
      </p>
    </div>

    <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Nosso cardápio */}
      <a
        href="#cardapio"
        className="group flex h-full min-h-47.5 flex-col rounded-xl border border-gold/20 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:bg-secondary"
      >
        <Utensils className="mb-5 h-7 w-7 text-gold transition-transform group-hover:scale-110" />

        <h3 className="font-display text-lg font-bold text-gold">
          Nosso cardápio
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Conheça nossas opções de comidas e pratos.
        </p>

        <span className="mt-auto inline-block pt-5 text-sm font-semibold text-gold">
          Explorar →
        </span>
      </a>

      {/* Eventos */}
      <a
        href="#eventos"
        className="group flex h-full min-h-47.5 flex-col rounded-xl border border-gold/20 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:bg-secondary"
      >
        <CalendarDays className="mb-5 h-7 w-7 text-gold transition-transform group-hover:scale-110" />

        <h3 className="font-display text-lg font-bold text-gold">
          Eventos
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Conheça nosso espaço para confraternizações e aniversários.
        </p>

        <span className="mt-auto inline-block pt-5 text-sm font-semibold text-gold">
          Conhecer →
        </span>
      </a>

      {/* Como chegar */}
      <a
        href="https://www.google.com/maps/search/?api=1&query=Rua+Humberto+de+Moro+500+Inconfidentes+Contagem+MG"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full min-h-47.5 flex-col rounded-xl border border-gold/20 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:bg-secondary"
      >
        <MapPin className="mb-5 h-7 w-7 text-gold transition-transform group-hover:scale-110" />

        <h3 className="font-display text-lg font-bold text-gold">
          Como chegar
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Rua Humberto de Môro, 500 — Contagem/MG.
        </p>

        <span className="mt-auto inline-block pt-5 text-sm font-semibold text-gold">
          Ver localização →
        </span>
      </a>

      {/* Fale com o Bonutt */}
      <a
        href="https://wa.me/5531975080471?text=Ol%C3%A1%2C%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20o%20Bonutt."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Fale com o Bonutt pelo WhatsApp"
        className="group flex h-full min-h-47.5 flex-col rounded-xl border border-gold/20 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:bg-secondary"
      >
        <MessageCircle className="mb-5 h-7 w-7 text-gold transition-transform group-hover:scale-110" />

        <h3 className="font-display text-lg font-bold text-gold">
          Fale com o Bonutt
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          Ficou com dúvidas? Fale diretamente com nossa equipe pelo WhatsApp.
        </p>

        <span className="mt-auto inline-block pt-5 text-sm font-semibold text-gold">
          Entrar em contato →
        </span>
      </a>
    </div>
  </div>
</section>

          
          <div className="bg-fade absolute inset-0 -z-10" />
          <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-14 text-center sm:py-20">
            <img
              src="/logo-bonutt.png"
              alt="Bonutt Carnes & Conveniência"
              width={260}
              height={175}
              className="w-48 sm:w-64 object-contain"
            />
            <h1 className="mt-6 font-display text-5xl font-bold tracking-wider text-gold-gradient sm:text-7xl">
              Cardápio
            </h1>
            <div className="gold-rule my-4 w-48" />
            <p className="max-w-md font-script text-xl italic text-foreground sm:text-2xl">
              Boas escolhas, bons amigos, bons momentos.
            </p>
          </div>
        </section>

        <div id="cardapio" className="mx-auto max-w-6xl space-y-8 px-4 py-8">
          {searching && (
            <p className="text-sm text-muted-foreground" role="status">
              {results.length ? `Resultados para “${query.trim()}”` : ""}
            </p>
          )}
          {results.length === 0 ? (
            <div className="rounded-xl border bg-card px-6 py-12 text-center" role="status">
              <p className="font-display text-xl text-gold">Nenhum produto encontrado</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Não encontramos “{query.trim()}”. Tente outro nome.
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Ver cardápio completo
              </button>
            </div>
          ) : (
            results.map((c, index) => (
  <ScrollReveal
    key={c.id}
    delayMs={(index % 3) * 80}
  >
    <CategorySection category={c} />
  </ScrollReveal>
))
          )}
        </div>

        <section
          id="eventos"
          aria-labelledby="eventos-title"
          className="scroll-mt-36 border-t bg-card"
        >
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-2 md:items-center">
            <img
              src={eventos}
              alt="Deck da Bonutt com mesas e guarda-sóis"
              loading="lazy"
              className="max-h-130 w-full rounded-xl object-cover"
            />
            <div>
              <h2
                id="eventos-title"
                className="font-display text-4xl font-bold text-gold-gradient sm:text-5xl"
              >
                Eventos
              </h2>
              <p className="mt-3 font-script text-xl italic">
                O cenário perfeito para celebrar{" "}
                <span className="font-semibold not-italic text-gold">
                  confraternizações, aniversários, happy hour e momentos especiais!
                </span>
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  [
                    PartyPopper,
                    "Nosso deck é o espaço ideal para confraternizações, aniversários, happy hours e encontros especiais.",
                  ],
                  [
                    Trees,
                    "Um ambiente arejado, agradável e acolhedor para celebrar bons momentos.",
                  ],
                  [CalendarDays, "Consulte nossas condições especiais para reservas e eventos."],
                  [Music, "Em dias com música ao vivo, cobramos couvert artístico de R$7,00."],
                ].map(([Icon, text]) => {
                  const I = Icon as typeof Music;
                  return (
                    <li key={text as string} className="flex gap-3">
                      <I className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
                      <span>{text as string}</span>
                    </li>
                  );
                })}
              </ul>
              <a
  href="https://api.whatsapp.com/send/?phone=5531975080471&text&type=phone_number&app_absent=0"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Fazer reserva com a Bonutt pelo WhatsApp"
  className="mt-8 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 font-display text-lg font-bold text-accent-foreground transition-all duration-300 hover:scale-105 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-ring"
>
  Faça sua reserva!
</a>
              <p className="mt-2 font-script italic text-muted-foreground">
                Bons momentos começam aqui.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-12 text-center">
          <img
            src="/logo-bonutt.png"
            alt="Bonutt Carnes & Conveniência"
            width={160}
            height={108}
            loading="lazy"
            className="w-36 object-contain"
          />
          <p className="mt-5 font-display text-2xl text-gold-gradient">
            Obrigado pela preferência!
          </p>
          <p className="mt-2 font-script text-lg italic">
            “Boas carnes, bons drinks e melhores lembranças.”
          </p>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Se rendeu foto, marca a gente! Nos siga no Instagram e marque o Bonutt nas suas fotos e
            vídeos.
          </p>
          <a
            href={contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <Instagram className="h-5 w-5" aria-hidden />
            {contact.instagram}
          </a>
          <p className="mt-8 text-xs text-muted-foreground">Imagens meramente ilustrativas.</p>
        </div>
      </footer>

      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Voltar ao topo"
          className="fixed bottom-5 right-5 z-40 rounded-full bg-accent p-3 text-accent-foreground shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}