const fs = require("fs");
const path = require("path");
const { requireOwner } = require("../../utils/ownerCheck.js");

module.exports = {
  name: 'bl',
  description: 'Blacklist un utilisateur du bot',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    if (!args[0]) {
      return message.reply('Veuillez mentionner un utilisateur ou fournir son ID.');
    }

    const userId = args[0].replace(/[<@!>]/g, '');
    const user = await client.users.fetch(userId).catch(() => null);
    
    if (!user) {
      return message.reply('Utilisateur non trouvé.');
    }

    const blacklistPath = path.join(__dirname, '../../data/blacklist.json');
    const blacklist = JSON.parse(fs.readFileSync(blacklistPath, 'utf8'));

    if (blacklist.users.includes(userId)) {
      return message.reply('Cet utilisateur est déjà blacklisté.');
    }

    blacklist.users.push(userId);
    fs.writeFileSync(blacklistPath, JSON.stringify(blacklist, null, 2));

    message.reply(`${user.tag} a été blacklisté du bot.`);
  }
}; 