const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'prefix',
  description: 'Définir le préfixe du bot pour ce serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const configDir = path.join(__dirname, '../../config');
    const configFile = path.join(configDir, 'server_config.json');

    try {
      // Créer le dossier config s'il n'existe pas
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      // Charger la configuration existante
      let config = {};
      if (fs.existsSync(configFile)) {
        config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      }

      // Initialiser la configuration du serveur si elle n'existe pas
      if (!config[message.guild.id]) {
        config[message.guild.id] = {
          prefix: '!'
        };
      }

      if (!args[0]) {
        return message.reply(`Le préfixe actuel est : \`${config[message.guild.id].prefix}\``);
      }

      const newPrefix = args[0];
      if (newPrefix.length > 5) {
        return message.reply('Le préfixe ne peut pas dépasser 5 caractères.');
      }

      config[message.guild.id].prefix = newPrefix;
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

      message.reply(`✅ Le préfixe a été changé en : \`${newPrefix}\``);
    } catch (error) {
      console.error('Erreur lors de la modification du préfixe:', error);
      message.reply('❌ Une erreur est survenue lors de la modification du préfixe.');
    }
  }
};
