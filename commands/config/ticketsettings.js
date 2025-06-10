const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'ticketsettings',
  description: 'Configurer le système de tickets',
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
          tickets: {
            enabled: false,
            category: null,
            supportRole: null,
            logChannel: null,
            ticketMessage: 'Pour créer un ticket, cliquez sur le bouton ci-dessous.',
            ticketName: 'ticket-{user}',
            maxTickets: 1
          }
        };
      }

      if (!config[message.guild.id].tickets) {
        config[message.guild.id].tickets = {
          enabled: false,
          category: null,
          supportRole: null,
          logChannel: null,
          ticketMessage: 'Pour créer un ticket, cliquez sur le bouton ci-dessous.',
          ticketName: 'ticket-{user}',
          maxTickets: 1
        };
      }

      if (!args[0]) {
        const currentCategory = config[message.guild.id].tickets.category 
          ? `<#${config[message.guild.id].tickets.category}>` 
          : 'Non configuré';
        const currentRole = config[message.guild.id].tickets.supportRole 
          ? `<@&${config[message.guild.id].tickets.supportRole}>` 
          : 'Non configuré';
        const currentLogChannel = config[message.guild.id].tickets.logChannel 
          ? `<#${config[message.guild.id].tickets.logChannel}>` 
          : 'Non configuré';

        return message.reply(
          'Configuration actuelle des tickets:\n' +
          `Activé: ${config[message.guild.id].tickets.enabled ? '✅' : '❌'}\n` +
          `Catégorie: ${currentCategory}\n` +
          `Rôle support: ${currentRole}\n` +
          `Canal de logs: ${currentLogChannel}\n` +
          `Message: ${config[message.guild.id].tickets.ticketMessage}\n` +
          `Format du nom: ${config[message.guild.id].tickets.ticketName}\n` +
          `Tickets max par utilisateur: ${config[message.guild.id].tickets.maxTickets}\n\n` +
          'Commandes disponibles:\n' +
          '`ticketsettings enable` - Activer le système de tickets\n' +
          '`ticketsettings disable` - Désactiver le système de tickets\n' +
          '`ticketsettings category #catégorie` - Définir la catégorie des tickets\n' +
          '`ticketsettings role @rôle` - Définir le rôle support\n' +
          '`ticketsettings log #canal` - Définir le canal de logs\n' +
          '`ticketsettings message <message>` - Définir le message de création\n' +
          '`ticketsettings name <format>` - Définir le format du nom (variables: {user}, {id})\n' +
          '`ticketsettings max <nombre>` - Définir le nombre max de tickets par utilisateur'
        );
      }

      const subCommand = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      switch (subCommand) {
        case 'enable':
          config[message.guild.id].tickets.enabled = true;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le système de tickets a été activé.');
          break;

        case 'disable':
          config[message.guild.id].tickets.enabled = false;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le système de tickets a été désactivé.');
          break;

        case 'category':
          const category = message.mentions.channels.first();
          if (!category || category.type !== 'GUILD_CATEGORY') {
            return message.reply('Veuillez mentionner une catégorie valide.');
          }
          config[message.guild.id].tickets.category = category.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La catégorie des tickets a été définie sur ${category.name}`);
          break;

        case 'role':
          const role = message.mentions.roles.first();
          if (!role) {
            return message.reply('Veuillez mentionner un rôle valide.');
          }
          config[message.guild.id].tickets.supportRole = role.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le rôle support a été défini sur ${role.name}`);
          break;

        case 'log':
          const logChannel = message.mentions.channels.first();
          if (!logChannel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          config[message.guild.id].tickets.logChannel = logChannel.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal de logs a été défini sur ${logChannel.name}`);
          break;

        case 'message':
          if (!value) {
            return message.reply('Veuillez spécifier un message.');
          }
          config[message.guild.id].tickets.ticketMessage = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le message de création a été mis à jour.');
          break;

        case 'name':
          if (!value) {
            return message.reply('Veuillez spécifier un format de nom.');
          }
          config[message.guild.id].tickets.ticketName = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le format du nom a été mis à jour.');
          break;

        case 'max':
          const maxTickets = parseInt(value);
          if (isNaN(maxTickets) || maxTickets < 1) {
            return message.reply('Le nombre maximum de tickets doit être un nombre supérieur à 0.');
          }
          config[message.guild.id].tickets.maxTickets = maxTickets;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le nombre maximum de tickets par utilisateur a été défini sur ${maxTickets}`);
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des tickets:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
};
