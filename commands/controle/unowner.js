const fs = require("fs");
const path = require("path");
const { requireOwner } = require("../../utils/ownerCheck.js");

module.exports = {
  name: 'unowner',
  description: 'Retire un owner du bot',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

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

    if (!owners.owners.includes(userId)) {
      return message.reply('Cet utilisateur n\'est pas owner du bot.');
    }

    owners.owners = owners.owners.filter(id => id !== userId);
    fs.writeFileSync(ownersPath, JSON.stringify(owners, null, 2));

    message.reply(`${user.tag} a été retiré des owners du bot.`);
  }
}; 