const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");
const { requireOwner } = require("../../utils/ownerCheck.js");




module.exports = {
  name: 'prefix',
  description: 'Change le préfixe du bot sur un serveur',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    if (!args[0]) {
      return message.reply('Veuillez spécifier un nouveau préfixe.');
    }

    const newPrefix = args[0];
    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    if (!config.prefixes.custom[message.guild.id]) {
      config.prefixes.custom[message.guild.id] = {};
    }

    config.prefixes.custom[message.guild.id] = newPrefix;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    message.reply(`Le préfixe du bot sur ce serveur a été changé en : ${newPrefix}`);
  }
}; 