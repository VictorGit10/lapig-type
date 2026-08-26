# LAPIG Type

Treino competitivo de digitação inspirado em pesquisas do Laboratório de Processamento de Imagens e Geoprocessamento (LAPIG/UFG). O produto combina prática de teclado, divulgação científica e um ranking com validação no servidor.

O site é uma exportação estática do Next.js publicada no GitHub Pages. Login, tentativas verificadas e ranking usam Supabase Auth, Edge Functions e PostgreSQL; não há dependência de conta ChatGPT nem de `chatgpt.site`.

## Experiência

- o cronômetro começa na primeira tecla imprimível;
- o cursor só avança quando o caractere esperado é digitado;
- erros aumentam a contagem, consomem tempo e reduzem o score;
- colar, recortar e copiar o campo de treino é bloqueado;
- velocidade, precisão, tempo e erros são atualizados durante a sessão;
- visitantes podem treinar sem conta; resultados competitivos exigem autenticação;
- cada publicação aparece com autoria, ano e link para a fonte.

Os textos incluídos no protótipo são adaptações editoriais dos resumos, não transcrições literais. A curadoria final deve registrar autorização/licença, versão do texto e aprovação do LAPIG.

## Ranking verificável

O navegador não envia um score pronto. Ele solicita uma tentativa de uso único e envia, ao terminar, a sequência temporal de teclas. O servidor então:

1. confirma usuário, tentativa, prazo e dispositivo lógico;
2. confere a quantidade de caracteres corretos e erros;
3. compara relógio do cliente, relógio do servidor e soma dos intervalos;
4. recalcula PPM, precisão e score;
5. rejeita velocidades impossíveis e rajadas mecânicas;
6. separa padrões suspeitos para revisão;
7. aceita apenas o melhor resultado verificado de cada pessoa no placar público.

Nenhum ranking de navegador é inviolável: um atacante dedicado controla o cliente e pode automatizar eventos. A estratégia aqui é defesa em camadas, auditabilidade e custo crescente de fraude. Para competições com prêmio, recomenda-se acrescentar desafios rotativos, moderação, limites por evento e revisão de sessões líderes.

## Arquitetura e dados

```text
GitHub Pages (interface pública)
        │ OAuth + HTTPS
        ▼
Supabase Auth ── identidade Google/GitHub
        │ JWT validado no servidor
        ▼
Supabase Edge Functions ── validação e recálculo do score
        │ service_role (somente no servidor)
        ▼
Supabase PostgreSQL ── profiles, attempts e results
```

- A sessão de login é administrada pelo SDK oficial do Supabase e persistida no armazenamento local do navegador com renovação automática. O acesso por link enviado ao e-mail funciona sem conta ChatGPT; Google e GitHub podem ser habilitados como provedores adicionais.
- A chave `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` é pública por definição. A `service_role` nunca entra no bundle ou no GitHub Pages.
- As tabelas têm RLS e não podem ser lidas ou alteradas diretamente por visitantes autenticados ou anônimos.
- O placar público é produzido pela função `leaderboard`, que retorna apenas nome público e melhor resultado aceito de cada pessoa.
- A finalização é atômica no PostgreSQL: o token de tentativa só pode ser consumido uma vez.

## Desenvolvimento local

Requer Node.js 22.13 ou superior e Docker Desktop para executar a infraestrutura Supabase local.

```bash
npm install
npm run supabase:start
npm run supabase:reset
npm run dev
npm test
npm run test:db
npm run build
```

Copie `.env.example` para `.env.local` e preencha os valores mostrados por `npx supabase status`. As portas locais deste projeto começam em `5532x` para poder coexistir com outros projetos Supabase na mesma máquina.

## Publicação

1. Crie um projeto no Supabase e execute `npx supabase login`.
2. Vincule o repositório com `npx supabase link --project-ref SEU_PROJECT_REF`.
3. Aplique o banco com `npx supabase db push`.
4. Publique as funções com `npx supabase functions deploy`.
5. No Supabase Auth, habilite Google e/ou GitHub e autorize `https://victorgit10.github.io/lapig-type/` como URL de redirecionamento.
6. Nas variáveis do repositório GitHub, cadastre `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e, opcionalmente, `NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL`.
7. Em **Settings → Pages**, selecione **GitHub Actions** como fonte. O workflow em `.github/workflows/deploy-pages.yml` testa, exporta e publica o site a cada alteração em `main`.

O projeto Supabase hospedado, os provedores OAuth e a visibilidade pública do repositório exigem configuração nas contas dos respectivos serviços. Não publique `SUPABASE_SERVICE_ROLE_KEY`, senha do banco ou tokens pessoais como variáveis `NEXT_PUBLIC_*`.

## Conteúdo e licença

Os textos de treino ainda são adaptações editoriais para protótipo. Antes do lançamento institucional, registre a fonte, a licença ou autorização e a aprovação do LAPIG para cada passagem. A licença do código também deve ser escolhida antes de tornar o repositório público.
