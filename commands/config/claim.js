const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'claim',
  description: 'Configurer les revendications de salons',
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
          claim: {
            enabled: false,
            channels: [],
            cooldown: 24, // heures
            message: 'Ce salon est maintenant à vous !',
            embed: {
              color: '#0099ff',
              title: 'Revendication de salon',
              footer: 'Système de revendication'
            }
          }
        };
      }

      if (!config[message.guild.id].claim) {
        config[message.guild.id].claim = {
          enabled: false,
          channels: [],
          cooldown: 24,
          message: 'Ce salon est maintenant à vous !',
          embed: {
            color: '#0099ff',
            title: 'Revendication de salon',
            footer: 'Système de revendication'
          }
        };
      }

      if (!args[0]) {
        const channels = config[message.guild.id].claim.channels
          .map(c => `<#${c}>`)
          .join(', ') || 'Aucun canal configuré';

        return message.reply(
          'Configuration actuelle des revendications:\n' +
          `Activé: ${config[message.guild.id].claim.enabled ? '✅' : '❌'}\n` +
          `Canaux: ${channels}\n` +
          `Délai d'attente: ${config[message.guild.id].claim.cooldown} heures\n` +
          `Message: ${config[message.guild.id].claim.message}\n` +
          `Couleur de l'embed: ${config[message.guild.id].claim.embed.color}\n` +
          `Titre de l'embed: ${config[message.guild.id].claim.embed.title}\n` +
          `Pied de page: ${config[message.guild.id].claim.embed.footer}\n\n` +
          'Commandes disponibles:\n' +
          '`claim enable` - Activer les revendications\n' +
          '`claim disable` - Désactiver les revendications\n' +
          '`claim add <#channel>` - Ajouter un canal\n' +
          '`claim remove <#channel>` - Supprimer un canal\n' +
          '`claim cooldown <heures>` - Définir le délai d\'attente\n' +
          '`claim message <message>` - Définir le message\n' +
          '`claim color <couleur>` - Définir la couleur de l\'embed\n' +
          '`claim title <titre>` - Définir le titre de l\'embed\n' +
          '`claim footer <texte>` - Définir le pied de page\n' +
          '`claim list` - Lister les canaux configurés'
        );
      }

      const subCommand = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      switch (subCommand) {
        case 'enable':
          config[message.guild.id].claim.enabled = true;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Les revendications ont été activées.');
          break;

        case 'disable':
          config[message.guild.id].claim.enabled = false;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Les revendications ont été désactivées.');
          break;

        case 'add':
          const channelToAdd = message.mentions.channels.first();
          if (!channelToAdd) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          if (config[message.guild.id].claim.channels.includes(channelToAdd.id)) {
            return message.reply('Ce canal est déjà configuré pour les revendications.');
          }
          config[message.guild.id].claim.channels.push(channelToAdd.id);
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal ${channelToAdd.name} a été ajouté à la liste des canaux de revendication.`);
          break;

        case 'remove':
          const channelToRemove = message.mentions.channels.first();
          if (!channelToRemove) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          const index = config[message.guild.id].claim.channels.indexOf(channelToRemove.id);
          if (index === -1) {
            return message.reply('Ce canal n\'est pas configuré pour les revendications.');
          }
          config[message.guild.id].claim.channels.splice(index, 1);
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal ${channelToRemove.name} a été retiré de la liste des canaux de revendication.`);
          break;

        case 'cooldown':
          const hours = parseInt(value);
          if (isNaN(hours) || hours < 1) {
            return message.reply('Veuillez spécifier un nombre d\'heures valide (minimum 1).');
          }
          config[message.guild.id].claim.cooldown = hours;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le délai d'attente a été défini sur ${hours} heures.`);
          break;

        case 'message':
          if (!value) {
            return message.reply('Veuillez spécifier un message.');
          }
          config[message.guild.id].claim.message = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le message a été mis à jour.');
          break;

        case 'color':
          if (!value.match(/^#[0-9A-Fa-f]{6}$/)) {
            return message.reply('Veuillez spécifier une couleur valide au format hexadécimal (ex: #0099ff).');
          }
          config[message.guild.id].claim.embed.color = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La couleur de l'embed a été définie sur ${value}`);
          break;

        case 'title':
          if (!value) {
            return message.reply('Veuillez spécifier un titre.');
          }
          config[message.guild.id].claim.embed.title = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le titre de l\'embed a été mis à jour.');
          break;

        case 'footer':
          if (!value) {
            return message.reply('Veuillez spécifier un texte.');
          }
          config[message.guild.id].claim.embed.footer = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le pied de page de l\'embed a été mis à jour.');
          break;

        case 'list':
          const channelList = config[message.guild.id].claim.channels
            .map(c => `<#${c}>`)
            .join(', ') || 'Aucun canal configuré';
          message.reply(
            'Canaux configurés pour les revendications:\n' +
            channelList
          );
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des revendications:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
};
