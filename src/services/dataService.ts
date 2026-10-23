export type Story = {
  id: string;
  title: string;
  category: string;
  region: string;
  ethnicGroup: string;
  content: string;
  imageUrl: string;
  audioUrl?: any;
};

const MOCK_STORIES: Story[] = [
  {
    id: '1',
    title: 'Soundiata Keïta : L\'Éveil du Lion',
    category: 'Conte',
    region: 'Kankan',
    ethnicGroup: 'Mandingue',
    content: `Il était une fois, dans le royaume du Manden, un enfant nommé Soundiata qui naquit infirme. Les moqueries pleuvaient sur lui et sur sa mère, Sogolon Kondé, la femme-buffle. Mais le destin ne se lit pas dans les jambes, il se forge dans le cœur.

Pendant sept ans, Soundiata resta assis, ignorant les rires. Mais un jour, poussé par l'humiliation infligée à sa mère, il demanda une barre de fer. Dans un effort surhumain qui fit trembler la terre, il se redressa, tordit le fer en un arc majestueux et se tint debout. Le lion venait de s'éveiller.

Sa route fut longue, semée d'exils et de batailles. Contre le redoutable roi-sorcier Soumaoro Kanté, Soundiata utilisa non seulement la force, mais aussi la ruse et la sagesse. À la bataille de Kirina en 1235, il brisa les chaînes de l'oppression et fonda l'Empire du Mali, instaurant la Charte du Manden, l'une des premières déclarations des droits de l'homme au monde.

Aujourd'hui encore, sous les baobabs millénaires, les griots chantent le nom du fils de Maghan Kon Fatta, rappelant que la patience est le chemin de la royauté.`,
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800', // Savannah
    audioUrl: require('../../assets/audio/soundiatastory.mp3'),
  },
  {
    id: '2',
    title: 'La Trahison de l\'Hyène',
    category: 'Fable',
    region: 'Labé',
    ethnicGroup: 'Peul',
    content: `Au temps où les animaux parlaient encore aux hommes, l'Hyène et le Lièvre avaient conclu un pacte de fraternité. En cette période de grande sécheresse, la faim tordait les entrailles de tous les habitants de la brousse.

Le Lièvre, toujours astucieux, proposa à l'Hyène de creuser un puits ensemble. "Maître Lièvre, tes pattes sont trop fines, laisse-moi faire le gros travail," ricana l'Hyène, pensant déjà à garder l'eau pour elle seule. Mais dès que la première source jaillit, l'Hyène poussa le Lièvre au fond et referma l'entrée avec une lourde pierre.

"Désormais, cette eau est le privilège des forts !" s'écria-t-elle. Mais le Lièvre n'avait pas dit son dernier mot. Par un tunnel secret qu'il avait commencé à creuser par précaution, il ressortit derrière l'Hyène. Il imita alors la voix rugissante du Lion, le roi de la forêt.

Prise de panique, l'Hyène s'enfuit si vite qu'elle en perdit son souffle, laissant le puits à la disposition de tous les animaux assoiffés. Cette fable nous enseigne que la ruse du sage triomphera toujours de la cupidité du tyran.`,
    imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800', // Savannah Horizon
  },
  {
    id: '3',
    title: 'Le Souffle du Nimba',
    category: 'Coutume',
    region: 'Nzérékoré',
    ethnicGroup: 'Baga',
    content: `Chez les Baga, sur les côtes brumeuses de la Guinée, réside une divinité protectrice : la Nimba (D'mba). Plus qu'un masque, elle est l'incarnation de la générosité de la terre et de la force de la maternité.

Taillée dans le bois noble, la Nimba porte sur ses épaules le poids des récoltes à venir. Ses grands seins tombants symbolisent une mère qui a nourri de nombreuses générations. Lors des grandes cérémonies de riziculture, le porteur du masque s'agite sous une parure de raphia, guidé par les chants des femmes et le rythme saccadé des tambours.

On raconte que lorsque la Nimba danse, la pluie tombe là où le sol était aride, et les ventres stériles s'ouvrent à la vie. Respecter la Nimba, c'est respecter le cycle éternel de la nature. Ne jamais la regarder avec défi, car elle est le miroir de notre propre humilité devant les ancêtres.

Celui qui possède une statuette Nimba dans sa demeure ne connaîtra jamais la famine, car le souffle de la déesse remplit les greniers de ceux qui partagent leur pain.`,
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800', // African Culture
  },
  {
    id: '4',
    title: 'La Prophétie du Fouta',
    category: 'Conte',
    region: 'Labé',
    ethnicGroup: 'Peul',
    content: `Sur les hauteurs du Fouta Djallon, là où les sources des grands fleuves prennent naissance, vivait un berger nommé Alfa. Il possédait un troupeau dont les cornes touchaient presque les nuages. 

Un soir de pleine lune, une vieille femme lui demande l'hospitalité. Alfa lui offrit le meilleur lait de ses vaches. En remerciement, elle lui confia un secret : "Alfa, les nuages que tes bêtes frôlent vont bientôt se transformer en larmes de feu. Conduis ton troupeau vers la vallée du silence avant le lever du soleil."

Alfa écouta son intuition. Le lendemain, un orage de foudre s'abattit sur la montagne, mais Alfa et ses bêtes étaient à l'abri. Il comprit alors que la véritable richesse n'est pas dans le nombre de têtes de bétail, mais dans l'écoute des anciens et des signes que la nature nous envoie.

Depuis ce jour, au Fouta, on dit que celui qui respecte l'étranger respecte son propre avenir.`,
    imageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800', // Sunset Africa
  }
];

export const getStories = async (): Promise<Story[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_STORIES);
    }, 800);
  });
};

export const searchStories = async (query: string, regionFilter?: string, ethnicFilter?: string, categoryFilter?: string): Promise<Story[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let results = MOCK_STORIES;
      if (query) {
        results = results.filter(s => 
          s.title.toLowerCase().includes(query.toLowerCase()) || 
          s.content.toLowerCase().includes(query.toLowerCase())
        );
      }
      if (regionFilter && regionFilter !== 'Toutes') {
        results = results.filter(s => s.region === regionFilter);
      }
      if (ethnicFilter && ethnicFilter !== 'Toutes') {
        results = results.filter(s => s.ethnicGroup === ethnicFilter);
      }
      if (categoryFilter && categoryFilter !== 'Toutes') {
        results = results.filter(s => 
          s.category.toLowerCase() === categoryFilter.toLowerCase() || 
          s.category.toLowerCase() + 's' === categoryFilter.toLowerCase()
        );
      }
      resolve(results);
    }, 500);
  });
};

export const getStoryById = async (id: string): Promise<Story | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_STORIES.find(s => s.id === id));
    }, 300);
  });
};
