/**
 * Réponses locales de secours de DjeliBot.
 *
 * Utilisées uniquement quand l'API IA est injoignable (hors-ligne, quota
 * dépassé, clé absente). L'écran les signale explicitement à l'utilisateur :
 * elles ne doivent jamais être présentées comme une réponse du modèle.
 */

const INTROS = [
  "Ah, mon fils, tu touches là une corde sensible de ma kora... ",
  "Que la paix de tes ancêtres t'accompagne. Ta question fait vibrer la mémoire du Manden. ",
  "Écoute le vent qui souffle dans les feuilles du grand fromager : il apporte la réponse que tu cherches. ",
  "Dans mon grand sac de paroles, j'ai justement un récit pour éclairer ton chemin. ",
];

const WISDOM = [
  "Sache que l'eau du fleuve ne remonte jamais vers sa source, mais elle nourrit toute la terre sur son passage. ",
  "Le savoir est comme un oiseau : si tu ne le tiens pas bien, il s'envole ; si tu le serres trop fort, il s'étouffe. ",
  "Celui qui voyage seul va vite, mais celui qui voyage avec la parole des anciens va loin. ",
];

const CONCLUSIONS = [
  " Est-ce que cette lumière suffit à dissiper l'ombre de ton doute ?",
  " Que souhaites-tu que je te raconte maintenant ?",
  " Pose ton fardeau, et laisse la sagesse de nos pères t'habiter.",
];

const pick = (values: string[]): string =>
  values[Math.floor(Math.random() * values.length)];

const findCore = (lower: string): string => {
  if (lower.includes('qui es-tu') || lower.includes('djeli') || lower.includes('griot')) {
    return "Je suis le pont entre hier et demain, la voix qui ne meurt jamais car elle vit dans le cœur de ceux qui écoutent. Un griot, vois-tu, n'est pas qu'un conteur : c'est le sang de l'histoire, le médiateur des conflits et le miroir de l'âme d'un peuple. Mes circuits sont faits de silicium, mais mes mots sont pétris dans l'argile rouge de notre terre.";
  }
  if (lower.includes('soundiata') || lower.includes('mandingue') || lower.includes('keita')) {
    return "Le grand Soundiata ! Le Lion qui a appris à marcher pour redresser le monde. Il n'a pas seulement bâti un empire de terre et de fer, il a gravé la dignité dans le cœur de chaque Mandingue. Rappelle-toi sa charte, celle de Kurukan Fuga, où il a dit que toute vie humaine est une vie. Quelle noblesse, n'est-ce pas ?";
  }
  if (lower.includes('pular') || lower.includes('fouta') || lower.includes('peul')) {
    return "Le Pular... Une langue qui coule comme le lait frais de la traite matinale. Dans les montagnes du Fouta, chaque mot est une poésie, chaque silence est un respect. Le Pulaaku n'est pas qu'un code, c'est une façon de se tenir debout face à l'univers, avec pudeur et courage.";
  }
  if (lower.includes('nimba') || lower.includes('baga') || lower.includes('masque')) {
    return "Le masque Nimba est la mère de nous tous. Elle porte le monde sur ses épaules de bois. Quand les Baga la font danser, c'est toute la fertilité de la terre qui s'éveille. Elle ne parle pas, mais son silence protège les berceaux et fait mûrir les grains de riz dans les champs salés.";
  }
  if (lower.includes('kora') || lower.includes('musique') || lower.includes('instrument')) {
    return "La kora... 21 cordes, pas une de plus, pas une de moins. C'est le paradis qui a été mis en musique. Chaque note est un secret chuchoté par un ancêtre. Elle ne se joue pas avec les doigts, mais avec l'âme tout entière. C'est elle qui donne le rythme aux pas du roi.";
  }
  return "Tes paroles sont comme des traces sur le sable, le vent les emporte un peu... mais parle-moi encore. Parle-moi de tes rois, de tes danses, ou du secret des plantes médicinales. Ma mémoire est une bibliothèque qui attend tes questions.";
};

export const getLocalGriotReply = (message: string, userName?: string): string => {
  const lower = message.toLowerCase();
  const name = userName?.trim() || 'voyageur';

  if (lower.includes('bonjour') || lower.includes('salut')) {
    return `N'ba di ${name} ! Que ta journée soit aussi paisible que l'ombre d'un manguier. Je suis prêt à délier mon sac de paroles pour toi.`;
  }

  return `${pick(INTROS)}${pick(WISDOM)}${findCore(lower)}${pick(CONCLUSIONS)}`;
};
