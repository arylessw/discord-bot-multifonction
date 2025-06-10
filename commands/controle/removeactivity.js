const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");
const { requireOwner } = require("../../utils/ownerCheck.js");




module.exports = {
  name: 'removeactivity',
  description: 'Supprime l\'activité du bot',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    config.bot.activity = {
      type: 'PLAYING',
      name: 'Discord'
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await client.user.setActivity(null);
    message.reply('L\'activité du bot a été supprimée.');
  }
}; 