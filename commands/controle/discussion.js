const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'discussion',
  description: 'Gérer les discussions',
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
          }
        };
      }

      if (!config[message.guild.id].discussions) {
        config[message.guild.id].discussions = {
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
        };
      }

      if (!args[0]) {
        const category = config[message.guild.id].discussions.category 
          ? `<#${config[message.guild.id].discussions.category}>` 
          : 'Non configuré';
        const logChannel = config[message.guild.id].discussions.logChannel 
          ? `<#${config[message.guild.id].discussions.logChannel}>` 
          : 'Non configuré';
        const roles = config[message.guild.id].discussions.staffRoles
          .map(r => `<@&${r}>`)
          .join(', ') || 'Aucun rôle configuré';

        return message.reply(
          'Configuration actuelle des discussions:\n' +
          `Activé: ${config[message.guild.id].discussions.enabled ? '✅' : '❌'}\n` +
          `Catégorie: ${category}\n` +
          `Canal de logs: ${logChannel}\n` +
          `Rôles staff: ${roles}\n` +
          `Message de bienvenue: ${config[message.guild.id].discussions.welcomeMessage}\n` +
          `Message de fermeture: ${config[message.guild.id].discussions.closeMessage}\n` +
          `Couleur de l'embed: ${config[message.guild.id].discussions.embed.color}\n` +
          `Titre de l'embed: ${config[message.guild.id].discussions.embed.title}\n` +
          `Pied de page: ${config[message.guild.id].discussions.embed.footer}\n\n` +
          'Commandes disponibles:\n' +
          '`discussion enable` - Activer les discussions\n' +
          '`discussion disable` - Désactiver les discussions\n' +
          '`discussion category <#category>` - Définir la catégorie\n' +
          '`discussion logchannel <#channel>` - Définir le canal de logs\n' +
          '`discussion addrole <@role>` - Ajouter un rôle staff\n' +
          '`discussion removerole <@role>` - Supprimer un rôle staff\n' +
          '`discussion welcome <message>` - Définir le message de bienvenue\n' +
          '`discussion close <message>` - Définir le message de fermeture\n' +
          '`discussion color <couleur>` - Définir la couleur de l\'embed\n' +
          '`discussion title <titre>` - Définir le titre de l\'embed\n' +
          '`discussion footer <texte>` - Définir le pied de page'
        );
      }

      const subCommand = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      switch (subCommand) {
        case 'enable':
          config[message.guild.id].discussions.enabled = true;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Les discussions ont été activées.');
          break;

        case 'disable':
          config[message.guild.id].discussions.enabled = false;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Les discussions ont été désactivées.');
          break;

        case 'category':
          const category = message.mentions.channels.first();
          if (!category || category.type !== 'GUILD_CATEGORY') {
            return message.reply('Veuillez mentionner une catégorie valide.');
          }
          config[message.guild.id].discussions.category = category.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La catégorie a été définie sur ${category.name}`);
          break;

        case 'logchannel':
          const logChannel = message.mentions.channels.first();
          if (!logChannel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          config[message.guild.id].discussions.logChannel = logChannel.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal de logs a été défini sur ${logChannel.name}`);
          break;

        case 'addrole':
          const roleToAdd = message.mentions.roles.first();
          if (!roleToAdd) {
            return message.reply('Veuillez mentionner un rôle valide.');
          }
          if (config[message.guild.id].discussions.staffRoles.includes(roleToAdd.id)) {
            return message.reply('Ce rôle est déjà dans la liste des rôles staff.');
          }
          config[message.guild.id].discussions.staffRoles.push(roleToAdd.id);
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le rôle ${roleToAdd.name} a été ajouté à la liste des rôles staff.`);
          break;

        case 'removerole':
          const roleToRemove = message.mentions.roles.first();
          if (!roleToRemove) {
            return message.reply('Veuillez mentionner un rôle valide.');
          }
          const index = config[message.guild.id].discussions.staffRoles.indexOf(roleToRemove.id);
          if (index === -1) {
            return message.reply('Ce rôle n\'est pas dans la liste des rôles staff.');
          }
          config[message.guild.id].discussions.staffRoles.splice(index, 1);
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le rôle ${roleToRemove.name} a été retiré de la liste des rôles staff.`);
          break;

        case 'welcome':
          if (!value) {
            return message.reply('Veuillez spécifier un message.');
          }
          config[message.guild.id].discussions.welcomeMessage = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le message de bienvenue a été mis à jour.');
          break;

        case 'close':
          if (!value) {
            return message.reply('Veuillez spécifier un message.');
          }
          config[message.guild.id].discussions.closeMessage = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le message de fermeture a été mis à jour.');
          break;

        case 'color':
          if (!value.match(/^#[0-9A-Fa-f]{6}$/)) {
            return message.reply('Veuillez spécifier une couleur valide au format hexadécimal (ex: #00ff00).');
          }
          config[message.guild.id].discussions.embed.color = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La couleur de l'embed a été définie sur ${value}`);
          break;

        case 'title':
          if (!value) {
            return message.reply('Veuillez spécifier un titre.');
          }
          config[message.guild.id].discussions.embed.title = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le titre de l\'embed a été mis à jour.');
          break;

        case 'footer':
          if (!value) {
            return message.reply('Veuillez spécifier un texte.');
          }
          config[message.guild.id].discussions.embed.footer = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le pied de page de l\'embed a été mis à jour.');
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des discussions:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
}; 