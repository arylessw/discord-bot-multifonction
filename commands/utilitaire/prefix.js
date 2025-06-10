const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'prefix',
  description: 'Change le préfixe du bot',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('Vous n\'avez pas la permission de changer le préfixe.');
    }

    if (!args[0]) {
      return message.reply(`Le préfixe actuel est: \`${client.prefix}\``);
    }

    const newPrefix = args[0];
    if (newPrefix.length > 5) {
      return message.reply('Le préfixe ne peut pas dépasser 5 caractères.');
    }

    const configPath = path.join(__dirname, '../../data/config.json');
    let config = {};
    
    try {
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }

      if (!config[message.guild.id]) {
        config[message.guild.id] = {};
      }

      config[message.guild.id].prefix = newPrefix;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      client.prefix = newPrefix;

      const embed = {
        title: 'Préfixe modifié',
        description: `Le préfixe a été changé en: \`${newPrefix}\``,
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors du changement du préfixe.');
    }
  }
}; 