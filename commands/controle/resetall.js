const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'resetall',
  description: 'Réinitialiser la configuration de tous les serveurs',
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
          '`resetall all` - Réinitialiser toute la configuration\n' +
          '`resetall prefix` - Réinitialiser le préfixe\n' +
          '`resetall language` - Réinitialiser la langue\n' +
          '`resetall timezone` - Réinitialiser le fuseau horaire\n' +
          '`resetall embed` - Réinitialiser les paramètres d\'embed\n' +
          '`resetall mp` - Réinitialiser les paramètres des messages privés\n' +
          '`resetall discussions` - Réinitialiser les paramètres des discussions\n' +
          '`resetall aliases` - Réinitialiser les alias\n' +
          '`resetall types` - Réinitialiser les types de commandes'
        );
      }

      const setting = args[0].toLowerCase();

      // Demander confirmation
      const confirmMessage = await message.reply(
        `Êtes-vous sûr de vouloir réinitialiser ${setting === 'all' ? 'toute la configuration' : `le paramètre "${setting}"`} pour tous les serveurs ?\n` +
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
          },
          mp: {
            enabled: false,
            logChannel: null,
            staffRoles: [],
            welcomeMessage: 'Bienvenue ! Comment puis-je vous aider ?',
            closeMessage: 'Cette conversation est maintenant fermée.',
            embed: {
              color: '#00ff00',
              title: 'Nouveau message privé',
              footer: 'Système de messages privés'
            }
          },
          discussions: {
            enabled: false,
            category: null,
            logChannel: null,
            staffRoles: [],
            welcomeMessage: 'Bienvenue dans la discussion !',
            closeMessage: 'Cette discussion est maintenant fermée.',
            embed: {
              color: '#00ff00',
              title: 'Nouvelle discussion',
              footer: 'Système de discussions'
            }
          },
          aliases: {},
          commandTypes: {}
        };

        // Réinitialiser la configuration pour tous les serveurs
        for (const guildId in config) {
          if (setting === 'all') {
            config[guildId] = defaultConfig;
          } else {
            switch (setting) {
              case 'prefix':
                config[guildId].prefix = defaultConfig.prefix;
                break;
              case 'language':
                config[guildId].language = defaultConfig.language;
                break;
              case 'timezone':
                config[guildId].timezone = defaultConfig.timezone;
                break;
              case 'embed':
                config[guildId].embed = defaultConfig.embed;
                break;
              case 'mp':
                config[guildId].mp = defaultConfig.mp;
                break;
              case 'discussions':
                config[guildId].discussions = defaultConfig.discussions;
                break;
              case 'aliases':
                config[guildId].aliases = defaultConfig.aliases;
                break;
              case 'types':
                config[guildId].commandTypes = defaultConfig.commandTypes;
                break;
              default:
                return message.reply('Paramètre invalide. Utilisez la commande sans arguments pour voir la liste des paramètres disponibles.');
            }
          }
        }

        fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
        message.reply(
          setting === 'all' 
            ? '✅ Toute la configuration a été réinitialisée aux valeurs par défaut pour tous les serveurs.'
            : `✅ Le paramètre "${setting}" a été réinitialisé à sa valeur par défaut pour tous les serveurs.`
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
