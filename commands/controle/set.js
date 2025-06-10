const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");
const { requireOwner } = require("../../utils/ownerCheck.js");




module.exports = {
  name: 'set',
  description: 'Configure le nom du bot',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    if (!args[0]) {
      return message.reply('Veuillez spécifier un nouveau nom pour le bot.');
    }

    const newName = args.join(' ');
    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    config.bot.name = newName;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await client.user.setUsername(newName);
    message.reply(`Le nom du bot a été changé en : ${newName}`);
  }
}; 