// Automatická progrese říší podle levelu
export async function checkRealmProgression(db, userId, currentLevel, currentRealm) {
  const realmThresholds = {
    'ancient': { min: 1, max: 19, next: 'medieval' },
    'medieval': { min: 20, max: 39, next: 'renaissance' },
    'renaissance': { min: 40, max: 59, next: 'modern' },
    'modern': { min: 60, max: 79, next: 'futuristic' },
    'futuristic': { min: 80, max: 999, next: null }
  };

  const currentRealmData = realmThresholds[currentRealm];
  
  // Kontrola, zda hráč má vyšší level než jeho současná říše
  if (currentLevel > currentRealmData.max && currentRealmData.next) {
    // Najdi správnou říši pro current level
    let newRealm = currentRealm;
    for (const [realm, data] of Object.entries(realmThresholds)) {
      if (currentLevel >= data.min && currentLevel <= data.max) {
        newRealm = realm;
        break;
      }
    }

    // Pokud je nová říše jiná než současná, updateuj
    if (newRealm !== currentRealm) {
      await db.query(
        'UPDATE users SET realm = $1, century = $2 WHERE id = $3',
        [newRealm, 1, userId]
      );
      
      const realmEmojis = {
        'ancient': '🏛️',
        'medieval': '🏰',
        'renaissance': '🎨',
        'modern': '🏙️',
        'futuristic': '🚀'
      };

      const realmNames = {
        'ancient': 'Antika',
        'medieval': 'Středověk',
        'renaissance': 'Renesance',
        'modern': 'Moderna',
        'futuristic': 'Budoucnost'
      };

      return {
        advanced: true,
        newRealm: newRealm,
        emoji: realmEmojis[newRealm],
        name: realmNames[newRealm]
      };
    }
  }

  return { advanced: false };
}

export function getRealmByLevel(level) {
  if (level >= 80) return 'futuristic';
  if (level >= 60) return 'modern';
  if (level >= 40) return 'renaissance';
  if (level >= 20) return 'medieval';
  return 'ancient';
}
