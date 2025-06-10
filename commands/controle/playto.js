const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");
const { requireOwner } = require("../../utils/ownerCheck.js");




const activities = ['PLAYING', 'WATCHING', 'LISTENING', 'COMPETING'];

module.exports = {
  name: 'playto',
  description: 'Change l\'activité du bot',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    if (args.length < 2) {
      return message.reply(`Veuillez spécifier un type d'activité et un nom. Types disponibles : ${activities.join(', ')}`);
    }

    const type = args[0].toUpperCase();
    if (!activities.includes(type)) {
      return message.reply(`Type d'activité invalide. Types disponibles : ${activities.join(', ')}`);
    }

    const name = args.slice(1).join(' ');
    const configPath = path.join(__dirname, '../../data/config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    config.bot.activity = {
      type: type,
      name: name
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await client.user.setActivity(name, { type: type });
    message.reply(`L'activité du bot a été changée en : ${type} ${name}`);
  }
}; 