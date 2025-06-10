const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'alias',
  description: 'Gérer les alias de commandes',
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
          aliases: {}
        };
      }

      if (!config[message.guild.id].aliases) {
        config[message.guild.id].aliases = {};
      }

      if (!args[0]) {
        const aliases = Object.entries(config[message.guild.id].aliases)
          .map(([alias, command]) => `${alias} -> ${command}`)
          .join('\n');

        return message.reply(
          'Alias actuels:\n' +
          (aliases || 'Aucun alias configuré') + '\n\n' +
          'Commandes disponibles:\n' +
          '`alias add <alias> <commande>` - Ajouter un alias\n' +
          '`alias remove <alias>` - Supprimer un alias\n' +
          '`alias list` - Lister les alias'
        );
      }

      const subCommand = args[0].toLowerCase();
      const alias = args[1]?.toLowerCase();
      const command = args[2]?.toLowerCase();

      switch (subCommand) {
        case 'add':
          if (!alias || !command) {
            return message.reply('Veuillez spécifier un alias et une commande.');
          }
          if (config[message.guild.id].aliases[alias]) {
            return message.reply('Cet alias existe déjà.');
          }
          config[message.guild.id].aliases[alias] = command;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ L'alias "${alias}" a été ajouté pour la commande "${command}".`);
          break;

        case 'remove':
          if (!alias) {
            return message.reply('Veuillez spécifier un alias.');
          }
          if (!config[message.guild.id].aliases[alias]) {
            return message.reply('Cet alias n\'existe pas.');
          }
          delete config[message.guild.id].aliases[alias];
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ L'alias "${alias}" a été supprimé.`);
          break;

        case 'list':
          const aliasList = Object.entries(config[message.guild.id].aliases)
            .map(([alias, command]) => `${alias} -> ${command}`)
            .join('\n');
          message.reply(
            'Liste des alias:\n' +
            (aliasList || 'Aucun alias configuré')
          );
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des alias:', error);
      message.reply('❌ Une erreur est survenue lors de la gestion des alias.');
    }
  }
};
