const fs = require("fs");
const path = require("path");

module.exports = {
  name: 'owners',
  description: 'Affiche la liste des owners du bot',
  async execute(message, args, client) {
    const ownersPath = path.join(__dirname, '../../data/owners.json');
    const owners = JSON.parse(fs.readFileSync(ownersPath, 'utf8'));
    
    if (owners.owners.length === 0) {
      return message.reply('Aucun owner n\'est configuré pour le bot.');
    }

    const ownersList = await Promise.all(owners.owners.map(async (id) => {
      const user = await client.users.fetch(id).catch(() => null);
      return user ? `${user.tag} (${id})` : `Utilisateur inconnu (${id})`;
    }));

    const embed = {
      title: 'Owners du Bot',
      description: ownersList.join('\n'),
      color: 0x00ff00,
      timestamp: new Date()
    };

    message.reply({ embeds: [embed] });
  }
}; 