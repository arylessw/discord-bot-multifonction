const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");
const { requireOwner } = require("../../utils/ownerCheck.js");




const themes = ['default', 'dark', 'light', 'colorful', 'minimal'];

module.exports = {
  name: 'theme',
  description: 'Change le thème du bot',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    if (!args[0]) {
      return message.reply(`Veuillez spécifier un thème. Thèmes disponibles : ${themes.join(', ')}`);
    }

    const theme = args[0].toLowerCase();
    if (!themes.includes(theme)) {
      return message.reply(`Thème invalide. Thèmes disponibles : ${themes.join(', ')}`);
    }

    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    config.bot.theme = theme;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    message.reply(`Le thème du bot a été changé en : ${theme}`);
  }
}; 