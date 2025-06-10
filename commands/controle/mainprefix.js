const fs = require("fs");
const path = require("path");
const { requireOwner } = require("../../utils/ownerCheck.js");

module.exports = {
  name: 'mainprefix',
  description: 'Change le préfixe par défaut du bot',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    if (!args[0]) {
      return message.reply('Veuillez spécifier un nouveau préfixe par défaut.');
    }

    const newPrefix = args[0];
    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    config.prefixes.default = newPrefix;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    message.reply(`Le préfixe par défaut du bot a été changé en : ${newPrefix}`);
  }
};
