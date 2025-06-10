const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'changereset',
  description: 'Réinitialiser la configuration du bot',
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

      if (!args[0]) {
        return message.reply(
          'Commandes disponibles:\n' +
          '`changereset all` - Réinitialiser toute la configuration\n' +
          '`changereset prefix` - Réinitialiser le préfixe\n' +
          '`changereset language` - Réinitialiser la langue\n' +
          '`changereset timezone` - Réinitialiser le fuseau horaire\n' +
          '`changereset embed` - Réinitialiser les paramètres d\'embed'
        );
      }

      const setting = args[0].toLowerCase();

      // Demander confirmation
      const confirmMessage = await message.reply(
        `Êtes-vous sûr de vouloir réinitialiser ${setting === 'all' ? 'toute la configuration' : `le paramètre "${setting}"`} ?\n` +
        'Répondez avec "oui" pour confirmer.'
      );

      try {
        const collected = await message.channel.awaitMessages({
          filter: m => m.author.id === message.author.id && m.content.toLowerCase() === 'oui',
          max: 1,
          time: 30000,
          errors: ['time']
        });

        // Valeurs par défaut
        const defaultConfig = {
          prefix: '!',
          language: 'fr',
          timezone: 'Europe/Paris',
          embed: {
            color: '#00ff00',
            footer: 'Bot de configuration'
          }
        };

        if (setting === 'all') {
          // Réinitialiser toute la configuration
          config[message.guild.id] = defaultConfig;
        } else {
          // Réinitialiser un paramètre spécifique
          if (!config[message.guild.id]) {
            config[message.guild.id] = {};
          }

          switch (setting) {
            case 'prefix':
              config[message.guild.id].prefix = defaultConfig.prefix;
              break;
            case 'language':
              config[message.guild.id].language = defaultConfig.language;
              break;
            case 'timezone':
              config[message.guild.id].timezone = defaultConfig.timezone;
              break;
            case 'embed':
              config[message.guild.id].embed = defaultConfig.embed;
              break;
            default:
              return message.reply('Paramètre invalide. Utilisez la commande sans arguments pour voir la liste des paramètres disponibles.');
          }
        }

        fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
        message.reply(
          setting === 'all' 
            ? '✅ Toute la configuration a été réinitialisée aux valeurs par défaut.'
            : `✅ Le paramètre "${setting}" a été réinitialisé à sa valeur par défaut.`
        );
      } catch (error) {
        message.reply('❌ Opération annulée ou délai dépassé.');
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation de la configuration:', error);
      message.reply('❌ Une erreur est survenue lors de la réinitialisation de la configuration.');
    }
  }
};
