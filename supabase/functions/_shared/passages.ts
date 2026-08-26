export type Passage = {
  id: string;
  eyebrow: string;
  title: string;
  authors: string;
  year: number;
  sourceUrl: string;
  text: string;
};

export const passages: Passage[] = [
  {
    id: 'cerrado-fronteira',
    eyebrow: 'Cerrado e uso da terra',
    title: 'Dinâmica agrícola e desmatamentos em áreas de Cerrado',
    authors: 'Laerte G. Ferreira Jr. e colaboradores',
    year: 2009,
    sourceUrl: 'https://repositorio.bc.ufg.br/items/57fe7038-42c6-4bf5-88d1-c16dffd34f05',
    text: 'No Cerrado, a leitura conjunta de imagens de satélite e dados agropecuários ajuda a revelar como a expansão produtiva transforma a paisagem. Observar essas mudanças no espaço e no tempo é essencial para orientar decisões públicas, proteger a vegetação nativa e planejar o território com mais responsabilidade.',
  },
  {
    id: 'pastagens-cultivadas',
    eyebrow: 'Pastagens brasileiras',
    title: 'Propriedades biofísicas de pastagens cultivadas',
    authors: 'Laerte G. Ferreira Jr. e colaboradores',
    year: 2013,
    sourceUrl: 'https://repositorio.bc.ufg.br/items/58ab989a-3099-4591-9f5f-ef4ba1ee7d4a',
    text: 'Avaliar as condições das pastagens por parâmetros biofísicos torna o manejo mais eficiente. Medidas de campo, séries temporais e dados orbitais permitem reconhecer padrões de produtividade, sazonalidade e degradação em uma atividade decisiva para a economia e para a conservação do Cerrado.',
  },
  {
    id: 'mapas-cerrado',
    eyebrow: 'Geoinformação aberta',
    title: 'Plataforma interativa de mapas do bioma Cerrado',
    authors: 'Wanessa C. Silva e colaboradores',
    year: 2017,
    sourceUrl: 'https://repositorio.bc.ufg.br/items/2466d41d-7448-4361-936a-5138b5cb014e',
    text: 'Quando dados geográficos são organizados em plataformas abertas e intuitivas, a cartografia se aproxima de quem pesquisa e de quem decide. O desafio é reunir grande volume de informação sem perder precisão, contexto e clareza para diferentes públicos.',
  },
];

export function findPassage(passageId: string) {
  return passages.find((passage) => passage.id === passageId) ?? null;
}
