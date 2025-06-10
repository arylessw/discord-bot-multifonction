const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'change',
  description: 'Modifier la configuration du bot',
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
          prefix: '!',
          language: 'fr',
          timezone: 'Europe/Paris',
          embed: {
            color: '#00ff00',
            footer: 'Bot de configuration'
          }
        };
      }

      if (!args[0]) {
        return message.reply(
          'Configuration actuelle:\n' +
          `Préfixe: ${config[message.guild.id].prefix}\n` +
          `Langue: ${config[message.guild.id].language}\n` +
          `Fuseau horaire: ${config[message.guild.id].timezone}\n` +
          `Couleur de l'embed: ${config[message.guild.id].embed.color}\n` +
          `Pied de page: ${config[message.guild.id].embed.footer}\n\n` +
          'Commandes disponibles:\n' +
          '`change prefix <préfixe>` - Changer le préfixe\n' +
          '`change language <langue>` - Changer la langue\n' +
          '`change timezone <fuseau>` - Changer le fuseau horaire\n' +
          '`change color <couleur>` - Changer la couleur de l\'embed\n' +
          '`change footer <texte>` - Changer le pied de page'
        );
      }

      const setting = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      switch (setting) {
        case 'prefix':
          if (!value) {
            return message.reply('Veuillez spécifier un préfixe.');
          }
          config[message.guild.id].prefix = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le préfixe a été changé pour "${value}"`);
          break;

        case 'language':
          if (!value) {
            return message.reply('Veuillez spécifier une langue.');
          }
          const validLanguages = ['fr', 'en', 'es', 'de', 'it'];
          if (!validLanguages.includes(value.toLowerCase())) {
            return message.reply(`Langue invalide. Langues disponibles: ${validLanguages.join(', ')}`);
          }
          config[message.guild.id].language = value.toLowerCase();
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La langue a été changée pour "${value}"`);
          break;

        case 'timezone':
          if (!value) {
            return message.reply('Veuillez spécifier un fuseau horaire.');
          }
          try {
            // Vérifier si le fuseau horaire est valide
            Intl.DateTimeFormat(undefined, { timeZone: value });
            config[message.guild.id].timezone = value;
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            message.reply(`✅ Le fuseau horaire a été changé pour "${value}"`);
          } catch (error) {
            message.reply('Fuseau horaire invalide. Exemple: Europe/Paris, America/New_York');
          }
          break;

        case 'color':
          if (!value) {
            return message.reply('Veuillez spécifier une couleur.');
          }
          if (!value.match(/^#[0-9A-Fa-f]{6}$/)) {
            return message.reply('Veuillez spécifier une couleur valide au format hexadécimal (ex: #00ff00).');
          }
          config[message.guild.id].embed.color = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La couleur de l'embed a été changée pour "${value}"`);
          break;

        case 'footer':
          if (!value) {
            return message.reply('Veuillez spécifier un texte.');
          }
          config[message.guild.id].embed.footer = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le pied de page a été changé pour "${value}"`);
          break;

        default:
          message.reply('Paramètre invalide. Utilisez la commande sans arguments pour voir la liste des paramètres disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la modification de la configuration:', error);
      message.reply('❌ Une erreur est survenue lors de la modification de la configuration.');
    }
  }
};
