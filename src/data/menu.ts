// Fonte única do cardápio Bonutt. Todos os dados foram transcritos do PDF oficial.
// Para alterar preços, nomes, imagens ou categorias, edite apenas este arquivo.
import promo from "@/assets/menu/promo.jpg";
import paoalho from "@/assets/menu/paoalho.jpg";
import porcoes from "@/assets/menu/porcoes.jpg";
import linguicas from "@/assets/menu/linguicas.jpg";
import final from "@/assets/menu/final.jpg";
import pasteis from "@/assets/menu/pasteis.jpg";
import coxinhas from "@/assets/menu/coxinhas.jpg";
import petiscos from "@/assets/menu/petiscos.jpg";
import aguas from "@/assets/menu/aguas.jpg";
import sucos from "@/assets/menu/sucos.jpg";
import refri from "@/assets/menu/refri.jpg";
import chopp from "@/assets/menu/chopp.jpg";
import energeticos from "@/assets/menu/energeticos.jpg";
import drinks from "@/assets/menu/drinks.jpg";
import longnecks from "@/assets/menu/longnecks.jpg";
import especiais from "@/assets/menu/especiais.jpg";
import vinhos from "@/assets/menu/vinhos.jpg";
import doses from "@/assets/menu/doses.jpg";
import garrafa from "@/assets/menu/garrafa.jpg";

export type PriceOption = { label: string; price: string };

export type MenuItem = {
  name: string;
  /** Preço único, exatamente como no PDF. */
  price?: string;
  /** Preços por tamanho (ex.: chopp 300 ml / 500 ml). */
  prices?: PriceOption[];
  description?: string;
  /** Preço não informado no PDF: exibido como "a confirmar". */
  pending?: boolean;
  /** Item listado sem preço individual (ex.: cortes de carne). */
  noPrice?: boolean;
};

export type MenuGroup = { title?: string; note?: string; items: MenuItem[] };

export type MenuCategory = {
  id: string;
  title: string;
  image: string;
  imageAlt: string;
  note?: string;
  groups: MenuGroup[];
};

const ml = (a: string, b: string): PriceOption[] => [
  { label: "300 ml", price: a },
  { label: "500 ml", price: b },
];

export const menu: MenuCategory[] = [
  {
    id: "promocoes",
    title: "Promoções da Semana",
    image: promo,
    imageAlt: "Pratos de carne e frango servidos em tábuas",
    groups: [
      {
        items: [
          { name: "Picanha com fritas", price: "R$ 109,90" },
          { name: "Filé com fritas", price: "R$ 84,90" },
          { name: "Ancho com fritas", price: "R$ 99,90" },
          { name: "Lombo com fritas", price: "R$ 54,90" },
          { name: "Picanha suína com fritas", price: "R$ 54,90" },
          { name: "Calabresa com mandioquinha", price: "R$ 39,90" },
        ],
      },
    ],
  },
  {
    id: "pao-de-alho",
    title: "Pão de Alho",
    image: paoalho,
    imageAlt: "Pão de alho gratinado",
    groups: [
      {
        title: "Tradicionais",
        note: "R$11,90 cada",
        items: [
          "Alho c/ queijo (tradicional)",
          "Alho poró c/ queijo",
          "Bacon c/ cheddar",
          "Frango c/ requeijão",
          "Pepperoni c/ queijo",
          "Quatro queijos",
          "Tomate c/ provolone",
          "Tomate seco c/ queijo",
        ].map((name) => ({ name, price: "R$11,90" })),
      },
      {
        title: "Sabores Especiais",
        note: "R$19,90 cada",
        items: [
          "Pão de chocolate",
          "Pão de doce de leite c/ nozes",
          "Pão de alho camarão",
          "Pão de alho filé mignon c/ gorgonzola",
        ].map((name) => ({ name, price: "R$19,90" })),
      },
    ],
  },
  {
    id: "porcoes",
    title: "Porções",
    image: porcoes,
    imageAlt: "Porções de frango, carne acebolada e fritas",
    groups: [
      {
        items: [
          { name: "Torresmo de Barriga (500g)", price: "R$49,90" },
          { name: "Tulipa de Frango (500g)", price: "R$59,90" },
          { name: "Coxinha da Asa (500g)", price: "R$39,90" },
          { name: "Coração de Frango (500g)", price: "R$49,90" },
          { name: "Fritas c/ queijo", price: "R$34,90" },
          { name: "Mandioquinha frita (500g)", price: "R$35,90" },
          { name: "Lombo (500g)", price: "R$44,90" },
          { name: "Iscas de Frango c/ Fritas (500g)", price: "R$56,90" },
          { name: "Filé de Tilápia (500g)", price: "R$65,90" },
          { name: "Filé de Tilápia c/ fritas (500g)", price: "R$89,90" },
        ],
      },
    ],
  },
  {
    id: "carnes-especiais",
    title: "Carnes Especiais",
    image: final,
    imageAlt: "Espeto de carne grelhada com vinagrete",
    note: "Você escolhe a sua carne e nós preparamos para você! Taxa Preparo R$18,00",
    groups: [
      {
        items: [
          "Picanha Suína",
          "Bananinha",
          "Fraldinha",
          "Bombom Alcatra",
          "Maminha",
          "Ancho",
          "Contra Filé",
          "Picanha",
          "Chorizo",
        ].map((name) => ({ name, noPrice: true })),
      },
    ],
  },
  {
    id: "linguicas",
    title: "Linguiças",
    image: linguicas,
    imageAlt: "Linguiças grelhadas fatiadas na tábua",
    groups: [
      {
        items: [
          { name: "Linguiça bovina (300g)", price: "R$30,90" },
          { name: "Linguiça suína (500g)", price: "R$35,90" },
          {
            name: "Linguiça suína recheada (500g)",
            price: "R$39,90",
            description: "pimenta biquinho, provolone, jiló, mandioca, apimentada, bacon",
          },
        ],
      },
    ],
  },
  {
    id: "pasteis-de-angu",
    title: "Pastéis de Angu",
    image: pasteis,
    imageAlt: "Pastéis de angu dourados com molho",
    groups: [
      {
        items: [
          { name: "Pastel de Angú de Alho Poró e Requeijão (10un)", price: "R$39,90" },
          { name: "Pastel de Angú de Queijo c/ orégano (10un)", price: "R$39,90" },
          { name: "Pastel de Angú de Frango c/ Requeijão (10un)", price: "R$39,90" },
          { name: "Pastel de Angú de Camarão c/ Requeijão (10un)", price: "R$49,90" },
          { name: "Pastel de Angú de Carne Seca c/ Requeijão (10un)", price: "R$39,90" },
          { name: "Pastel de Angú de Rabada c/ Queijo (10un)", price: "R$39,90" },
        ],
      },
    ],
  },
  {
    id: "coxinhas-bolinhos",
    title: "Coxinhas e Bolinhos",
    image: coxinhas,
    imageAlt: "Coxinhas de costela abertas mostrando o recheio",
    groups: [
      {
        items: [
          { name: "Coxinha de Costela (10uni)", price: "R$39,90" },
          { name: "Bolinho de Mandioca c/ Carne Seca e Requeijão (10uni)", price: "R$39,90" },
          { name: "Bolinho de Bacalhau (10 uni)", price: "R$39,90" },
          { name: "Camafeu de Camarão c/ Queijo (10uni)", price: "R$69,90" },
        ],
      },
    ],
  },
  {
    id: "petiscos",
    title: "Petiscos",
    image: petiscos,
    imageAlt: "Salaminho fatiado com limão",
    groups: [{ items: [{ name: "Salaminho c/ limão", price: "R$19,90" }] }],
  },
  {
    id: "aguas",
    title: "Águas",
    image: aguas,
    imageAlt: "Garrafas de água mineral e tônica",
    groups: [
      {
        items: [
          { name: "Água Mineral s/ Gás", price: "R$3,50" },
          { name: "Água Mineral c/ Gás", price: "R$4,50" },
          {
            name: "Água Saborizada",
            price: "R$4,50",
            description: "Frutas Vermelhas, Limão, Melancia, Tangerina",
          },
          { name: "Água Tônica (Tradicional e Diet)", price: "R$5,50" },
          { name: "Água de Coco (caixinha)", price: "R$6,50" },
        ],
      },
    ],
  },
  {
    id: "sucos",
    title: "Sucos",
    image: sucos,
    imageAlt: "Suco de laranja em jarra e copo",
    groups: [
      {
        items: [
          { name: "Suco Lata (Consulte Sabores)", price: "R$5,90" },
          { name: "Suco Natural Jarra (300ml)", price: "R$13,90" },
          { name: "Suco Natural (500ml)", price: "R$16,90" },
        ],
      },
    ],
  },
  {
    id: "refrigerantes",
    title: "Refrigerantes",
    image: refri,
    imageAlt: "Latas de refrigerante",
    groups: [
      {
        items: [
          { name: "Fanta", price: "R$5,00" },
          { name: "Guaraná Antarctica", price: "R$6,00" },
          { name: "Pepsi", price: "R$5,00" },
          { name: "Coca Cola", price: "R$6,00" },
          { name: "H2O Limoneto", price: "R$7,90" },
          { name: "Sprite", price: "R$5,00" },
        ],
      },
    ],
  },
  {
    id: "chopp",
    title: "Chopp",
    image: chopp,
    imageAlt: "Taças de chopp de diferentes estilos",
    groups: [
      {
        title: "Pilsen",
        items: [
          { name: "Brahma", prices: ml("R$ 12,00", "R$ 15,00") },
          { name: "Albanos", prices: ml("R$ 12,00", "R$ 15,00") },
          { name: "Heineken", prices: ml("R$ 12,00", "R$ 15,00") },
        ],
      },
      {
        title: "Especiais",
        items: [
          { name: "Ignorância Double IPA", prices: ml("R$ 15,00", "R$ 18,00") },
          { name: "Lagunitas IPA", prices: ml("R$ 16,00", "R$ 24,00") },
          { name: "Verace King Cross", prices: ml("R$ 12,00", "R$ 15,00") },
        ],
      },
    ],
  },
  {
    id: "energeticos",
    title: "Energéticos",
    image: energeticos,
    imageAlt: "Latas de Red Bull e Monster",
    groups: [
      {
        items: [
          { name: "Red Bull 250ml", price: "R$12,90", description: "Consulte sabores" },
          { name: "Monster 473ml", price: "R$12,90", description: "Consulte sabores" },
        ],
      },
    ],
  },
  {
    id: "drinks-prontos",
    title: "Drinks Prontos",
    image: drinks,
    imageAlt: "Garrafas coloridas de Skol Beats",
    groups: [
      {
        items: [
          { name: "Skol Beats Green Mix", price: "R$12,90" },
          { name: "Skol Beats Senses", price: "R$12,90" },
          { name: "Skol Beats Red Mix", price: "R$12,90" },
          { name: "Skol Beats Tropical", price: "R$12,90" },
          { name: "Skol Beats GT", price: "R$12,90" },
          { name: "Smirnoff Ice", price: "R$13,90" },
          { name: "Bang Bang Moscow Mule", price: "R$11,90" },
          { name: "Tropical Jam Verace 355ML", price: "R$12,90" },
          { name: "Verace Gimbrado 355ML", price: "R$12,90" },
          { name: "Verace Melancita 355ML", price: "R$12,90" },
          { name: "Xeque Mate (473ml)", price: "R$15,90" },
        ],
      },
    ],
  },
  {
    id: "long-necks",
    title: "Long Necks",
    image: longnecks,
    imageAlt: "Fileira de cervejas long neck",
    note: "O cardápio original não informa os preços das long necks. Consulte no balcão.",
    groups: [
      {
        items: [
          "Amstel Ultra",
          "Heineken Zero",
          "Heineken",
          "Heineken Ultimate",
          "Corona Extra",
          "Corona Zero",
          "Stella Artois",
          "Stella Artois Sem Gluten",
          "Eisenbahn American IPA",
          "Eisenbahn Session IPA",
          "Lagunitas IPA (355ml)",
          "Blue Moon",
        ].map((name) => ({ name, pending: true })),
      },
    ],
  },
  {
    id: "cervejas-especiais",
    title: "Cervejas Especiais (Garrafas)",
    image: especiais,
    imageAlt: "Garrafas de cervejas especiais",
    groups: [
      {
        items: [
          { name: "Therezópolis Jade IPA", price: "R$12,90" },
          { name: "Krug Light", price: "R$13,90" },
          { name: "Therezópolis Rubine Bock", price: "R$13,90" },
          { name: "Therezópolis Gold Lager", price: "R$14,90" },
          { name: "Therezópolis Ebenholz Dunkel", price: "R$14,90" },
          { name: "Austria Hefe Weizen", price: "R$15,90" },
          { name: "Albanos English Pale Ale", price: "R$16,90" },
          { name: "Verace King Cross", price: "R$16,90" },
          { name: "Baden Baden Cristal", price: "R$18,90" },
          { name: "Baden Baden American IPA", price: "R$19,90" },
          { name: "Baden Baden Golden Ale", price: "R$19,90" },
          { name: "Albanos IPA", price: "R$19,90" },
          { name: "SLOD Lemon", price: "R$21,90" },
          { name: "Krug Calunia Americ. Pale Ale", price: "R$21,90" },
          { name: "Krug Inocencia Tripel", price: "R$22,90" },
          { name: "Krug Sarcasmo", price: "R$22,90" },
          { name: "Krug Submissão Session IPA", price: "R$22,90" },
          { name: "Krug Rancor IPA", price: "R$22,90" },
          { name: "Krug Ignorância", price: "R$23,90" },
          { name: "Verace Django", price: "R$24,90" },
          { name: "Wals Quadrupel", price: "R$26,90" },
          { name: "Backer Tommy Gun", price: "R$27,90" },
          { name: "Verace Rapsodia", price: "R$30,90" },
        ],
      },
    ],
  },
  {
    id: "cervejas-de-garrafa",
    title: "Cervejas de Garrafa",
    image: garrafa,
    imageAlt: "Garrafas de cerveja Krug, Backer, Quilmes e outras",
    groups: [
      {
        items: [
          { name: "Quilmes Classica", price: "R$11,90" },
          { name: "1906 Reserva Especial", price: "R$13,90" },
          { name: "Krug German Pilsen", price: "R$14,90" },
          { name: "Lagunitas IPA", price: "R$14,90" },
          { name: "Laut de Leve", price: "R$15,90" },
          { name: "Backer Trigo", price: "R$17,90" },
          { name: "SLOD APA", price: "R$21,90" },
          { name: "Krug Ignorância", price: "R$23,90" },
        ],
      },
    ],
  },
  {
    id: "vinhos",
    title: "Vinhos",
    image: vinhos,
    imageAlt: "Garrafa e taças de vinho tinto",
    note: "Garrafas 750ml (consulte opções)",
    groups: [
      {
        items: [
          { name: "Tinto Suave (375ml)", price: "R$19,90" },
          { name: "Tinto Suave Bordô (375ml)", price: "R$29,90" },
          { name: "Tinto Seco Jatobá (375ml)", price: "R$49,90" },
        ],
      },
    ],
  },
  {
    id: "doses",
    title: "Doses",
    image: doses,
    imageAlt: "Dose de destilado com limão",
    groups: [
      {
        items: [
          { name: "Vodka", price: "R$15,00" },
          { name: "Cachaça Salinas", price: "R$15,00" },
          { name: "Whisky", price: "R$20,00" },
          { name: "Fireball", price: "R$20,00" },
        ],
      },
    ],
  },
];

export const contact = {
  instagram: "@bonutt.carnes",
  instagramUrl: "https://www.instagram.com/bonutt.carnes/",
};

export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/** Filtra o cardápio pelo nome do produto (ignora acentos e maiúsculas). */
export function searchMenu(query: string): MenuCategory[] {
  const q = normalize(query);
  if (!q) return menu;
  return menu
    .map((c) => ({
      ...c,
      groups: c.groups
        .map((g) => ({ ...g, items: g.items.filter((i) => normalize(i.name).includes(q)) }))
        .filter((g) => g.items.length > 0),
    }))
    .filter((c) => c.groups.length > 0);
}
