const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");
const { requireOwner } = require("../../utils/ownerCheck.js");




module.exports = {
  name: 'langcustom',
  description: 'Personnalise les traductions du bot',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    if (args.length < 2) {
      return message.reply('Veuillez spécifier une clé de traduction et sa valeur.');
    }

    const key = args[0];
    const value = args.slice(1).join(' ');

    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    if (!config.translations) {
      config.translations = {};
    }

    if (!config.translations[config.language]) {
      config.translations[config.language] = {};
    }

    config.translations[config.language][key] = value;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    message.reply(`La traduction "${key}" a été mise à jour en : ${value}`);
  }
};
