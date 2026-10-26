import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  setDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { readLocalFavorites, writeLocalFavorites } from './storageService';

export type Story = {
  id: string;
  title: string;
  category: string;
  region: string;
  ethnicGroup: string;
  content: string;
  imageUrl: string;
  audioUrl?: any;
  likes?: number;
  views?: number;
};

// Bibliothèque culturelle initiale de référence (Contes, Fables, Proverbes et Coutumes de Guinée)
export const INITIAL_STORIES: Story[] = [
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
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
    audioUrl: require('../../assets/audio/soundiatastory.mp3'),
    likes: 142,
    views: 1250,
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
    imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
    likes: 89,
    views: 890,
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
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    likes: 215,
    views: 1840,
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
    imageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800',
    likes: 110,
    views: 920,
  },
  {
    id: '5',
    title: 'Les Proverbes du Baobab',
    category: 'Proverbe',
    region: 'Kankan',
    ethnicGroup: 'Mandingue',
    content: `Sous l'ombre immense du baobab, les anciens du Manden se réunissent encore pour transmettre la parole qui éclaire. Voici quelques proverbes que le griot confie à celui qui sait écouter.

« Le petit oiseau qui s'agite dans le nid ne fait pas tomber l'arbre. » — Les bruits du monde ne doivent pas troubler celui qui connaît sa route.

« C'est au bout de l'ancienne corde que l'on tisse la nouvelle. » — Nous avançons grâce à l'expérience de ceux qui nous ont précédés.

« La main qui donne est toujours au-dessus de la main qui reçoit. » — Donner est une noblesse, recevoir est une leçon d'humilité.

« Si tu veux aller vite, marche seul ; si tu veux aller loin, marchons ensemble. » — L'union fait la force des peuples.

« La patience est l'arbre dont la racine est amère et le fruit très doux. » — Rien de grand ne se construit dans la précipitation.

Médite ces paroles, mon enfant : elles sont légères à porter et lourdes de sens.`,
    imageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800',
    likes: 64,
    views: 540,
  },
  {
    id: '6',
    title: 'Le Tambour de la Forêt Sacrée',
    category: 'Conte',
    region: 'Nzérékoré',
    ethnicGroup: 'Guerzé',
    content: `Au village de Kpaya, le jeune Kpana passait ses journées à écouter le grand tambour du bois sacré. Il croyait qu'un bon batteur devait frapper plus fort que les autres. Son grand-père, gardien des rythmes, le fit asseoir près de la rivière. « Écoute d'abord, lui dit-il. Le tambour ne crie pas : il répond. » Kpana apprit le battement de la pluie sur les feuilles, le pas du porteur d'eau, le souffle du vent dans les fromagers.

Le jour de la fête des récoltes, le vieux gardien posa les baguettes entre ses mains. Kpana ferma les yeux. Au lieu de frapper, il laissa monter les sons qu'il avait appris. Le tambour parla comme un cœur qui bat, et les danseurs entrèrent dans le cercle sans qu'on les appelle.

Depuis ce jour, on dit à Kpaya que la maîtrise n'est pas dans la force du poignet, mais dans l'écoute qui précède le geste.`,
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    likes: 57,
    views: 430,
  },
  {
    id: '7',
    title: 'Le Pêcheur et le Génie du Niger',
    category: 'Conte',
    region: 'Siguiri',
    ethnicGroup: 'Mandingue',
    content: `À l'aube, Fodé lançait ses filets dans le Niger. Ce matin-là, il remonta un poisson d'argent dont les écailles brillaient comme des pièces de monnaie. « Relâche-moi, souffla le poisson, et le fleuve se souviendra de toi. » Les autres pêcheurs se moquèrent, mais Fodé remit le poisson à l'eau.

Quelques saisons plus tard, la pluie cessa. Les puits séchèrent et les bœufs maigrirent. Fodé retourna au fleuve et appela le génie. Une voix monta des roseaux : « Suis le lit des oiseaux. » Il marcha trois jours et découvrit une source cachée sous les rochers.

Fodé ne garda pas l'eau pour sa famille. Il fit creuser un canal jusqu'au village, et chaque concession reçut sa part. On raconte que le Niger protège encore ceux qui savent rendre ce qu'ils ont reçu.`,
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
    likes: 74,
    views: 610,
  },
  {
    id: '8',
    title: 'La Fille qui Parlait aux Oiseaux',
    category: 'Conte',
    region: 'Kindia',
    ethnicGroup: 'Soussou',
    content: `Aïssatou avait un don : elle comprenait le langage des oiseaux. Les tisserins lui annonçaient la pluie, les hérons les crues, et les vautours les longues sécheresses. Les anciens l'écoutaient avec respect, mais le nouveau chef du canton, lui, ne croyait qu'aux tambours et aux fusils.

Un matin, les oiseaux quittèrent tous ensemble la vallée. Aïssatou courut prévenir : « Une tempête arrive par les montagnes. » On la prit pour une rêveuse. Le soir, le vent arracha les toits et emporta les greniers. Seuls les habitants qui avaient suivi son conseil s'étaient abrités dans la grotte.

Quand le calme revint, les oiseaux rapportèrent des graines dans leurs becs. Le chef comprit que la plus petite voix peut porter le plus grand avertissement. Il nomma Aïssatou gardienne des saisons, et depuis, à Kindia, on apprend aux enfants à écouter avant de décider.`,
    imageUrl: 'https://images.unsplash.com/photo-1504174604143-53116383966c?w=800',
    likes: 93,
    views: 720,
  },
  {
    id: '9',
    title: 'Le Secret du Forgeron',
    category: 'Conte',
    region: 'Kouroussa',
    ethnicGroup: 'Konianké',
    content: `Dans la forge de Kouroussa, le vieux Sékou enseignait à son apprenti que le fer a une mémoire. L'apprenti, pressé de se faire un nom, voulait forger une lame assez belle pour être offerte au roi. Il chauffait le métal jusqu'au rouge, frappait sans repos et cachait ses erreurs sous de belles gravures.

Sékou ne dit rien. Il lui demanda seulement de fabriquer une houe pour la veuve du quartier. L'apprenti s'indigna : « Une houe ? Ce n'est pas une arme de gloire ! » Le maître répondit : « Une lame qui ne nourrit personne n'est qu'un morceau de fer brillant. »

L'apprenti forgea la houe. La veuve cultiva son champ, nourrit ses enfants et, à la récolte suivante, apporta au jeune homme un panier de mil. Ce jour-là, il comprit que la vraie renommée se mesure à ce que l'on rend possible.`,
    imageUrl: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800',
    likes: 66,
    views: 505,
  },
  {
    id: '10',
    title: 'Les Deux Frères du Fouta',
    category: 'Conte',
    region: 'Mamou',
    ethnicGroup: 'Peul',
    content: `Deux frères, Bocar et Amadou, héritèrent d'un troupeau que leur père avait mis trente ans à bâtir. Bocar voulait vendre les bêtes pour acheter des terres au bord du fleuve. Amadou voulait garder le troupeau et suivre les pâturages comme les anciens.

Ils se disputèrent jusqu'à ce que la sécheresse tranche pour eux. L'herbe disparut, et les bêtes risquaient de mourir. Bocar proposa alors de vendre seulement les plus vieilles vaches pour acheter du fourrage ; Amadou conduisit le reste vers la vallée où l'eau demeurait.

Ni l'un ni l'autre n'avait entièrement raison. En unissant leur part, ils sauvèrent le troupeau et firent creuser un puits commun. Le père, avant de mourir, leur avait laissé une seule phrase : « Le troupeau se garde à deux mains, la parole se garde à deux oreilles. »`,
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
    likes: 81,
    views: 640,
  },
  {
    id: '11',
    title: 'Le Chasseur de la Montagne',
    category: 'Conte',
    region: 'Nzérékoré',
    ethnicGroup: 'Toma',
    content: `Le chasseur Kolé était connu dans toute la montagne. Chaque saison, il rapportait plus de gibier que les autres, et les jeunes voulaient marcher sur ses traces. Pourtant, après une année de chasse sans repos, la forêt devint silencieuse. Plus un singe, plus une perdrix, plus un souffle dans les fougères.

Une vieille femme, qui vivait à la lisière du bois, l'appela : « La montagne ne t'en veut pas. Elle attend que tu lui rendes ce que tu as pris. » Kolé déposa son arc et passa une lune entière à observer sans tuer. Il comprit que les jeunes bêtes devaient grandir et que les anciennes devaient transmettre leur chemin.

À son retour, il posa ses propres règles : ne jamais chasser une femelle pleine, laisser les petits, remercier l'arbre qui donne l'ombre. La forêt reprit voix. Et Kolé devint non plus le chasseur le plus redouté, mais le gardien le plus respecté.`,
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    likes: 102,
    views: 810,
  },
  {
    id: '12',
    title: 'Le Caméléon et le Baobab',
    category: 'Fable',
    region: 'Faranah',
    ethnicGroup: 'Mandingue',
    content: `Le caméléon se vantait partout : « Je change de couleur selon le lieu, je me cache dans l'herbe, je disparais dans la pierre. Aucun arbre ne peut me surpasser. » Le baobab l'écoutait sans un mot, ses racines profondes enfoncées dans la terre rouge.

Un orage terrible arriva. Le caméléon se fit vert comme la feuille, puis gris comme le rocher, mais le vent le jeta dans une flaque. Le baobab, lui, plia ses branches et resta debout, parce qu'il tenait par ce qu'on ne voyait pas.

Quand le soleil revint, le caméléon demanda le secret du baobab. « Je ne suis pas plus fort que le vent, répondit l'arbre. Je suis simplement attaché à quelque chose de plus grand que moi. » S'adapter sans racines, c'est être emporté au premier orage.`,
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
    likes: 88,
    views: 690,
  },
  {
    id: '13',
    title: 'La Tortue et le Vautour',
    category: 'Fable',
    region: 'Labé',
    ethnicGroup: 'Peul',
    content: `La tortue admirait le vautour qui planait au-dessus du Fouta. « Comme tu es libre ! lui dit-elle. Moi, je porte ma maison et je ne vois jamais le monde d'en haut. » Le vautour, flatté, proposa de l'emmener. Il la saisit entre ses serres et monta si haut que les villages ressemblèrent à des grains de mil.

La tortue, grisée, se moqua des autres animaux restés au sol. « Regardez ces rampants ! » cria-t-elle. Le vautour, blessé par cette ingratitude, ouvrit ses serres. La tortue tomba, tomba, et plongea dans une mare.

Quand elle remonta, couverte de boue, une vieille tortue lui dit : « Tu voulais voir avec les yeux d'un autre. Maintenant, apprends à voir avec les tiens. » La carapace n'est pas une prison : c'est une maison qui voyage avec celui qui sait où il va.`,
    imageUrl: 'https://images.unsplash.com/photo-1504174604143-53116383966c?w=800',
    likes: 71,
    views: 560,
  },
  {
    id: '14',
    title: 'Le Crocodile Reconnaissant',
    category: 'Fable',
    region: 'Boffa',
    ethnicGroup: 'Landouma',
    content: `Sur les rives de la Fatala, un jeune garçon trouva un crocodile pris dans un filet abandonné. L'animal gémissait. « Si tu me délivres, je te promets de ne jamais toucher aux enfants de ton village », dit-il. Le garçon coupa les cordes et le crocodile disparut dans l'eau trouble.

Les années passèrent. Le garçon devint pêcheur. Un jour de grande marée, sa pirogue chavira et le courant l'emporta vers les mangroves. Il crut sa dernière heure arrivée lorsqu'une masse sombre glissa sous lui et le poussa doucement vers la berge.

C'était le crocodile. Il n'avait pas oublié. Depuis ce jour, les anciens de Boffa racontent que la reconnaissance est une eau profonde : elle ne fait pas de bruit, mais elle porte ceux qui ont su donner.`,
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
    likes: 64,
    views: 490,
  },
  {
    id: '15',
    title: 'Le Singe qui Voulait la Lune',
    category: 'Fable',
    region: 'Macenta',
    ethnicGroup: 'Kissi',
    content: `Un jeune singe vit la lune se refléter dans le puits du village. Il crut qu'elle était tombée et qu'il pourrait la rapporter aux siens. Il descendit le long des racines, tendit la main, et l'image se brisa en mille éclats d'argent.

Le singe remonta, honteux. « La lune s'est cachée ! » dit-il. Une vieille guenon le conduisit au sommet de la colline. Là, dans le ciel, la lune brillait, entière et paisible. « Ce que tu cherchais était au-dessus de toi, dit-elle. Mais tu regardais trop bas. »

Le jeune singe comprit qu'une illusion peut ressembler à un trésor. Depuis, quand la lune se lève sur Macenta, les anciens rappellent aux enfants : ne confonds pas le reflet avec la lumière.`,
    imageUrl: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800',
    likes: 79,
    views: 620,
  },
  {
    id: '16',
    title: 'Le Moustique et l’Oreille',
    category: 'Fable',
    region: 'Conakry',
    ethnicGroup: 'Soussou',
    content: `Un moustique se posa sur l'épaule d'un homme endormi et se mit à fanfaronner : « Je suis si petit que personne ne peut m'attraper. Je peux entrer dans l'oreille d'un roi sans qu'il s'en aperçoive. » L'oreille, qui entendait tout, lui répondit : « Entre donc. Tu verras que le plus petit bruit peut réveiller le plus grand sommeil. »

Le moustique s'engouffra dans le conduit, bourdonnant de victoire. Mais la cire l'accrocha, et l'homme se réveilla en se grattant. Le moustique resta prisonnier de sa propre vantardise.

À Conakry, on raconte cette histoire aux enfants qui se croient invincibles : la ruse sans mesure finit par se prendre à son propre piège.`,
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    likes: 43,
    views: 350,
  },
  {
    id: '17',
    title: 'L’Araignée et la Pluie',
    category: 'Fable',
    region: 'Kissidougou',
    ethnicGroup: 'Kissi',
    content: `L'araignée tissait sa toile au-dessus du sentier. Elle voulait attraper la pluie pour la montrer à ses petits. « Une si belle chose ne doit pas tomber n'importe où », disait-elle. Elle tendit ses fils du fromager au manguier, et attendit.

La première averse déchira tout. L'araignée tomba dans la boue, ses huit pattes tremblantes. Au lieu de pleurer, elle observa les branches : le vent avait épargné celles qui pliaient. Elle recommença sa toile plus bas, entre deux troncs souples, avec des ancrages plus larges.

La saison des pluies passa, et sa toile survécut. « La force n'est pas de résister à tout, dit-elle à ses petits, mais de savoir où s'attacher pour ne pas être emporté. »`,
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
    likes: 58,
    views: 445,
  },
  {
    id: '18',
    title: 'Les Proverbes du Fleuve',
    category: 'Proverbe',
    region: 'Siguiri',
    ethnicGroup: 'Mandingue',
    content: `À Siguiri, les anciens s'assoient face au Niger pour transmettre la parole des bateliers. Voici quelques proverbes que l'eau a enseignés aux hommes.

« Le fleuve ne demande pas son chemin à la pirogue. » — Celui qui connaît sa direction n'a pas besoin de suivre toutes les voix.

« L'eau qui dort cache parfois le courant le plus fort. » — Méfie-toi des colères silencieuses.

« On ne traverse pas deux fois le même courant. » — Chaque jour demande un regard neuf.

« La pirogue vide fait plus de bruit que la pirogue chargée. » — La sagesse parle bas.

« Le fleuve donne à boire à celui qui respecte sa berge. » — La nature rend ce qu'on lui confie.

Médite ces paroles au bord de l'eau, et tu entendras le fleuve répondre à ta question.`,
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
    likes: 95,
    views: 760,
  },
  {
    id: '19',
    title: 'La Parole des Bergers',
    category: 'Proverbe',
    region: 'Mamou',
    ethnicGroup: 'Peul',
    content: `Sur les hauteurs du Fouta, les bergers confient leurs leçons au vent du soir. Voici quelques paroles recueillies auprès des anciens.

« La patience est le pâturage de celui qui marche loin. » — Rien de durable ne se bâtit dans la hâte.

« Une seule vache égarée fait oublier tout le troupeau. » — Prends soin du plus fragile, ou le troupeau entier perdra son chemin.

« Le lait se partage, la parole se donne. » — Ce que l'on garde pour soi finit par aigrir.

« L'étranger qui arrive à l'heure du repas est un hôte envoyé par le ciel. » — L'hospitalité n'attend pas la richesse.

« Deux bergers valent mieux qu'un troupeau. » — L'union rend la route moins longue.

Ces proverbes rappellent que le Pulaaku se vit dans les gestes autant que dans les mots.`,
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
    likes: 87,
    views: 680,
  },
  {
    id: '20',
    title: 'Les Leçons de la Mer',
    category: 'Proverbe',
    region: 'Boké',
    ethnicGroup: 'Nalou',
    content: `Sur la côte de Boké, les pêcheurs nalou apprennent aux enfants à lire la mer avant de lire les étoiles. Voici leurs paroles.

« La mer ne se fâche pas d'un coup : elle prévient par la vague. » — Écoute les signes avant qu'ils ne deviennent des tempêtes.

« Le sel conserve le poisson et la parole. » — Ce qui est dit avec respect traverse les saisons.

« Un filet trop serré ne laisse rien passer, pas même le poisson de demain. » — La cupidité vide la mer et le cœur.

« La pirogue qui suit la mangrove évite le rocher. » — L'humilité connaît les chemins sûrs.

« On ne remercie pas la mer en lui tournant le dos. » — La gratitude se prouve par les actes.

Le soir, quand les pirogues rentrent, les anciens répètent : la mer nourrit ceux qui la respectent.`,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    likes: 76,
    views: 590,
  },
  {
    id: '21',
    title: 'La Sagesse des Forgerons',
    category: 'Proverbe',
    region: 'Kouroussa',
    ethnicGroup: 'Konianké',
    content: `Dans les ateliers de Kouroussa, la parole des forgerons accompagne chaque coup de marteau. En voici quelques-unes.

« Le feu ne se dompte pas avec la colère, mais avec la mesure. » — La maîtrise naît du contrôle de soi.

« Le fer se souvient de la main qui l'a plié. » — Chaque geste laisse une trace dans ce que l'on crée.

« Une lame sans manche blesse celui qui la porte. » — Le savoir sans sagesse devient un danger.

« Le forgeron qui refuse d'apprendre devient l'esclave de son marteau. » — L'orgueil arrête la croissance.

« On reconnaît l'atelier à ses étincelles, l'homme à ses œuvres. » — Les actes parlent plus fort que les promesses.

Ces proverbes rappellent que tout métier est d'abord une école de patience.`,
    imageUrl: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800',
    likes: 54,
    views: 410,
  },
  {
    id: '22',
    title: 'Les Mots de la Nuit',
    category: 'Proverbe',
    region: 'Nzérékoré',
    ethnicGroup: 'Toma',
    content: `Quand la nuit tombe sur Nzérékoré, les anciens s'assoient autour du feu et laissent parler les étoiles. Voici quelques paroles de la nuit.

« La nuit n'efface pas le chemin, elle apprend à marcher autrement. » — L'épreuve change la manière d'avancer, pas la destination.

« L'étoile la plus discrète guide parfois le voyageur perdu. » — Ne méprise pas les conseils humbles.

« Le silence de la forêt est plus riche que le bruit du marché. » — L'écoute ouvre ce que la parole ferme.

« Celui qui a peur du noir ne verra jamais l'aube. » — Le courage est le prix de la lumière.

« Le rêve du soir se confie au matin. » — Le temps révèle ce que l'émotion cache.

La nuit, disent les Toma, est une maîtresse qui ne parle qu'à ceux qui savent se taire.`,
    imageUrl: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800',
    likes: 91,
    views: 705,
  },
  {
    id: '23',
    title: 'Le Dire des Anciens',
    category: 'Proverbe',
    region: 'Faranah',
    ethnicGroup: 'Dialonké',
    content: `À Faranah, la parole des anciens se transmet autour du kola, avant que le repas ne soit servi. Voici quelques maximes.

« La parole est une semence : elle pousse là où on la dépose. » — Choisis le cœur qui recevra tes mots.

« Deux oreilles valent mieux qu'une bouche. » — Écouter est la première forme du respect.

« Ce que la mémoire oublie, le geste le rappelle. » — Les coutumes sont des souvenirs vivants.

« Un ancien qui meurt, c'est une bibliothèque qui brûle. » — Prends le temps de recueillir les savoirs.

« La vérité se dit doucement ; seul le mensonge a besoin de crier. » — La force n'est pas dans le volume de la voix.

Ces paroles invitent chacun à devenir un passeur, non un simple gardien.`,
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    likes: 83,
    views: 645,
  },
  {
    id: '24',
    title: 'La Cérémonie du Kola',
    category: 'Coutume',
    region: 'Kankan',
    ethnicGroup: 'Mandingue',
    content: `Dans les villages mandingues de Kankan, la noix de kola accompagne les grandes rencontres. On ne l'offre pas pour nourrir, mais pour ouvrir : elle marque le respect, scelle une réconciliation ou accompagne une demande de mariage.

L'hôte présente la noix à l'aîné, qui la brise et la partage. Chacun en reçoit un éclat, même le plus jeune. La saveur amère qui devient douce au fil de la mastication rappelle que les relations demandent du temps et de la patience.

Aujourd'hui encore, avant une discussion importante, on entend : « Cassons le kola. » Cela signifie : déposons nos différends et parlons avec respect. Ce geste simple transforme une réunion en moment de mémoire partagée.`,
    imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
    likes: 112,
    views: 930,
  },
  {
    id: '25',
    title: 'Le Mariage Peul',
    category: 'Coutume',
    region: 'Labé',
    ethnicGroup: 'Peul',
    content: `Dans la tradition peule du Fouta, le mariage est une affaire de familles autant que de cœurs. Les premières rencontres se font souvent par l'intermédiaire de proches, qui écoutent les intentions et vérifient que les deux familles se connaissent et se respectent.

Vient ensuite le temps des présents et des bénédictions. Le troupeau, les tissus ou les objets symboliques n'ont pas de prix marchand : ils disent l'engagement et la capacité à prendre soin. Les anciens rappellent aux jeunes que le mariage se construit dans la durée, la fidélité et le partage des responsabilités.

Les pratiques varient selon les villages et évoluent avec les générations. Ce qui demeure, c'est l'idée que deux familles qui s'unissent doivent laisser à chacun sa dignité. Le véritable trousseau, disent les mères, est la patience.`,
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    likes: 98,
    views: 790,
  },
  {
    id: '26',
    title: 'La Danse des Masques',
    category: 'Coutume',
    region: 'Nzérékoré',
    ethnicGroup: 'Guerzé',
    content: `Dans la région de Nzérékoré, les masques ne sont pas de simples objets de spectacle. Ils appartiennent à des sociétés initiatiques et portent la mémoire des ancêtres. Leur sortie est encadrée par des règles précises : un moment, un lieu, un public, un porteur désigné.

Lors des grandes cérémonies, le danseur avance au rythme des tambours. Ses pas racontent une histoire que les initiés reconnaissent : la fertilité, la protection, la justice ou le passage d'une génération à l'autre. Le masque n'est jamais « joué » pour divertir un visiteur ; il est honoré.

Aujourd'hui, certaines danses sont présentées lors de festivals culturels, avec l'accord des communautés. Les anciens insistent : regarder un masque, c'est accepter de ne pas tout comprendre. Le respect fait partie de la danse.`,
    imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
    likes: 134,
    views: 1100,
  },
  {
    id: '27',
    title: 'La Pêche Collective',
    category: 'Coutume',
    region: 'Boké',
    ethnicGroup: 'Landouma',
    content: `À marée basse, sur les rives de Boké, les communautés landouma se rassemblent pour la pêche collective. Les anciens choisissent le jour, les femmes préparent les paniers, les jeunes ferment la lagune avec des filets et des branchages.

Chacun participe selon ses forces, et la récolte est partagée : une part pour les pêcheurs, une pour les familles, une pour les anciens et les personnes vulnérables. Personne ne repart les mains vides. Les règles sont simples : ne pas capturer les jeunes poissons, laisser les zones de reproduction tranquilles, remercier la mangrove qui protège la côte.

Cette pratique n'est pas seulement une technique de survie. C'est une école de solidarité et de gestion durable. La mer, disent les anciens, ne se donne jamais à un seul homme.`,
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
    likes: 77,
    views: 600,
  },
  {
    id: '28',
    title: 'Le Pilage du Riz',
    category: 'Coutume',
    region: 'Kindia',
    ethnicGroup: 'Soussou',
    content: `Dans les villages de Kindia, le pilage du riz rassemble les femmes au petit matin. Le riz a trempé toute la nuit ; les mortiers de bois sont alignés sous le manguier. Chaque geste a son rythme, et les pilons frappent ensemble comme un tambour.

Les chants accompagnent le travail. Ils racontent les récoltes, les mariages, les naissances et parfois les peines qu'on ne peut dire autrement. Une jeune fille apprend en regardant : la force ne suffit pas, il faut la mesure, la coordination et le respect du rythme des autres.

Le riz pilé est partagé entre les familles. Ce jour-là, personne ne cuisine seul. Le pilage rappelle que le travail collectif nourrit le village, et que les tâches les plus ordinaires portent la mémoire de ceux qui les ont accomplies avant nous.`,
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
    likes: 105,
    views: 840,
  },
  {
    id: '29',
    title: 'La Fête des Récoltes',
    category: 'Coutume',
    region: 'Macenta',
    ethnicGroup: 'Kissi',
    content: `Quand les premiers épis de riz jaunissent, les villages kissi de Macenta préparent la fête des récoltes. On nettoie les chemins, on répare les tambours et on invite les voisins. La première gerbe n'est pas vendue : elle est offerte aux ancêtres et aux plus âgés.

La fête commence par les remerciements. Les anciens rappellent les pluies difficiles, les semences partagées, les mains qui ont travaillé. Puis viennent les danses, les chants et le repas commun. Les enfants reçoivent une part symbolique pour apprendre que la nourriture est un don, non un dû.

À la fin, chacun repart avec des semences pour la saison suivante. La fête ne célèbre pas seulement l'abondance : elle prépare la suite. Une récolte se partage, dit-on, pour que la prochaine existe.`,
    imageUrl: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800',
    likes: 89,
    views: 700,
  },
  {
    id: '30',
    title: 'Le Respect de l’Hôte',
    category: 'Coutume',
    region: 'Conakry',
    ethnicGroup: 'Soussou',
    content: `À Conakry, la tradition d'hospitalité a pris les couleurs de la ville. On n'offre plus toujours la noix de kola, mais on offre de l'eau, un siège, un repas, et surtout du temps. Le premier devoir de l'hôte est de faire sentir à l'arrivant qu'il est attendu.

Les salutations occupent une place centrale : on demande des nouvelles de la famille, du travail, de la santé, avant d'aborder le sujet de la visite. Brûler ces étapes, c'est traiter la personne comme une formalité. Les anciens disent que la parole qui va droit au but oublie souvent le cœur.

Dans les quartiers, cette hospitalité se vit aussi entre voisins : on partage un plat, on garde un enfant, on aide à porter. La ville change les maisons, pas la leçon : celui qui accueille bien reçoit toujours quelque chose en retour.`,
    imageUrl: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800',
    likes: 118,
    views: 960,
  },
  {
    id: '31',
    title: 'Le Griot et le Roi Silencieux',
    category: 'Conte',
    region: 'Kankan',
    ethnicGroup: 'Mandingue',
    content: `Le roi du Manden avait interdit à quiconque de lui dire la vérité. Ceux qui annonçaient une mauvaise récolte ou une guerre perdue étaient chassés. Les conseillers apprirent à parler pour ne rien dire, et le royaume s'enfonça dans un silence doré.

Un vieux griot demanda audience. Il entra sans instrument, s'assit et raconta l'histoire d'un puits que l'on avait recouvert d'une belle pierre. « Les villageois passaient devant en disant que l'eau était claire, puisque personne n'osait regarder dedans. Un jour, un enfant souleva la pierre et trouva le puits à sec. »

Le roi resta longtemps silencieux. Puis il fit ouvrir les greniers, écouter les paysans et rouvrir les chemins. Il comprit que la parole du griot ne blessait pas le trône : elle l'empêchait de tomber. Depuis, à Kankan, on dit qu'un roi sans critique est un puits sans eau.`,
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
    likes: 121,
    views: 980,
  },
  {
    id: '32',
    title: 'La Fille qui Portait l’Eau du Fleuve',
    category: 'Conte',
    region: 'Faranah',
    ethnicGroup: 'Dialonké',
    content: `Chaque matin, Fatou descendait au fleuve avec deux calebasses. Les autres filles remplissaient les leurs en riant ; Fatou, elle, prenait le temps de regarder le courant. Sa mère s'impatientait : « L'eau n'a pas besoin d'être contemplée, elle a besoin d'être portée. »

Une saison, le fleuve baissa sans prévenir. Les puits du village s'asséchèrent. Fatou se souvint d'un endroit où le courant formait un remous, sous les racines d'un figuier. Elle y conduisit les femmes et l'on trouva une source profonde.

Les anciens comprirent qu'elle n'avait pas perdu son temps. « Celle qui regarde l'eau apprend où elle se cache », dirent-ils. Fatou devint la gardienne des points d'eau, et l'on apprit aux enfants à observer avant de puiser.`,
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
    likes: 97,
    views: 760,
  },
  {
    id: '33',
    title: 'Le Fils du Tisserand',
    category: 'Conte',
    region: 'Kindia',
    ethnicGroup: 'Soussou',
    content: `Dans un atelier de Kindia, le tisserand Mamadou préparait ses fils avant le lever du soleil. Son fils Saliou, lui, rêvait de quitter le métier. Il trouvait le geste lent, répétitif, sans gloire. « Les héros manient le fer, disait-il, pas le coton. »

Mamadou ne le força pas. Il lui confia une commande : un pagne pour le mariage d'une jeune veuve sans fortune. Saliou travailla à contrecœur, puis découvrit que chaque motif portait un sens : la ligne pour le chemin, le losange pour la famille, le bleu pour la patience.

Le jour du mariage, la femme pleura en recevant le pagne. Elle y lisait le respect qu'on lui portait. Saliou reprit l'atelier de son père, non par obligation, mais parce qu'il avait compris que tisser, c'est relier des vies.`,
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
    likes: 88,
    views: 690,
  },
  {
    id: '34',
    title: 'Le Dernier Chant du Baobab',
    category: 'Conte',
    region: 'Kouroussa',
    ethnicGroup: 'Konianké',
    content: `Le grand baobab de Kouroussa abritait les assemblées depuis des générations. On y réglait les disputes, on y annonçait les naissances, on y pleurait les morts. Puis vint un chef qui voulut bâtir un marché à sa place. « Un arbre ne nourrit personne », dit-il.

Les anciens protestèrent, mais les haches arrivèrent. La veille de l'abattage, une vieille femme s'assit au pied du tronc et se mit à chanter. Elle chantait les noms de ceux qui s'étaient mariés sous les branches, les enfants nés à son ombre, les paroles de paix qui y avaient été prononcées.

Les villageois vinrent un à un. Le chef écouta. Il comprit que l'arbre n'était pas un obstacle au marché : il en était la mémoire. Les haches furent rangées. Le marché se tint désormais à côté du baobab, et chaque nouveau commerçant devait d'abord écouter son histoire.`,
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
    likes: 104,
    views: 820,
  },
  {
    id: '35',
    title: 'L’Écureuil et le Fromager',
    category: 'Fable',
    region: 'Macenta',
    ethnicGroup: 'Kissi',
    content: `Un écureuil avait élu domicile dans un jeune fromager. Chaque jour, il se moquait des arbres voisins : « Voyez comme je suis haut ! Mon arbre pousse plus vite que les vôtres. » Le fromager grandissait, et l'écureuil avec lui.

Un vent violent traversa la forêt. Les arbres anciens plièrent leurs branches et tinrent bon. Le jeune fromager, haut mais tendre, se fendit en deux. L'écureuil tomba dans les fougères, indemne mais humilié.

Une vieille chauve-souris suspendue à un kapokier lui dit : « Tu as choisi la hauteur avant la profondeur. » L'écureuil retourna vivre près des racines, apprit à connaître les arbres avant de s'y installer, et ne confondit plus jamais croissance et solidité.`,
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    likes: 63,
    views: 480,
  },
  {
    id: '36',
    title: 'Le Chacal et la Carapace',
    category: 'Fable',
    region: 'Labé',
    ethnicGroup: 'Peul',
    content: `Le chacal trouva une carapace de tortue abandonnée. Il s'en couvrit et se présenta au village des animaux : « Je suis la tortue nouvelle, plus sage et plus rapide que l'ancienne. » On l'invita aux repas, car la tortue était aimée.

Mais le chacal ne pouvait s'empêcher de courir après les poules. Il oubliait sa carapace, se cognait aux murs et perdait ses moyens. Un jour, une poule le reconnut à son odeur. Tous les animaux accoururent.

Le chacal s'enfuit, la carapace sur le dos, incapable de la retirer. Il comprit que l'on peut emprunter l'apparence d'un autre, jamais sa place. Depuis, au Fouta, on dit : « La carapace ne fait pas la tortue, pas plus que le pagne ne fait l'homme. »`,
    imageUrl: 'https://images.unsplash.com/photo-1504174604143-53116383966c?w=800',
    likes: 72,
    views: 540,
  },
  {
    id: '37',
    title: 'Le Coq qui Voulait le Soleil',
    category: 'Fable',
    region: 'Boké',
    ethnicGroup: 'Landouma',
    content: `Chaque matin, le coq chantait avant le lever du soleil. Les villageois se réveillaient et disaient : « Le coq a fait venir le jour. » Le coq finit par le croire. Il se crut indispensable.

Un matin, il décida de ne pas chanter pour prouver son pouvoir. Le soleil se leva quand même. Le coq, vexé, chanta plus fort le lendemain, puis se rendit compte que les hommes se levaient sans lui.

Une vieille cane lui dit : « Tu annonces le jour, tu ne le fabriques pas. » Le coq retrouva sa place : non pas maître du soleil, mais veilleur fidèle. À Boké, on enseigne aux enfants que celui qui confond sa mission avec sa puissance finit par se taire inutilement.`,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    likes: 59,
    views: 460,
  },
  {
    id: '38',
    title: 'La Pintade et le Chasseur',
    category: 'Fable',
    region: 'Nzérékoré',
    ethnicGroup: 'Manon',
    content: `Un chasseur avait posé ses pièges dans la forêt. Une pintade, curieuse, suivit les traces de ses pas. Elle vit les collets, les évita et se moqua : « Le chasseur croit être plus malin que la forêt. »

Le lendemain, elle revint avec ses petits pour leur montrer les pièges. Mais la pluie avait effacé les repères, et l'un des oisillons se prit dans un filet. La pintade cria, alerte tout le bois, et le chasseur accourut.

Au lieu de tuer, il libéra l'oisillon. La pintade, surprise, lui demanda pourquoi. « Parce que tu as appris à tes petits à regarder le danger, et moi j'ai appris que la forêt se souvient de ceux qui la respectent. » Depuis, le chasseur plaçait des signes visibles près de ses pièges.`,
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    likes: 67,
    views: 510,
  },
  {
    id: '39',
    title: 'Le Lion et le Petit Oiseau',
    category: 'Fable',
    region: 'Siguiri',
    ethnicGroup: 'Mandingue',
    content: `Le lion, blessé par une épine, rugissait dans la savane. Tous les animaux fuyaient. Seul un petit oiseau s'approcha. « Laisse-moi regarder, dit-il. Je suis assez petit pour entrer dans ta patte. »

Le lion accepta, moitié par douleur, moitié par mépris. L'oiseau retira l'épine et nettoya la plaie. Le lion, soulagé, voulut le récompenser en le nommant messager du royaume. L'oiseau refusa : « Je ne veux pas de titre, je veux que tu te souviennes qu'un petit peut sauver un grand. »

Les années passèrent. Le lion, devenu vieux, fut chassé par un jeune rival. C'est l'oiseau qui l'aida à trouver un abri et à manger. La savane apprit ce jour-là que la grandeur se mesure aussi à ceux qu'elle accepte d'écouter.`,
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
    likes: 96,
    views: 740,
  },
  {
    id: '40',
    title: 'L’Hippopotame et le Pêcheur',
    category: 'Fable',
    region: 'Boffa',
    ethnicGroup: 'Nalou',
    content: `Sur la Fatala, un pêcheur trouvait chaque matin ses nasses vides. Il accusa le courant, puis les voleurs, puis la lune. Une nuit, il veilla. Une masse sombre sortit de l'eau : un hippopotame venait manger les poissons pris dans ses filets.

Le pêcheur cria, lança une pierre, menaça. L'hippopotame s'en alla sans se presser. Le lendemain, les nasses étaient encore vides. Une vieille femme du village lui dit : « Tu défends ton poisson, mais tu as oublié de partager la berge. »

Le pêcheur laissa une zone de roseaux intacte et déplaça ses nasses. L'hippopotame cessa de venir. Le pêcheur comprit que la mer et le fleuve ne se conquièrent pas : ils se négocient. Depuis, à Boffa, on réserve toujours une part de la rive aux animaux.`,
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
    likes: 74,
    views: 560,
  },
  {
    id: '41',
    title: 'Les Paroles de la Savane',
    category: 'Proverbe',
    region: 'Kankan',
    ethnicGroup: 'Mandingue',
    content: `En saison sèche, quand l'herbe jaunit et que le vent porte la poussière, les anciens du Manden aiment rappeler les leçons de la savane. En voici quelques-unes.

« L'herbe qui plie devant le vent se relève après l'orage. » — La souplesse vaut mieux que l'obstination stérile.

« Un seul arbre ne fait pas une forêt, mais il peut abriter un voyageur. » — Chacun peut être utile à sa mesure.

« La poussière ne monte jamais plus haut que celui qui la soulève. » — Nos gestes retombent toujours sur nous.

« Le feu de brousse éclaire un instant et détruit pour des années. » — La colère brille vite et laisse des cendres.

« Marche derrière celui qui connaît le puits, mais garde les yeux ouverts. » — Suis les anciens sans renoncer à ton jugement.

Médite ces paroles quand la route est longue : la savane parle à ceux qui savent ralentir.`,
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
    likes: 101,
    views: 810,
  },
  {
    id: '42',
    title: 'Les Mots de la Forêt',
    category: 'Proverbe',
    region: 'Nzérékoré',
    ethnicGroup: 'Guerzé',
    content: `La forêt de Nzérékoré ne se traverse pas en courant. Les anciens s'arrêtent sous les fromagers pour transmettre les paroles que le bois leur a confiées.

« L'arbre ne se vante pas de ses racines, pourtant c'est d'elles qu'il vit. » — L'humilité porte la grandeur.

« Le sentier que personne n'entretient disparaît sous les feuilles. » — La mémoire aussi demande des mains.

« La liane s'accroche au tronc, mais c'est le tronc qui tient le ciel. » — Le soutien discret mérite reconnaissance.

« On ne coupe pas l'arbre qui donne l'ombre pour voir le soleil. » — Ne sacrifie pas le durable au plaisir du moment.

« La forêt écoute avant de répondre. » — Le silence précède la vraie parole.

Ces mots rappellent que la forêt n'est pas un décor : c'est une école dont les cours ne se terminent jamais.`,
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    likes: 86,
    views: 670,
  },
  {
    id: '43',
    title: 'Les Leçons du Marché',
    category: 'Proverbe',
    region: 'Conakry',
    ethnicGroup: 'Soussou',
    content: `À Conakry, le marché enseigne autant que l'école. On y apprend à saluer, à négocier, à partager un étal et à supporter la chaleur. Voici des paroles entendues entre deux paniers.

« Le prix se discute, le respect ne se négocie pas. » — Aucun marché ne justifie la humiliation.

« Celui qui court partout revient souvent les mains vides. » — La précipitation disperse.

« Le client d'aujourd'hui est le voisin de demain. » — Ne brûle pas la relation pour un gain.

« Une balance juste nourrit la famille plus longtemps qu'une balance menteuse. » — La tricherie se paie.

« On ne connaît pas la valeur d'un pagne en regardant seulement son prix. » — L'œuvre dépasse l'étiquette.

Le marché est un miroir : on y voit comment une ville traite ses vendeurs, ses acheteurs et ses anciens.`,
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    likes: 92,
    views: 720,
  },
  {
    id: '44',
    title: 'La Sagesse des Montagnes',
    category: 'Proverbe',
    region: 'Labé',
    ethnicGroup: 'Peul',
    content: `Sur les hauteurs du Fouta, le vent porte les paroles des bergers d'un plateau à l'autre. La montagne apprend la patience, car rien n'y monte vite.

« La montagne ne se franchit pas d'un seul pas. » — Découpe ton effort, mais ne t'arrête pas.

« Le sommet est silencieux ; c'est la vallée qui fait du bruit. » — La vraie force parle peu.

« Celui qui regarde seulement le sommet oublie le caillou sous son pied. » — L'attention au présent protège l'avenir.

« Une source connaît son chemin même sous les pierres. » — La vocation persiste malgré les obstacles.

« Le berger qui écoute ses bêtes entend aussi le danger. » — Prends soin du quotidien, il annonce les grands jours.

Le Fouta enseigne que l'on ne domine pas la montagne : on apprend à marcher avec elle.`,
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
    likes: 84,
    views: 650,
  },
  {
    id: '45',
    title: 'Les Paroles du Riz',
    category: 'Proverbe',
    region: 'Kissidougou',
    ethnicGroup: 'Kissi',
    content: `Dans les rizières de Kissidougou, les femmes chantent en repiquant. Leurs paroles suivent l'eau et la boue, et rappellent que la nourriture est un travail collectif.

« Le riz ne pousse pas dans la main fermée. » — Ce que l'on garde sans partager ne profite à personne.

« Une seule saison de pluie ne remplit pas tous les greniers. » — La prévoyance se construit dans la durée.

« Le champ du voisin n'est pas ton ennemi. » — La jalousie stérilise plus que la sécheresse.

« La main qui repique aujourd'hui mangera demain. » — L'effort patient a un goût de riz chaud.

« On ne mesure pas la récolte avant que l'épi ne courbe. » — Attends la maturité pour juger.

Ces proverbes accompagnent le travail et rappellent que la terre ne récompense pas l'impatience.`,
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
    likes: 78,
    views: 600,
  },
  {
    id: '46',
    title: 'Les Mots du Tisserand',
    category: 'Proverbe',
    region: 'Kindia',
    ethnicGroup: 'Soussou',
    content: `Dans les ateliers de Kindia, le métier à tisser rythme la journée. Entre deux passages de navette, les anciens transmettent quelques paroles.

« Le fil seul ne fait pas le pagne. » — La coopération donne forme à l'effort individuel.

« Un nœud mal serré se défait au premier lavage. » — La négligence cache longtemps sa faute.

« Le motif le plus beau est celui qui se répète sans se perdre. » — La constance n'est pas monotonie.

« On reconnaît le tisserand à l'envers de son ouvrage. » — Le détail invisible révèle le vrai savoir-faire.

« La navette va et vient, mais c'est la main qui décide. » — L'outil ne remplace pas le jugement.

Ces maximes font partie de l'apprentissage : on n'apprend pas seulement à tisser, on apprend à vivre avec ce que l'on crée.`,
    imageUrl: 'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800',
    likes: 71,
    views: 545,
  },
  {
    id: '47',
    title: 'La Bénédiction des Semences',
    category: 'Coutume',
    region: 'Faranah',
    ethnicGroup: 'Dialonké',
    content: `Avant les grandes pluies, les villages dialonké de Faranah préparent les semences. On trie le riz, le mil et l'arachide, on répare les paniers et l'on confie les graines aux plus anciens.

La veille des semis, les familles se rassemblent. Les anciens rappellent les récoltes difficiles, les voisins qui ont partagé, les mains qui ont travaillé. Chacun reçoit une poignée de semences et la bénit à sa manière, par une parole ou un geste de gratitude.

Le jour venu, les premiers grains sont semés par les enfants, guidés par les aînés. On dit que la terre reconnaît celui qui s'approche d'elle avec respect. Cette coutume rappelle que semer n'est pas seulement produire : c'est transmettre un espoir à ceux qui viendront après.`,
    imageUrl: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800',
    likes: 90,
    views: 705,
  },
  {
    id: '48',
    title: 'Le Passage sur la Montagne',
    category: 'Coutume',
    region: 'Nzérékoré',
    ethnicGroup: 'Toma',
    content: `Chez les Toma, le passage d'une génération à l'autre s'accompagne d'épreuves encadrées par les anciens. Le jeune quitte l'enfance, apprend le respect du secret, l'endurance et la solidarité du groupe.

La montagne n'est pas un simple décor : elle symbolise l'effort et le silence nécessaires pour grandir. Les détails du rituel appartiennent aux initiés et ne se racontent pas au dehors. Ce qui se transmet publiquement, c'est le sens : devenir adulte, c'est accepter des responsabilités envers la famille et le village.

Aujourd'hui, ces pratiques évoluent et certaines ne sont plus organisées comme autrefois. Les anciens insistent sur une chose : le passage ne fait pas l'homme à lui seul, c'est la manière dont il traite les autres ensuite qui le révèle.`,
    imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
    likes: 82,
    views: 640,
  },
  {
    id: '49',
    title: 'Le Partage du Poisson',
    category: 'Coutume',
    region: 'Boffa',
    ethnicGroup: 'Nalou',
    content: `À Boffa, quand les pirogues rentrent chargées, le poisson n'est pas vendu avant d'avoir été partagé. Les pêcheurs réservent une part pour les anciens, une pour les familles sans pêcheur, une pour les femmes qui préparent le repas commun.

La tête du poisson revient souvent à l'hôte ou à l'aîné, non parce qu'elle est la meilleure, mais parce qu'elle symbolise l'honneur rendu à celui qui reçoit. Les enfants apprennent à ne pas se servir avant que les plus âgés aient reçu.

Cette coutume survit même quand la pêche est maigre. On dit que la mer se souvient des villages qui partagent. Le poisson passe, la parole reste : celui qui accueille aujourd'hui sera accueilli demain.`,
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
    likes: 87,
    views: 675,
  },
  {
    id: '50',
    title: 'La Cérémonie du Nom',
    category: 'Coutume',
    region: 'Kankan',
    ethnicGroup: 'Mandingue',
    content: `Dans les familles mandingues de Kankan, le nom d'un enfant se donne devant les proches, quelques jours après la naissance. On choisit un nom qui porte une histoire, celui d'un ancêtre, d'un ami fidèle ou d'une personne dont on souhaite transmettre les qualités.

Les anciens rappellent que le nom n'est pas une étiquette : c'est une promesse et un lien. On évoque les responsabilités qui accompagneront l'enfant, puis on partage un repas et des bénédictions. Les voisins viennent même s'ils ne sont pas invités, car la naissance concerne le village.

Aujourd'hui, la cérémonie varie selon les familles et les villes. Ce qui demeure, c'est l'idée que l'enfant appartient à une chaîne : ceux qui l'ont précédé lui confient une mémoire, et il devra un jour la transmettre.`,
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    likes: 113,
    views: 900,
  }
];

/**
 * Facettes dérivées du catalogue : elles alimentent les filtres de recherche
 * sans liste codée en dur, pour supporter l'ajout de nouveaux récits.
 */
const uniqueSorted = (values: string[]): string[] =>
  Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'fr'));

export const STORY_REGIONS: string[] = [
  'Toutes',
  ...uniqueSorted(INITIAL_STORIES.map((story) => story.region)),
];

export const STORY_ETHNIC_GROUPS: string[] = [
  'Toutes',
  ...uniqueSorted(INITIAL_STORIES.map((story) => story.ethnicGroup)),
];

export const STORY_CATEGORY_FILTERS: string[] = [
  'Toutes',
  ...uniqueSorted(INITIAL_STORIES.map((story) => `${story.category}s`)),
];

/**
 * Normalise une facette de catégorie reçue depuis une navigation.
 * Les totems d'accueil envoient le pluriel (« Contes »), mais un appel direct
 * peut fournir le singulier (« Conte ») : les deux formes sont acceptées, et
 * une valeur inconnue retombe sur « Toutes ».
 */
export const resolveCategoryFilter = (value?: string): string => {
  if (!value) return 'Toutes';
  const normalized = value.trim().toLowerCase();
  if (!normalized) return 'Toutes';
  return (
    STORY_CATEGORY_FILTERS.find(
      (category) =>
        category.toLowerCase() === normalized ||
        category.toLowerCase() === `${normalized}s`
    ) || 'Toutes'
  );
};

/**
 * Récupère la liste des histoires (Firestore avec fallback local instantané)
 */
export const getStories = async (): Promise<Story[]> => {
  if (isFirebaseConfigured) {
    try {
      const storiesCol = collection(db, 'stories');
      const snapshot = await getDocs(storiesCol);
      if (!snapshot.empty) {
        const stories: Story[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Omit<Story, 'id'>;
          // Les fichiers audio locaux ne sont pas stockés dans Firestore :
          // on récupère celui du catalogue local pour conserver la narration.
          const localStory = INITIAL_STORIES.find((story) => story.id === docSnap.id);
          stories.push({
            id: docSnap.id,
            ...data,
            audioUrl: data.audioUrl || localStory?.audioUrl,
          });
        });
        return stories;
      }
    } catch (e) {
      console.warn("Firestore stories fetch error, using local fallback:", e);
    }
  }
  return INITIAL_STORIES;
};

/**
 * Normalise une chaîne pour une recherche insensible à la casse et aux accents
 * (« Nzerekore » doit retrouver « Nzérékoré »).
 */
export const normalizeForSearch = (value: string): string => {
  const lower = (value || '').toLowerCase();
  if (typeof lower.normalize !== 'function') return lower;
  return lower.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Recherche avec multi-filtres (Région, Ethnie, Catégorie, Recherche texte)
 */
export const searchStories = async (
  queryText: string, 
  regionFilter?: string, 
  ethnicFilter?: string, 
  categoryFilter?: string
): Promise<Story[]> => {
  const all = await getStories();
  let results = all;

  if (queryText && queryText.trim()) {
    const q = normalizeForSearch(queryText.trim());
    const matches = (field?: string) => {
      const normalized = normalizeForSearch(field || '');
      if (normalized.includes(q)) return true;
      // Tolérance sur le pluriel : « contes » retrouve aussi « conte ».
      return q.endsWith('s') && normalized.includes(q.slice(0, -1));
    };

    results = results.filter(s => 
      matches(s.title) || 
      matches(s.content) ||
      matches(s.region) ||
      matches(s.ethnicGroup) ||
      matches(s.category)
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

  return results;
};

/**
 * Récupérer une histoire spécifique par ID
 */
export const getStoryById = async (id: string): Promise<Story | undefined> => {
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'stories', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as Omit<Story, 'id'>;
        const localStory = INITIAL_STORIES.find((story) => story.id === id);
        return {
          id: snap.id,
          ...data,
          audioUrl: data.audioUrl || localStory?.audioUrl,
        };
      }
    } catch (e) {
      console.warn("Firestore getStoryById error:", e);
    }
  }
  return INITIAL_STORIES.find(s => s.id === id);
};

/**
 * Gestion des favoris utilisateur dans Firestore
 */
export const fetchUserFavorites = async (userId: string): Promise<string[]> => {
  if (!userId) return [];

  if (isFirebaseConfigured && !userId.startsWith('local_')) {
    try {
      const favsCol = collection(db, 'favorites');
      const q = query(favsCol, where('userId', '==', userId));
      const snap = await getDocs(q);
      const ids: string[] = [];
      snap.forEach((favoriteDoc) => {
        ids.push(favoriteDoc.data().storyId);
      });
      await writeLocalFavorites(userId, ids);
      return ids;
    } catch (e) {
      console.warn("Fetch favorites error, using local cache:", e);
    }
  }
  return readLocalFavorites(userId);
};

export const toggleFavoriteRecord = async (userId: string, storyId: string, currentFavs: string[]): Promise<string[]> => {
  const isFav = currentFavs.includes(storyId);
  const updatedFavs = isFav ? currentFavs.filter(id => id !== storyId) : [...currentFavs, storyId];

  if (isFirebaseConfigured && userId && !userId.startsWith('local_')) {
    try {
      const favDocRef = doc(db, 'favorites', `${userId}_${storyId}`);
      if (isFav) {
        await deleteDoc(favDocRef);
      } else {
        await setDoc(favDocRef, {
          userId,
          storyId,
          createdAt: serverTimestamp(),
        });
      }
    } catch (e) {
      console.error("Error updating favorite in Firestore:", e);
    }
  }

  // Cache local systématique : les favoris restent visibles hors connexion.
  await writeLocalFavorites(userId, updatedFavs);

  return updatedFavs;
};

/**
 * Alimentation initiale (Seed) de Firestore avec les récits culturels authentiques de Guinée.
 * Seuls les récits absents sont ajoutés : un contenu existant (même modifié par un
 * administrateur) n'est jamais écrasé.
 */
export const seedInitialStoriesToFirestore = async (): Promise<void> => {
  if (!isFirebaseConfigured) return;
  try {
    const storiesCol = collection(db, 'stories');
    const existing = await getDocs(storiesCol);
    const existingIds = new Set<string>();
    existing.forEach((docSnap) => existingIds.add(docSnap.id));

    const missingStories = INITIAL_STORIES.filter((story) => !existingIds.has(story.id));
    if (missingStories.length === 0) return;

    for (const story of missingStories) {
      const { id, ...data } = story;
      const cleanData = {
        ...data,
        audioUrl: typeof data.audioUrl === 'string' ? data.audioUrl : null,
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'stories', id), cleanData, { merge: true });
    }
  } catch (e) {
    console.error("Error seeding stories to Firestore:", e);
  }
};
