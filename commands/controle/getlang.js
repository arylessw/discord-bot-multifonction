const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'getlang',
  description: 'Affiche la langue actuelle du bot',
  async execute(message, args, client) {
    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    message.reply(`La langue actuelle du bot est : ${config.language}`);
  }
};
