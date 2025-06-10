const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");
const { requireOwner } = require("../../utils/ownerCheck.js");




const languages = ['fr', 'en', 'es', 'de', 'it'];

module.exports = {
  name: 'setlang',
  description: 'Change la langue du bot',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    if (!args[0]) {
      return message.reply(`Veuillez spécifier une langue. Langues disponibles : ${languages.join(', ')}`);
    }

    const lang = args[0].toLowerCase();
    if (!languages.includes(lang)) {
      return message.reply(`Langue invalide. Langues disponibles : ${languages.join(', ')}`);
    }

    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    config.language = lang;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    message.reply(`La langue du bot a été changée en : ${lang}`);
  }
};
