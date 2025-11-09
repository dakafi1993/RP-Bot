// Automatická progrese říší podle levelu
export async function checkRealmProgression(db, userId, currentLevel, currentRealm) {
  const realmThresholds = {
    'ancient': { min: 1, max: 19, next: 'medieval' },
    'medieval': { min: 20, max: 39, next: 'renaissance' },
    'renaissance': { min: 40, max: 59, next: 'modern' },
    'modern': { min: 60, max: 79, next: 'futuristic' },
    'futuristic': { min: 80, max: 999, next: null }
  };

  // Najdi správnou říši pro current level
  let correctRealm = 'ancient';
  for (const [realm, data] of Object.entries(realmThresholds)) {
    if (currentLevel >= data.min && currentLevel <= data.max) {
      correctRealm = realm;
      break;
    }
  }

  // Pokud je nová říše jiná než současná, updateuj
  if (correctRealm !== currentRealm) {
    await db.query(
      'UPDATE users SET realm = $1, century = $2 WHERE id = $3',
      [correctRealm, 1, userId]
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
      newRealm: correctRealm,
      emoji: realmEmojis[correctRealm],
      name: realmNames[correctRealm]
    };
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
