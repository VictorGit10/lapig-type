# LAPIG Type

Treino competitivo de digitação inspirado em pesquisas do Laboratório de Processamento de Imagens e Geoprocessamento (LAPIG/UFG). O produto combina prática de teclado, divulgação científica e um ranking com validação no servidor.

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

## Desenvolvimento

Requer Node.js 22.13 ou superior.

```bash
npm install
npm run dev
npm test
npm run build
```

O projeto usa Sites/Vinext, autenticação do ChatGPT e Cloudflare D1. O esquema fica em `db/schema.ts`; migrações são geradas com `npm run db:generate`.
