# Configuração do painel administrativo Bonutt

## O que está incluído

- Rota privada em \`/admin\`, com acesso por e-mail e senha.
- Permissão administrativa verificada no banco, além do login.
- Cadastro, edição, exclusão, pesquisa e ocultação de produtos.
- Preço principal e variações (por exemplo, tamanhos).
- Descrição, grupo, observação e disponibilidade.
- Ajuste do nome, observação e visibilidade das categorias.
- O cardápio público lê os dados atualizados do Supabase.
- Se o Supabase ainda não estiver configurado/importado, o site mantém o cardápio estático atual.

O painel administrativo foi limitado a alimentos e itens não alcoólicos. As demais categorias do cardápio público permanecem fora da edição administrativa.

## 1. Criar o projeto Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Copie e execute todo o conteúdo de \`supabase/schema.sql\`.
4. Em Authentication > Sign In / Providers, desative o cadastro público.
5. Em Authentication > Users, crie o usuário administrativo com e-mail e senha.

## 2. Autorizar o usuário

Depois de criar o usuário, execute no SQL Editor, substituindo o e-mail:

\`\`\`sql
insert into public.admin_users (user_id)
select id
from auth.users
where email = 'admin@bonutt.com'
on conflict do nothing;
\`\`\`

Sem essa autorização, o usuário consegue autenticar, mas não consegue administrar os dados.

## 3. Configurar o projeto local

1. Copie \`.env.example\` para \`.env.local\`.
2. No Supabase, abra Connect / API Keys e copie a Project URL e a Publishable key.
3. Preencha:

\`\`\`env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
\`\`\`

4. Instale a dependência e atualize o lockfile:

\`\`\`powershell
npm.cmd install
\`\`\`

5. Inicie o projeto:

\`\`\`powershell
npm.cmd run dev
\`\`\`

6. Abra \`http://localhost:8080/admin\` (ou o endereço informado pelo Vite).

## 4. Importar os produtos iniciais

Entre com o usuário administrativo e clique em **Importar cardápio inicial**. Essa ação carrega a versão estática atual das categorias gerenciadas e seus produtos. A importação é bloqueada quando já existem produtos cadastrados para evitar sobrescrever alterações.

Depois da importação, os dados editados no painel passam a ser usados no cardápio público.

## 5. Configurar o Netlify

No site do Netlify, abra:

**Site configuration > Environment variables**

Cadastre as mesmas duas variáveis:

- \`VITE_SUPABASE_URL\`
- \`VITE_SUPABASE_PUBLISHABLE_KEY\`

Depois que as variáveis estiverem salvas, publique a versão da branch de desenvolvimento por meio do fluxo de deploy/merge aprovado.

## Segurança

- A chave Publishable (ou a antiga anon key) pode estar no frontend porque as permissões são aplicadas pelo RLS.
- Nunca coloque \`service_role\`, secret key, senha de usuário ou token administrativo em variáveis \`VITE_*\`.
- Não habilite cadastro público.
- Crie contas administrativas apenas para pessoas autorizadas.
- As políticas RLS do SQL impedem que visitantes anônimos alterem produtos ou categorias.
- Antes de excluir um produto, o painel pede confirmação.

## Observações

- O nome e a imagem principal de cada categoria continuam vinculados à estrutura do site.
- As categorias podem ter nome, observação e visibilidade alterados no painel.
- Para criar uma nova categoria, é necessário também adicioná-la à lista de categorias gerenciadas em \`src/lib/catalog.ts\` e à estrutura visual em \`src/data/menu.ts\`.
- O arquivo \`.env.local\` não deve ser enviado ao GitHub.
