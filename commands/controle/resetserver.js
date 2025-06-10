const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'resetserver',
  description: 'Réinitialiser la configuration du serveur actuel',
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
          '`resetserver all` - Réinitialiser toute la configuration\n' +
          '`resetserver prefix` - Réinitialiser le préfixe\n' +
          '`resetserver language` - Réinitialiser la langue\n' +
          '`resetserver timezone` - Réinitialiser le fuseau horaire\n' +
          '`resetserver embed` - Réinitialiser les paramètres d\'embed\n' +
          '`resetserver mp` - Réinitialiser les paramètres des messages privés\n' +
          '`resetserver discussions` - Réinitialiser les paramètres des discussions\n' +
          '`resetserver aliases` - Réinitialiser les alias\n' +
          '`resetserver types` - Réinitialiser les types de commandes'
        );
      }

      const setting = args[0].toLowerCase();

      // Demander confirmation
      const confirmMessage = await message.reply(
        `Êtes-vous sûr de vouloir réinitialiser ${setting === 'all' ? 'toute la configuration' : `le paramètre "${setting}"`} pour ce serveur ?\n` +
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

        // Réinitialiser la configuration pour le serveur actuel
        if (setting === 'all') {
          config[message.guild.id] = defaultConfig;
        } else {
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
            case 'mp':
              config[message.guild.id].mp = defaultConfig.mp;
              break;
            case 'discussions':
              config[message.guild.id].discussions = defaultConfig.discussions;
              break;
            case 'aliases':
              config[message.guild.id].aliases = defaultConfig.aliases;
              break;
            case 'types':
              config[message.guild.id].commandTypes = defaultConfig.commandTypes;
              break;
            default:
              return message.reply('Paramètre invalide. Utilisez la commande sans arguments pour voir la liste des paramètres disponibles.');
          }
        }

        fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
        message.reply(
          setting === 'all' 
            ? '✅ Toute la configuration a été réinitialisée aux valeurs par défaut pour ce serveur.'
            : `✅ Le paramètre "${setting}" a été réinitialisé à sa valeur par défaut pour ce serveur.`
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
