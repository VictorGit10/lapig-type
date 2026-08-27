export type Language = 'pt' | 'en' | 'es';

export const LANGUAGE_LABELS: Record<Language, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
};

export const UI_COPY = {
  pt: {
    language: 'Idioma',
    brandHome: 'LAPIG Type — início',
    navLabel: 'Navegação principal',
    training: 'Treino',
    ranking: 'Ranking',
    code: 'Código ↗',
    enter: 'Entrar',
    linkedResults: 'RESULTADOS VINCULADOS A',
    closeMenu: 'Fechar menu',
    signOut: 'Sair',
    enterRanking: 'ENTRAR NO RANKING',
    signIn: 'Entrar',
    createAccount: 'Criar conta',
    rankingAccess: 'Acesso ao ranking',
    username: 'Nome de usuário',
    usernamePlaceholder: 'ex.: Victor Amaral',
    usernameHint: 'Pode usar espaços. Esse será o nome exibido no ranking.',
    password: 'Senha',
    passwordPlaceholder: 'Mínimo de 10 caracteres',
    passwordEmpty: 'Use ao menos 10 caracteres.',
    passwordReady: '✓ Senha com tamanho suficiente.',
    captchaReady: '✓ Verificação anti-bot concluída',
    captchaPending: 'Verificando se você é uma pessoa…',
    creatingAccount: 'Criando conta…',
    signingIn: 'Entrando…',
    noEmail: 'Sem e-mail. Se perder a senha, crie outra conta.',
    continueWith: 'ou continue com',
    continueGoogle: 'Continuar com Google',
    continueGithub: 'Continuar com GitHub',
    backendInactive: 'O ambiente competitivo será ativado após a conexão com o Supabase.',
    heroEyebrow: 'Treino de digitação',
    heroTitleLead: 'Treine com',
    heroTitleAccent: 'textos científicos.',
    heroDescription: 'Um texto é sorteado a cada tentativa. Você tem 60 segundos para digitar o máximo que conseguir.',
    startNow: 'Começar agora',
    podium: 'Pódio',
    loading: 'CARREGANDO',
    updated: 'ATUALIZADO',
    unavailable: 'INDISPONÍVEL',
    firstResult: 'O primeiro resultado verificado pode ser o seu.',
    loadingRanking: 'Carregando resultados verificados…',
    unavailableRanking: 'O ranking competitivo ainda não está disponível neste ambiente.',
    viewFullRanking: 'Ver ranking completo',
    trainingArea: 'Área de treino de digitação',
    speed: 'Velocidade',
    wpm: 'PPM',
    accuracy: 'Precisão',
    timeRemaining: 'Tempo restante',
    mistakes: 'Erros',
    selectedText: 'TEXTO SORTEADO',
    restartText: 'Recomeçar texto',
    restart: 'Recomeçar',
    inputLabel: 'Campo de digitação. Comece a digitar o texto exibido.',
    elapsedProgress: '{progress}% do tempo decorrido',
    startTimer: 'Comece a digitar para iniciar o tempo',
    timeEnded: 'Tempo encerrado',
    tildeTip: 'Para ~ no ABNT2: pressione ~ e depois Espaço.',
    mistakeTip: 'Errou? O cursor espera a tecla correta.',
    aboutText: 'SOBRE O TEXTO',
    viewPublication: 'Ver publicação ↗',
    generalScore: 'PLACAR GERAL',
    fullRanking: 'Ranking completo',
    rankingDescription: 'Resultados de 60 segundos, ordenados por velocidade e precisão.',
    compete: 'Criar conta para competir',
    topThree: 'Três primeiros colocados',
    place: 'lugar',
    precision: 'de precisão',
    emptyRanking: 'Ainda não há resultados verificados. Faça o primeiro teste.',
    result: 'RESULTADO',
    resultTitle: 'Seus 60 segundos terminaram.',
    wordsPerMinute: 'PALAVRAS\nPOR MINUTO',
    errors: 'erros',
    time: 'tempo',
    verifyingResult: 'Validando ritmo, sequência e tempo no servidor…',
    acceptedResult: 'Resultado verificado: {score} pontos no ranking.',
    reviewResult: 'Resultado salvo para revisão; ele ainda não aparece no ranking.',
    rejectedResult: 'A sessão não passou pela validação competitiva.',
    errorResult: 'Não foi possível validar esta sessão. Seu treino local continua salvo na tela.',
    localResult: 'Treino concluído. Entre antes da próxima tentativa para disputar o ranking.',
    enterToCompete: 'Entrar para competir ↗',
    nextText: 'Sortear outro texto',
    closeResult: 'Fechar resultado',
    footer: 'Treino de digitação com textos de pesquisa.',
    githubProject: 'Ver o projeto no GitHub ↗',
    providerUnavailable: 'Este provedor ainda não está disponível. Entre com nome e senha.',
    invalidUsername: 'Informe um nome de 3 a 32 caracteres. Espaços, letras, números, ponto, hífen e sublinhado são aceitos.',
    captchaMissing: 'A verificação anti-bot ainda não terminou. Aguarde o indicador verde e tente novamente.',
    captchaNotConfigured: 'A proteção anti-bot não está configurada.',
    accountCreated: 'Conta criada com sucesso. Você já está participando do ranking.',
    signedIn: 'Entrada realizada com sucesso.',
  },
  en: {
    language: 'Language', brandHome: 'LAPIG Type — home', navLabel: 'Main navigation', training: 'Practice', ranking: 'Ranking', code: 'Code ↗', enter: 'Sign in', linkedResults: 'RESULTS LINKED TO', closeMenu: 'Close menu', signOut: 'Sign out', enterRanking: 'JOIN THE RANKING', signIn: 'Sign in', createAccount: 'Create account', rankingAccess: 'Ranking access', username: 'Username', usernamePlaceholder: 'e.g. Victor Amaral', usernameHint: 'Spaces are allowed. This name will appear in the ranking.', password: 'Password', passwordPlaceholder: 'At least 10 characters', passwordEmpty: 'Use at least 10 characters.', passwordReady: '✓ Password is long enough.', captchaReady: '✓ Anti-bot check complete', captchaPending: 'Checking that you are human…', creatingAccount: 'Creating account…', signingIn: 'Signing in…', noEmail: 'No email required. If you lose your password, create another account.', continueWith: 'or continue with', continueGoogle: 'Continue with Google', continueGithub: 'Continue with GitHub', backendInactive: 'Competitive mode will be enabled after Supabase is connected.', heroEyebrow: 'Typing practice', heroTitleLead: 'Practice with', heroTitleAccent: 'scientific texts.', heroDescription: 'A text is selected for each attempt. You have 60 seconds to type as much as you can.', startNow: 'Start now', podium: 'Podium', loading: 'LOADING', updated: 'UPDATED', unavailable: 'UNAVAILABLE', firstResult: 'The first verified result could be yours.', loadingRanking: 'Loading verified results…', unavailableRanking: 'The competitive ranking is not available in this environment yet.', viewFullRanking: 'View full ranking', trainingArea: 'Typing practice area', speed: 'Speed', wpm: 'WPM', accuracy: 'Accuracy', timeRemaining: 'Time left', mistakes: 'Mistakes', selectedText: 'SELECTED TEXT', restartText: 'Restart text', restart: 'Restart', inputLabel: 'Typing field. Start typing the text shown.', elapsedProgress: '{progress}% of the time elapsed', startTimer: 'Start typing to begin the timer', timeEnded: 'Time is up', tildeTip: 'For ~ on an ABNT2 keyboard: press ~, then Space.', mistakeTip: 'Made a mistake? The cursor waits for the correct key.', aboutText: 'ABOUT THE TEXT', viewPublication: 'View publication ↗', generalScore: 'OVERALL SCORE', fullRanking: 'Full ranking', rankingDescription: '60-second results, sorted by speed and accuracy.', compete: 'Create an account to compete', topThree: 'Top three players', place: 'place', precision: 'accuracy', emptyRanking: 'There are no verified results yet. Set the first one.', result: 'RESULT', resultTitle: 'Your 60 seconds are over.', wordsPerMinute: 'WORDS\nPER MINUTE', errors: 'mistakes', time: 'time', verifyingResult: 'Validating rhythm, sequence, and time on the server…', acceptedResult: 'Verified result: {score} ranking points.', reviewResult: 'Result saved for review; it is not in the ranking yet.', rejectedResult: 'This session did not pass competitive validation.', errorResult: 'This session could not be validated. Your local practice result remains on screen.', localResult: 'Practice complete. Sign in before your next attempt to join the ranking.', enterToCompete: 'Sign in to compete ↗', nextText: 'Select another text', closeResult: 'Close result', footer: 'Typing practice with research texts.', githubProject: 'View the project on GitHub ↗', providerUnavailable: 'This provider is not available yet. Sign in with a username and password.', invalidUsername: 'Enter a name with 3–32 characters. Spaces, letters, numbers, periods, hyphens, and underscores are allowed.', captchaMissing: 'The anti-bot check is not finished yet. Wait for the green indicator and try again.', captchaNotConfigured: 'Anti-bot protection is not configured.', accountCreated: 'Account created. You are now taking part in the ranking.', signedIn: 'Signed in successfully.',
  },
  es: {
    language: 'Idioma', brandHome: 'LAPIG Type — inicio', navLabel: 'Navegación principal', training: 'Práctica', ranking: 'Ranking', code: 'Código ↗', enter: 'Entrar', linkedResults: 'RESULTADOS VINCULADOS A', closeMenu: 'Cerrar menú', signOut: 'Salir', enterRanking: 'ENTRAR AL RANKING', signIn: 'Entrar', createAccount: 'Crear cuenta', rankingAccess: 'Acceso al ranking', username: 'Nombre de usuario', usernamePlaceholder: 'ej.: Victor Amaral', usernameHint: 'Puedes usar espacios. Este será el nombre visible en el ranking.', password: 'Contraseña', passwordPlaceholder: 'Mínimo de 10 caracteres', passwordEmpty: 'Usa al menos 10 caracteres.', passwordReady: '✓ La contraseña tiene la longitud necesaria.', captchaReady: '✓ Verificación anti-bot completada', captchaPending: 'Comprobando que eres una persona…', creatingAccount: 'Creando cuenta…', signingIn: 'Entrando…', noEmail: 'Sin correo electrónico. Si pierdes la contraseña, crea otra cuenta.', continueWith: 'o continúa con', continueGoogle: 'Continuar con Google', continueGithub: 'Continuar con GitHub', backendInactive: 'El entorno competitivo se activará cuando Supabase esté conectado.', heroEyebrow: 'Práctica de mecanografía', heroTitleLead: 'Practica con', heroTitleAccent: 'textos científicos.', heroDescription: 'Se sortea un texto en cada intento. Tienes 60 segundos para escribir todo lo que puedas.', startNow: 'Empezar ahora', podium: 'Podio', loading: 'CARGANDO', updated: 'ACTUALIZADO', unavailable: 'NO DISPONIBLE', firstResult: 'El primer resultado verificado puede ser el tuyo.', loadingRanking: 'Cargando resultados verificados…', unavailableRanking: 'El ranking competitivo todavía no está disponible en este entorno.', viewFullRanking: 'Ver ranking completo', trainingArea: 'Área de práctica de mecanografía', speed: 'Velocidad', wpm: 'PPM', accuracy: 'Precisión', timeRemaining: 'Tiempo restante', mistakes: 'Errores', selectedText: 'TEXTO SORTEADO', restartText: 'Reiniciar texto', restart: 'Reiniciar', inputLabel: 'Campo de escritura. Empieza a escribir el texto mostrado.', elapsedProgress: '{progress}% del tiempo transcurrido', startTimer: 'Empieza a escribir para iniciar el tiempo', timeEnded: 'Tiempo terminado', tildeTip: 'Para ~ en un teclado ABNT2: pulsa ~ y luego Espacio.', mistakeTip: '¿Te equivocaste? El cursor espera la tecla correcta.', aboutText: 'SOBRE EL TEXTO', viewPublication: 'Ver publicación ↗', generalScore: 'CLASIFICACIÓN GENERAL', fullRanking: 'Ranking completo', rankingDescription: 'Resultados de 60 segundos, ordenados por velocidad y precisión.', compete: 'Crear cuenta para competir', topThree: 'Tres primeros puestos', place: 'lugar', precision: 'de precisión', emptyRanking: 'Todavía no hay resultados verificados. Haz la primera prueba.', result: 'RESULTADO', resultTitle: 'Tus 60 segundos terminaron.', wordsPerMinute: 'PALABRAS\nPOR MINUTO', errors: 'errores', time: 'tiempo', verifyingResult: 'Validando ritmo, secuencia y tiempo en el servidor…', acceptedResult: 'Resultado verificado: {score} puntos en el ranking.', reviewResult: 'Resultado guardado para revisión; todavía no aparece en el ranking.', rejectedResult: 'La sesión no superó la validación competitiva.', errorResult: 'No fue posible validar esta sesión. Tu resultado local sigue visible.', localResult: 'Práctica terminada. Entra antes del próximo intento para competir.', enterToCompete: 'Entrar para competir ↗', nextText: 'Sortear otro texto', closeResult: 'Cerrar resultado', footer: 'Práctica de mecanografía con textos de investigación.', githubProject: 'Ver el proyecto en GitHub ↗', providerUnavailable: 'Este proveedor todavía no está disponible. Entra con nombre y contraseña.', invalidUsername: 'Escribe un nombre de 3 a 32 caracteres. Se aceptan espacios, letras, números, puntos, guiones y guiones bajos.', captchaMissing: 'La verificación anti-bot todavía no terminó. Espera el indicador verde e inténtalo de nuevo.', captchaNotConfigured: 'La protección anti-bot no está configurada.', accountCreated: 'Cuenta creada. Ya estás participando en el ranking.', signedIn: 'Has entrado correctamente.',
  },
} as const;

export function passwordRemaining(language: Language, count: number) {
  if (language === 'en') return `${count} more ${count === 1 ? 'character' : 'characters'} needed.`;
  if (language === 'es') return `Falta${count === 1 ? '' : 'n'} ${count} ${count === 1 ? 'carácter' : 'caracteres'}.`;
  return `Falta${count === 1 ? '' : 'm'} ${count} ${count === 1 ? 'caractere' : 'caracteres'}.`;
}

export function secondsRemaining(language: Language, count: number) {
  if (language === 'en') return `${count} s left`;
  if (language === 'es') return `${count} s restantes`;
  return `${count} s restantes`;
}

export function rankMark(language: Language, rank: number) {
  if (language === 'en') return `#${rank}`;
  if (language === 'es') return `${rank}.º`;
  return `${rank}º`;
}
