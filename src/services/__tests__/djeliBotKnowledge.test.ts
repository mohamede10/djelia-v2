import {
  buildSystemPrompt,
  normalize,
  retrieveStories,
  tokenize,
} from '../djeliBotKnowledge';

describe('djeliBotKnowledge', () => {
  it('normalise les accents et la casse', () => {
    expect(normalize('Soundiata Keïta')).toBe('soundiata keita');
    expect(normalize('Le Souffle du Nimba')).toBe('le souffle du nimba');
  });

  it('ignore les mots vides et les termes trop courts', () => {
    expect(tokenize("Raconte-moi l'histoire de Soundiata, s'il te plaît")).toEqual([
      'soundiata',
      'plait',
    ]);
  });

  it('retrouve Soundiata Keïta en tête des résultats', () => {
    const matches = retrieveStories('Soundiata Keïta');

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].id).toBe('1');
    expect(matches[0].title).toContain('Soundiata');
  });

  it('retrouve le masque Nimba', () => {
    const matches = retrieveStories('le masque Nimba');

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].id).toBe('3');
  });

  it('retrouve un récit par sa région ou son groupe ethnique', () => {
    const matches = retrieveStories('coutume baga');

    expect(matches.some((match) => match.id === '3')).toBe(true);
  });

  it('renvoie une liste vide pour une question sans terme significatif', () => {
    expect(retrieveStories('')).toEqual([]);
    expect(retrieveStories('   ')).toEqual([]);
    expect(retrieveStories('qui es-tu ?')).toEqual([]);
  });

  it('respecte la limite demandée', () => {
    const matches = retrieveStories('Guinée', { limit: 2 });
    expect(matches.length).toBeLessThanOrEqual(2);
  });

  it('construit un prompt qui contient le prénom et les récits trouvés', () => {
    const matches = retrieveStories('Soundiata Keïta');
    const prompt = buildSystemPrompt('Aminata', matches);

    expect(prompt).toContain('Aminata');
    expect(prompt).toContain('Soundiata');
    expect(prompt).toContain('Récits pertinents');
    expect(prompt).toContain('Réponds toujours en français');
  });

  it('reste valide quand aucun récit ne correspond', () => {
    const prompt = buildSystemPrompt(undefined, []);

    expect(prompt).toContain('cher ami');
    expect(prompt).toContain('Aucun récit du catalogue');
    expect(prompt).toContain('Aucune source externe');
  });

  it('intègre les sources externes Wikipédia au prompt', () => {
    const prompt = buildSystemPrompt('Aminata', [], [
      {
        title: 'Empire du Mali',
        url: 'https://fr.wikipedia.org/wiki/Empire_du_Mali',
        excerpt: 'Empire ouest-africain fondé au XIIIe siècle par Soundiata Keïta.',
      },
    ]);

    expect(prompt).toContain('Sources externes');
    expect(prompt).toContain('Empire du Mali');
    expect(prompt).toContain('fr.wikipedia.org');
    expect(prompt).toContain('selon Wikipédia');
  });
});
