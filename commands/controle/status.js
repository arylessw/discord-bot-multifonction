const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");
const { requireOwner } = require("../../utils/ownerCheck.js");




const statuses = ['online', 'idle', 'dnd', 'invisible'];

module.exports = {
  name: 'status',
  description: 'Change le statut du bot',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    if (!args[0]) {
      return message.reply(`Veuillez spécifier un statut. Statuts disponibles : ${statuses.join(', ')}`);
    }

    const status = args[0].toLowerCase();
    if (!statuses.includes(status)) {
      return message.reply(`Statut invalide. Statuts disponibles : ${statuses.join(', ')}`);
    }

    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    config.bot.status = status;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await client.user.setStatus(status);
    message.reply(`Le statut du bot a été changé en : ${status}`);
  }
}; 