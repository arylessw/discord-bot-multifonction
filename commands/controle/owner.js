const fs = require("fs");
const path = require("path");
const { requireOwner } = require("../../utils/ownerCheck.js");

module.exports = {
  name: 'owner',
  description: 'Ajoute un owner au bot',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    // Vérifier si l'utilisateur est déjà owner
    const ownersPath = path.join(__dirname, '../../data/owners.json');
    const owners = JSON.parse(fs.readFileSync(ownersPath, 'utf8'));
    
    if (!args[0]) {
      return message.reply('Veuillez mentionner un utilisateur ou fournir son ID.');
    }

    const userId = args[0].replace(/[<@!>]/g, '');
    const user = await client.users.fetch(userId).catch(() => null);
    
    if (!user) {
      return message.reply('Utilisateur non trouvé.');
    }

    if (owners.owners.includes(userId)) {
      return message.reply('Cet utilisateur est déjà owner du bot.');
    }

    owners.owners.push(userId);
    fs.writeFileSync(ownersPath, JSON.stringify(owners, null, 2));

    message.reply(`${user.tag} a été ajouté comme owner du bot.`);
  }
}; 