const fs = require('fs');
const path = require('path');

function isOwner(userId) {
  const ownersPath = path.join(__dirname, '../data/owners.json');
  const owners = JSON.parse(fs.readFileSync(ownersPath, 'utf8'));
  
  // Convertir l'ID utilisateur en chaîne pour la comparaison
  const userIdStr = userId.toString();
  
  // Afficher les informations de débogage
  console.log('Vérification owner:');
  console.log('- ID utilisateur:', userIdStr);
  console.log('- IDs owners:', owners.owners.map(id => id.toString()));
  
  // Vérifier si l'ID est dans la liste des owners
  return owners.owners.some(id => id.toString() === userIdStr);
}

function requireOwner(message) {
  if (!isOwner(message.author.id)) {
    message.reply('Vous devez être owner du bot pour utiliser cette commande.');
    return false;
  }
  return true;
}

module.exports = { isOwner, requireOwner }; 