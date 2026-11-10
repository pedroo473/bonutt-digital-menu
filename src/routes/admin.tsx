import { createFileRoute } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LogOut,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import { menu } from "@/data/menu";
import { MANAGED_CATEGORY_IDS } from "@/lib/catalog";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type CategoryRow = {
  id: string;
  title: string;
  note: string | null;
  active: boolean;
  sort_order: number;
};

type PriceOption = { label: string; price: number };
type ProductRow = {
  id: string;
  category_id: string;
  group_title: string | null;
  group_note: string | null;
  group_order: number;
  name: string;
  description: string | null;
  price: number | string | null;
  price_options: PriceOption[] | null;
  pending: boolean;
  no_price: boolean;
  active: boolean;
  sort_order: number;
};

type PriceOptionDraft = { label: string; price: string };
type ProductDraft = {
  id: string | null;
  category_id: string;
  name: string;
  description: string;
  price: string;
  group_title: string;
  group_note: string;
  price_options: PriceOptionDraft[];
  pending: boolean;
  no_price: boolean;
  active: boolean;
};

const managedMenu = menu.filter((category) =>
  MANAGED_CATEGORY_IDS.includes(category.id as (typeof MANAGED_CATEGORY_IDS)[number]),
);

const initialDraft = (): ProductDraft => ({
  id: null,
  category_id: managedMenu[0]?.id ?? "promocoes",
  name: "",
  description: "",
  price: "",
  group_title: "",
  group_note: "",
  price_options: [],
  pending: false,
  no_price: false,
  active: true,
});

function parseBrazilianPrice(value: string): number | null {
  const cleaned = value.trim().replace(/[^\d,.-]/g, "");
  if (!cleaned) return null;

  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned;
  const parsed = Number(normalized);

  return Number.isFinite(parsed) && parsed >= 0 ? Number(parsed.toFixed(2)) : null;
}

function toPriceInput(value: number | string | null): string {
  if (value === null || value === undefined || value === "") return "";
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return "";
  return numeric.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formata o valor enquanto a pessoa digita somente os números.
 * Exemplo: 1 -> 0,01 | 1290 -> 12,90.
 * Também limita a entrada a 8 dígitos inteiros + 2 casas decimais
 * para respeitar numeric(10, 2) no banco.
 */
function formatPriceInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (!digits) return "";
  const value = Number(digits) / 100;
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function toCurrency(value: number | string | null): string {
  if (value === null || value === undefined || value === "") return "Sem preço";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administração | Bonutt" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab] = useState<"products" | "categories">("products");
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [categoryEdits, setCategoryEdits] = useState<
    Record<string, { title: string; note: string; active: boolean }>
  >({});
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);
  const [saving, setSaving] = useState(false);

  const notify = (text: string, isError = false) => {
    setMessage(text);
    setMessageIsError(isError);
  };

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setAuthLoading(false);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (event === "PASSWORD_RECOVERY") {
        setPasswordRecovery(true);
      }
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session) {
      setIsAdmin(false);
      return;
    }

    let mounted = true;
    setIsAdmin(null);
    void supabase.rpc("is_menu_admin").then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setMessage("Não foi possível validar a permissão administrativa. Confira o SQL de configuração.");
        setMessageIsError(true);
        setIsAdmin(false);
        return;
      }
      setIsAdmin(data === true);
    });

    return () => {
      mounted = false;
    };
  }, [session]);

  useEffect(() => {
    const client = supabase;
    if (!client || !isAdmin) return;

    let mounted = true;

    const load = async () => {
      setDataLoading(true);
      try {
        const [categoryResult, productResult] = await Promise.all([
          client
            .from("menu_categories")
            .select("*")
            .in("id", [...MANAGED_CATEGORY_IDS])
            .order("sort_order"),
          client
            .from("menu_products")
            .select("*")
            .in("category_id", [...MANAGED_CATEGORY_IDS])
            .order("sort_order"),
        ]);
        
        if (!mounted) return;

        if (categoryResult.error || productResult.error) {
          const errorMessage =
            categoryResult.error?.message ??
            productResult.error?.message ??
            "Erro desconhecido ao carregar os dados.";

          notify("Erro ao carregar o painel: " + errorMessage, true);
        } else {
          setCategories((categoryResult.data ?? []) as CategoryRow[]);
          setProducts((productResult.data ?? []) as ProductRow[]);
        }
      } catch (error) {
        if (mounted) {
          notify(
            error instanceof Error
              ? "Falha de conexão com o Supabase: " + error.message
              : "Falha inesperada ao carregar o painel.",
            true,
          );
        }
      } finally {
        if (mounted) setDataLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [isAdmin, refreshToken]);

  const categoryTitle = (id: string) =>
    categories.find((category) => category.id === id)?.title ??
    managedMenu.find((category) => category.id === id)?.title ??
    "Categoria";

  const filteredProducts = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase("pt-BR");
    return products.filter((product) => {
      const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter;
      const matchesSearch =
        !normalized ||
        product.name.toLocaleLowerCase("pt-BR").includes(normalized) ||
        (product.description ?? "").toLocaleLowerCase("pt-BR").includes(normalized);
      return matchesCategory && matchesSearch;
    });
  }, [products, search, categoryFilter]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;

    setLoginLoading(true);
    notify("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoginLoading(false);

    if (error) notify("Não foi possível entrar. Confira o e-mail e a senha.", true);
  };

  const handlePasswordRecovery = async () => {
    const client = supabase;

    if (!client) {
      notify("Supabase não configurado. Confira VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.", true);
      return;
    }

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      notify("Informe seu e-mail para receber o link de recuperação.", true);
      return;
    }

    setRecoveryLoading(true);
    notify("");

    try {
      const redirectTo = new URL("/admin", window.location.origin).toString();
      const { error } = await client.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo,
      });

      if (error) {
        notify("Não foi possível enviar o e-mail: " + error.message, true);
        return;
      }

      notify("Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.");
    } catch (error) {
      notify(
        error instanceof TypeError
          ? "Falha de conexão com o Supabase. Verifique a URL, a chave pública, a conexão de internet e as configurações de rede."
          : error instanceof Error
            ? "Erro ao solicitar recuperação: " + error.message
            : "Não foi possível concluir a solicitação de recuperação.",
        true,
      );
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const client = supabase;

    if (!client) {
      notify("Supabase não configurado. Confira as variáveis de ambiente.", true);
      return;
    }

    if (newPassword.length < 8) {
      notify("A nova senha precisa ter pelo menos 8 caracteres.", true);
      return;
    }

    if (newPassword !== confirmPassword) {
      notify("As senhas não conferem. Digite novamente.", true);
      return;
    }

    setSaving(true);

    try {
      const { error } = await client.auth.updateUser({ password: newPassword });

      if (error) {
        notify("Não foi possível atualizar a senha: " + error.message, true);
        return;
      }

      setNewPassword("");
      setConfirmPassword("");
      setPasswordRecovery(false);
      await client.auth.signOut();
      notify("Senha atualizada. Entre com sua nova senha.");
    } catch (error) {
      notify(
        error instanceof Error
          ? "Falha ao atualizar a senha: " + error.message
          : "Não foi possível atualizar a senha.",
        true,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setDraft(null);
    setPassword("");
    notify("Sessão encerrada.");
  };

  const loadInitialMenu = async () => {
    if (!supabase) return;
    if (products.length > 0) {
      notify("Já existem produtos cadastrados. A importação inicial foi bloqueada para evitar sobrescrever alterações.", true);
      return;
    }

    if (!window.confirm("Carregar no banco os alimentos e itens não alcoólicos da versão atual do cardápio?")) {
      return;
    }

    setSaving(true);
    notify("");

    const categoryRows = managedMenu.map((category, index) => ({
      id: category.id,
      title: category.title,
      note: category.note ?? null,
      active: true,
      sort_order: index,
    }));

    const productRows = managedMenu.flatMap((category) =>
      category.groups.flatMap((group, groupIndex) =>
        group.items.map((item, itemIndex) => ({
          id: "seed-" + category.id + "-" + groupIndex + "-" + itemIndex,
          category_id: category.id,
          group_title: group.title ?? null,
          group_note: group.note ?? null,
          group_order: groupIndex,
          name: item.name,
          description: item.description ?? null,
          price: item.price ? parseBrazilianPrice(item.price) : null,
          price_options: (item.prices ?? [])
            .map((option) => ({
              label: option.label,
              price: parseBrazilianPrice(option.price),
            }))
            .filter((option): option is { label: string; price: number } => option.price !== null),
          pending: item.pending ?? false,
          no_price: item.noPrice ?? false,
          active: true,
          sort_order: groupIndex * 1000 + itemIndex,
        })),
      ),
    );

    const categoryResult = await supabase
      .from("menu_categories")
      .upsert(categoryRows, { onConflict: "id" });

    if (categoryResult.error) {
      setSaving(false);
      notify("Erro ao importar categorias: " + categoryResult.error.message, true);
      return;
    }

    const productResult = await supabase
      .from("menu_products")
      .upsert(productRows, { onConflict: "id" });

    setSaving(false);

    if (productResult.error) {
      notify("As categorias foram carregadas, mas houve erro nos produtos: " + productResult.error.message, true);
      setRefreshToken((value) => value + 1);
      return;
    }

    notify("Cardápio inicial importado. Agora você já pode editar os produtos.");
    setRefreshToken((value) => value + 1);
  };

  const startNewProduct = () => {
    setDraft(initialDraft());
    setTab("products");
    notify("");
  };

  const startEditProduct = (product: ProductRow) => {
    setDraft({
      id: product.id,
      category_id: product.category_id,
      name: product.name,
      description: product.description ?? "",
      price: toPriceInput(product.price),
      group_title: product.group_title ?? "",
      group_note: product.group_note ?? "",
      price_options: (product.price_options ?? []).map((option) => ({
        label: option.label,
        price: toPriceInput(option.price),
      })),
      pending: product.pending,
      no_price: product.no_price,
      active: product.active,
    });
    setTab("products");
    notify("");
  };

  const updateDraft = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !draft) return;

    const price = parseBrazilianPrice(draft.price);
    const filledOptions = draft.price_options.filter(
      (option) => option.label.trim() || option.price.trim(),
    );
    const options = filledOptions.map((option) => ({
      label: option.label.trim(),
      price: parseBrazilianPrice(option.price),
    }));

    if (!draft.no_price && !draft.pending && price === null && options.length === 0) {
      notify("Informe um preço ou marque uma das opções de preço especial.", true);
      return;
    }

    if (options.some((option) => !option.label || option.price === null)) {
      notify("Complete o nome e o preço de cada tamanho ou variação.", true);
      return;
    }

    setSaving(true);
    const payload = {
      category_id: draft.category_id,
      group_title: draft.group_title.trim() || null,
      group_note: draft.group_note.trim() || null,
      group_order: products.find((product) => product.id === draft.id)?.group_order ?? 0,
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      price: draft.no_price || draft.pending ? null : price,
      price_options: options.map((option) => ({
        label: option.label,
        price: option.price as number,
      })),
      pending: draft.pending,
      no_price: draft.no_price,
      active: draft.active,
      sort_order:
        products.find((product) => product.id === draft.id)?.sort_order ??
        (products.reduce((max, product) => Math.max(max, product.sort_order), 0) + 1),
    };

    const result = draft.id
      ? await supabase.from("menu_products").update(payload).eq("id", draft.id)
      : await supabase
          .from("menu_products")
          .insert({ ...payload, id: crypto.randomUUID() });

    setSaving(false);

    if (result.error) {
      notify("Não foi possível salvar o produto: " + result.error.message, true);
      return;
    }

    setDraft(null);
    notify("Produto salvo. O cardápio público será atualizado automaticamente.");
    setRefreshToken((value) => value + 1);
  };

  const toggleProduct = async (product: ProductRow) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("menu_products")
      .update({ active: !product.active })
      .eq("id", product.id);

    if (error) {
      notify("Não foi possível atualizar a disponibilidade: " + error.message, true);
      return;
    }

    notify(product.active ? "Produto ocultado do cardápio." : "Produto voltou a aparecer no cardápio.");
    setRefreshToken((value) => value + 1);
  };

  const deleteProduct = async (product: ProductRow) => {
    if (!supabase) return;
    if (!window.confirm("Excluir definitivamente " + product.name + "?")) return;

    const { error } = await supabase.from("menu_products").delete().eq("id", product.id);
    if (error) {
      notify("Não foi possível excluir o produto: " + error.message, true);
      return;
    }

    notify("Produto excluído.");
    setRefreshToken((value) => value + 1);
  };

  const saveCategory = async (
    event: FormEvent<HTMLFormElement>,
    category: CategoryRow,
  ) => {
    event.preventDefault();
    if (!supabase) return;

    const edit = categoryEdits[category.id] ?? {
      title: category.title,
      note: category.note ?? "",
      active: category.active,
    };

    if (!edit.title.trim()) {
      notify("O nome da categoria é obrigatório.", true);
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("menu_categories")
      .update({
        title: edit.title.trim(),
        note: edit.note.trim() || null,
        active: edit.active,
      })
      .eq("id", category.id);
    setSaving(false);

    if (error) {
      notify("Não foi possível salvar a categoria: " + error.message, true);
      return;
    }

    notify("Categoria atualizada.");
    setRefreshToken((value) => value + 1);
  };

  if (!isSupabaseConfigured) {
    return (
      <SetupRequired />
    );
  }

  if (typeof window === "undefined" || !supabase || authLoading) {
    return <LoadingScreen />;
  }

  if (passwordRecovery) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-gold/25 bg-card p-7 shadow-xl">
          <div className="mb-6 text-center">
            <img src="/logo-bonutt.png" alt="Bonutt" className="mx-auto mb-5 h-20 w-auto object-contain" />
            <h1 className="font-display text-2xl font-bold text-gold-gradient">Criar nova senha</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Escolha uma nova senha para acessar a administração do cardápio.
            </p>
          </div>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <label className="block space-y-1.5 text-sm">
              <span className="font-semibold">Nova senha</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                className="h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
                placeholder="Mínimo de 8 caracteres"
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-semibold">Confirmar nova senha</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                className="h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
                placeholder="Digite a senha novamente"
              />
            </label>
            {message && <Notice text={message} isError={messageIsError} />}
            <button
              type="submit"
              disabled={saving}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
            >
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar nova senha
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-gold/25 bg-card p-7 shadow-xl">
          <a href="/" className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> Voltar ao cardápio
          </a>
          <div className="mb-6 text-center">
            <img src="/logo-bonutt.png" alt="Bonutt" className="mx-auto mb-5 h-20 w-auto object-contain" />
            <h1 className="font-display text-2xl font-bold text-gold-gradient">Área administrativa</h1>
            <p className="mt-2 text-sm text-muted-foreground">Entre com seu e-mail e senha autorizados.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block space-y-1.5 text-sm">
              <span className="font-semibold">E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
                className="h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
                placeholder="seuemail@exemplo.com"
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-semibold">Senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring"
                placeholder="Sua senha"
              />
            </label>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void handlePasswordRecovery()}
                disabled={recoveryLoading}
                className="text-sm font-semibold text-gold hover:underline disabled:opacity-50"
              >
                {recoveryLoading ? "Enviando..." : "Esqueci minha senha"}
              </button>
            </div>
            {message && <Notice text={message} isError={messageIsError} />}
            <button
              type="submit"
              disabled={loginLoading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
            >
              {loginLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Entrar
            </button>
          </form>
          <p className="mt-5 text-center text-xs text-muted-foreground">
            Acesso restrito a pessoas cadastradas pela administração.
          </p>
        </div>
      </main>
    );
  }

  if (isAdmin === null) return <LoadingScreen />;

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border border-destructive/40 bg-card p-7 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-destructive" />
          <h1 className="font-display text-2xl font-bold">Acesso não autorizado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta conta ainda não possui permissão para administrar o cardápio.
          </p>
          <button onClick={() => void handleLogout()} className="mt-6 rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground">
            Sair
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-gold/20 bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo-bonutt.png" alt="Bonutt" className="h-12 w-auto object-contain" />
            <div>
              <p className="font-display text-lg font-bold text-gold-gradient">Administração</p>
              <p className="text-xs text-muted-foreground">Gerenciamento do cardápio</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="hidden rounded-lg border border-gold/30 px-3 py-2 text-sm hover:bg-secondary sm:inline-flex">
              Ver cardápio
            </a>
            <button onClick={() => void handleLogout()} className="inline-flex items-center gap-2 rounded-lg border border-gold/30 px-3 py-2 text-sm hover:bg-secondary">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-7">
        <section className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Produtos cadastrados" value={products.length} icon={<Package className="h-5 w-5" />} />
          <StatCard label="Visíveis no cardápio" value={products.filter((product) => product.active).length} icon={<Eye className="h-5 w-5" />} />
          <StatCard label="Categorias" value={categories.length} icon={<Tags className="h-5 w-5" />} />
        </section>

        {message && <Notice text={message} isError={messageIsError} />}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-xl border border-gold/20 bg-card p-1">
            <button
              onClick={() => setTab("products")}
              className={"rounded-lg px-4 py-2 text-sm font-semibold " + (tab === "products" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              Produtos
            </button>
            <button
              onClick={() => setTab("categories")}
              className={"rounded-lg px-4 py-2 text-sm font-semibold " + (tab === "categories" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              Categorias
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {products.length === 0 && (
              <button
                onClick={() => void loadInitialMenu()}
                disabled={saving || dataLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-gold/40 px-3 py-2 text-sm font-semibold text-gold hover:bg-gold/10 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" /> Importar cardápio inicial
              </button>
            )}
            <button
              onClick={() => setRefreshToken((value) => value + 1)}
              disabled={dataLoading}
              aria-label="Atualizar lista"
              className="inline-flex items-center gap-2 rounded-lg border border-gold/30 px-3 py-2 text-sm hover:bg-secondary disabled:opacity-50"
            >
              <RefreshCw className={"h-4 w-4 " + (dataLoading ? "animate-spin" : "")} /> Atualizar
            </button>
          </div>
        </div>

        {tab === "products" && (
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Pesquisar produto..."
                  className="h-11 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="h-11 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Todas as categorias</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}
              </select>
              <button
                onClick={startNewProduct}
                disabled={categories.length === 0}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" /> Novo produto
              </button>
            </div>

            {draft && (
              <form onSubmit={saveProduct} className="space-y-4 rounded-2xl border border-gold/30 bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-bold text-gold">{draft.id ? "Editar produto" : "Novo produto"}</h2>
                    <p className="text-xs text-muted-foreground">Preencha os campos e clique em salvar.</p>
                  </div>
                  <button type="button" onClick={() => setDraft(null)} aria-label="Fechar formulário" className="rounded-lg p-2 hover:bg-secondary">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5 text-sm">
                    <span className="font-semibold">Nome do produto *</span>
                    <input value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} required maxLength={120} className="h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-semibold">Categoria *</span>
                    <select value={draft.category_id} onChange={(event) => updateDraft("category_id", event.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring">
                      {categories.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1.5 text-sm sm:col-span-2">
                    <span className="font-semibold">Descrição</span>
                    <textarea value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} rows={2} maxLength={500} className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" placeholder="Informações adicionais sobre o produto" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-semibold">Preço (R$)</span>
                    <input value={draft.price} onChange={(event) => updateDraft("price", formatPriceInput(event.target.value))} inputMode="numeric" placeholder="Digite só os números (1290 = 12,90)" aria-describedby="price-format-help" className="h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring" />
                    <span id="price-format-help" className="text-xs text-muted-foreground">Digite apenas os números. Exemplo: 1290 será exibido como R$ 12,90.</span>
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-semibold">Grupo (opcional)</span>
                    <input value={draft.group_title} onChange={(event) => updateDraft("group_title", event.target.value)} maxLength={80} placeholder="Ex.: Tradicionais" className="h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring" />
                  </label>
                  <label className="space-y-1.5 text-sm sm:col-span-2">
                    <span className="font-semibold">Observação do grupo (opcional)</span>
                    <input value={draft.group_note} onChange={(event) => updateDraft("group_note", event.target.value)} maxLength={160} placeholder="Ex.: cada unidade" className="h-11 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring" />
                  </label>
                </div>

                <div className="space-y-3 rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">Tamanhos ou variações de preço</h3>
                      <p className="text-xs text-muted-foreground">Use quando o mesmo produto tiver mais de um tamanho.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateDraft("price_options", [...draft.price_options, { label: "", price: "" }])}
                      className="inline-flex items-center gap-1 rounded-lg border border-gold/30 px-3 py-2 text-xs font-semibold text-gold hover:bg-gold/10"
                    >
                      <Plus className="h-3.5 w-3.5" /> Adicionar variação
                    </button>
                  </div>
                  {draft.price_options.map((option, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <input value={option.label} onChange={(event) => updateDraft("price_options", draft.price_options.map((current, i) => i === index ? { ...current, label: event.target.value } : current))} placeholder="Tamanho (ex.: 300 ml)" className="h-10 min-w-0 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                      <input value={option.price} onChange={(event) => updateDraft("price_options", draft.price_options.map((current, i) => i === index ? { ...current, price: formatPriceInput(event.target.value) } : current))} inputMode="numeric" placeholder="Só números (1200 = 12,00)" aria-label={"Preço da variação " + (index + 1)} className="h-10 min-w-0 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                      <button type="button" aria-label="Remover variação" onClick={() => updateDraft("price_options", draft.price_options.filter((_current, i) => i !== index))} className="rounded-lg border border-border px-3 text-muted-foreground hover:border-destructive hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={draft.active} onChange={(event) => updateDraft("active", event.target.checked)} className="h-4 w-4 accent-primary" />
                    Exibir no cardápio
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={draft.pending} onChange={(event) => updateDraft("pending", event.target.checked)} className="h-4 w-4 accent-primary" />
                    Preço a confirmar
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={draft.no_price} onChange={(event) => updateDraft("no_price", event.target.checked)} className="h-4 w-4 accent-primary" />
                    Item sem preço individual
                  </label>
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                  <button type="button" onClick={() => setDraft(null)} className="rounded-lg border border-border px-4 py-2.5 text-sm hover:bg-secondary">Cancelar</button>
                  <button type="submit" disabled={saving || !draft.name.trim()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50">
                    {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Salvar produto
                  </button>
                </div>
              </form>
            )}

            {dataLoading ? (
              <LoadingScreen compact />
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gold/30 bg-card px-5 py-12 text-center">
                <Package className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
                <p className="font-semibold">Nenhum produto encontrado</p>
                <p className="mt-1 text-sm text-muted-foreground">Importe o cardápio inicial ou cadastre um produto.</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {filteredProducts.map((product) => (
                  <article key={product.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="mb-1 text-[11px] uppercase tracking-wide text-gold">{categoryTitle(product.category_id)}</p>
                        <h3 className="font-semibold">{product.name}</h3>
                        {product.description && <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>}
                      </div>
                      <span className={"shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold " + (product.active ? "bg-emerald-500/10 text-emerald-400" : "bg-secondary text-muted-foreground")}>
                        {product.active ? "Ativo" : "Oculto"}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      {product.price !== null && <span className="rounded-md bg-secondary px-2.5 py-1 font-semibold text-gold">{toCurrency(product.price)}</span>}
                      {(product.price_options ?? []).map((option) => (
                        <span key={option.label} className="rounded-md bg-secondary px-2.5 py-1">
                          <span className="text-muted-foreground">{option.label}: </span>
                          <strong className="text-gold">{toCurrency(option.price)}</strong>
                        </span>
                      ))}
                      {product.pending && <span className="rounded-md border border-gold/30 px-2.5 py-1 text-xs">Preço a confirmar</span>}
                      {product.no_price && <span className="rounded-md border border-border px-2.5 py-1 text-xs">Sem preço individual</span>}
                    </div>
                    {product.group_title && <p className="mt-2 text-xs text-muted-foreground">Grupo: {product.group_title}</p>}
                    <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-border pt-3">
                      <button onClick={() => void toggleProduct(product)} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs hover:bg-secondary">
                        {product.active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        {product.active ? "Ocultar" : "Exibir"}
                      </button>
                      <button onClick={() => startEditProduct(product)} className="inline-flex items-center gap-1 rounded-lg border border-gold/30 px-3 py-2 text-xs text-gold hover:bg-gold/10">
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                      <button onClick={() => void deleteProduct(product)} className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-3 py-2 text-xs text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" /> Excluir
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "categories" && (
          <section className="space-y-3">
            <div className="rounded-xl border border-gold/20 bg-card p-4">
              <h2 className="font-display text-xl font-bold text-gold">Categorias do painel</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Altere o nome, a observação ou oculte uma categoria inteira do cardápio.
              </p>
            </div>
            {categories.map((category) => {
              const edit = categoryEdits[category.id] ?? {
                title: category.title,
                note: category.note ?? "",
                active: category.active,
              };

              return (
                <form key={category.id} onSubmit={(event) => void saveCategory(event, category)} className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <label className="space-y-1.5 text-sm">
                    <span className="font-semibold">Nome</span>
                    <input value={edit.title} onChange={(event) => setCategoryEdits((current) => ({ ...current, [category.id]: { ...edit, title: event.target.value } }))} className="h-10 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-semibold">Observação</span>
                    <input value={edit.note} onChange={(event) => setCategoryEdits((current) => ({ ...current, [category.id]: { ...edit, note: event.target.value } }))} className="h-10 w-full rounded-lg border border-input bg-background px-3 outline-none focus:ring-2 focus:ring-ring" />
                  </label>
                  <div className="flex items-center justify-between gap-3">
                    <label className="inline-flex items-center gap-2 whitespace-nowrap text-sm">
                      <input type="checkbox" checked={edit.active} onChange={(event) => setCategoryEdits((current) => ({ ...current, [category.id]: { ...edit, active: event.target.checked } }))} className="h-4 w-4 accent-primary" />
                      Visível
                    </label>
                    <button type="submit" disabled={saving} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">
                      <Save className="h-3.5 w-3.5" /> Salvar
                    </button>
                  </div>
                </form>
              );
            })}
            {categories.length === 0 && !dataLoading && (
              <div className="rounded-xl border border-dashed border-gold/30 bg-card p-8 text-center text-sm text-muted-foreground">
                Importe primeiro o cardápio inicial para carregar as categorias.
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function Notice({ text, isError }: { text: string; isError: boolean }) {
  return (
    <div className={"flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm " + (isError ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400")}>
      {isError ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
      <span>{text}</span>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gold/20 bg-card p-4">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 font-display text-2xl font-bold text-gold">{value}</p>
      </div>
      <span className="rounded-lg bg-secondary p-2 text-gold">{icon}</span>
    </div>
  );
}

function LoadingScreen({ compact = false }: { compact?: boolean }) {
  return (
    <div className={"flex items-center justify-center gap-3 text-sm text-muted-foreground " + (compact ? "py-10" : "min-h-screen")}>
      <LoaderCircle className="h-5 w-5 animate-spin" />
      Carregando...
    </div>
  );
}

function SetupRequired() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-xl rounded-2xl border border-gold/25 bg-card p-7">
        <h1 className="font-display text-2xl font-bold text-gold-gradient">Configuração necessária</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O painel precisa das variáveis do projeto Supabase. Consulte o arquivo ADMIN_SETUP.md na raiz do repositório.
        </p>
        <a href="/" className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
          Voltar ao cardápio
        </a>
      </div>
    </main>
  );
}
