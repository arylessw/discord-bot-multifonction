const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'changeall',
  description: 'Modifier la configuration pour tous les serveurs',
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
          '`changeall prefix <préfixe>` - Changer le préfixe pour tous les serveurs\n' +
          '`changeall language <langue>` - Changer la langue pour tous les serveurs\n' +
          '`changeall timezone <fuseau>` - Changer le fuseau horaire pour tous les serveurs\n' +
          '`changeall color <couleur>` - Changer la couleur de l\'embed pour tous les serveurs\n' +
          '`changeall footer <texte>` - Changer le pied de page pour tous les serveurs'
        );
      }

      const setting = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      // Vérifier si la valeur est valide avant de l'appliquer
      switch (setting) {
        case 'prefix':
          if (!value) {
            return message.reply('Veuillez spécifier un préfixe.');
          }
          break;

        case 'language':
          if (!value) {
            return message.reply('Veuillez spécifier une langue.');
          }
          const validLanguages = ['fr', 'en', 'es', 'de', 'it'];
          if (!validLanguages.includes(value.toLowerCase())) {
            return message.reply(`Langue invalide. Langues disponibles: ${validLanguages.join(', ')}`);
          }
          break;

        case 'timezone':
          if (!value) {
            return message.reply('Veuillez spécifier un fuseau horaire.');
          }
          try {
            Intl.DateTimeFormat(undefined, { timeZone: value });
          } catch (error) {
            return message.reply('Fuseau horaire invalide. Exemple: Europe/Paris, America/New_York');
          }
          break;

        case 'color':
          if (!value) {
            return message.reply('Veuillez spécifier une couleur.');
          }
          if (!value.match(/^#[0-9A-Fa-f]{6}$/)) {
            return message.reply('Veuillez spécifier une couleur valide au format hexadécimal (ex: #00ff00).');
          }
          break;

        case 'footer':
          if (!value) {
            return message.reply('Veuillez spécifier un texte.');
          }
          break;

        default:
          return message.reply('Paramètre invalide. Utilisez la commande sans arguments pour voir la liste des paramètres disponibles.');
      }

      // Demander confirmation
      const confirmMessage = await message.reply(
        `Êtes-vous sûr de vouloir changer le paramètre "${setting}" pour "${value}" sur tous les serveurs ?\n` +
        'Répondez avec "oui" pour confirmer.'
      );

      try {
        const collected = await message.channel.awaitMessages({
          filter: m => m.author.id === message.author.id && m.content.toLowerCase() === 'oui',
          max: 1,
          time: 30000,
          errors: ['time']
        });

        // Appliquer le changement à tous les serveurs
        for (const guildId in config) {
          if (!config[guildId].embed) {
            config[guildId].embed = {};
          }

          switch (setting) {
            case 'prefix':
              config[guildId].prefix = value;
              break;
            case 'language':
              config[guildId].language = value.toLowerCase();
              break;
            case 'timezone':
              config[guildId].timezone = value;
              break;
            case 'color':
              config[guildId].embed.color = value;
              break;
            case 'footer':
              config[guildId].embed.footer = value;
              break;
          }
        }

        fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
        message.reply(`✅ Le paramètre "${setting}" a été changé pour "${value}" sur tous les serveurs.`);
      } catch (error) {
        message.reply('❌ Opération annulée ou délai dépassé.');
      }
    } catch (error) {
      console.error('Erreur lors de la modification de la configuration:', error);
      message.reply('❌ Une erreur est survenue lors de la modification de la configuration.');
    }
  }
};
