function formatDuration(seconds) {
  // Vérifier que l'entrée est un nombre valide
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
    return "00:00:00";
  }

  // Calculer les heures, minutes et secondes
  const hours = Math.floor(seconds / 3600);
  const remainingSeconds = seconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const secs = Math.floor(remainingSeconds % 60);

  // Formater chaque composant avec un zéro initial si nécessaire
  const formattedHours = hours.toString().padStart(3, ' ');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = secs.toString().padStart(2, '0');

  // Retourner la chaîne formatée
  return `${formattedHours}<b>h</b>${formattedMinutes}m${formattedSeconds}s`;
}

export {formatDuration}