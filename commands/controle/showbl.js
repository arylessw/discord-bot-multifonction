const fs = require("fs");
const path = require("path");
const { requireOwner } = require("../../utils/ownerCheck.js");

module.exports = {
  name: 'showbl',
  description: 'Affiche la liste des utilisateurs blacklistés',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    const blacklistPath = path.join(__dirname, '../../data/blacklist.json');
    const blacklist = JSON.parse(fs.readFileSync(blacklistPath, 'utf8'));
    
    if (blacklist.users.length === 0) {
      return message.reply('Aucun utilisateur n\'est blacklisté.');
    }

    const blacklistList = await Promise.all(blacklist.users.map(async (id) => {
      const user = await client.users.fetch(id).catch(() => null);
      return user ? `${user.tag} (${id})` : `Utilisateur inconnu (${id})`;
    }));

    const embed = {
      title: 'Liste des Utilisateurs Blacklistés',
      description: blacklistList.join('\n'),
      color: 0xff0000,
      timestamp: new Date()
    };

    message.reply({ embeds: [embed] });
  }
}; 