const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'welcome',
  description: 'Configurer le message de bienvenue et le canal',
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
          welcomeChannel: null,
          welcomeMessage: 'Bienvenue {user} sur {server} !'
        };
      }

      if (!args[0]) {
        const currentChannel = config[message.guild.id].welcomeChannel 
          ? `<#${config[message.guild.id].welcomeChannel}>` 
          : 'Aucun canal défini';
        return message.reply(
          `Configuration actuelle du message de bienvenue:\n` +
          `Canal: ${currentChannel}\n` +
          `Message: ${config[message.guild.id].welcomeMessage}\n\n` +
          `Variables disponibles: {user}, {server}, {membercount}`
        );
      }

      const subCommand = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      switch (subCommand) {
        case 'channel':
          if (!value) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          const channel = message.mentions.channels.first();
          if (!channel) {
            return message.reply('Canal invalide. Veuillez mentionner un canal valide.');
          }
          config[message.guild.id].welcomeChannel = channel.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal de bienvenue a été défini sur ${channel.name}`);
          break;

        case 'message':
          if (!value) {
            return message.reply('Veuillez spécifier un message.');
          }
          config[message.guild.id].welcomeMessage = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le message de bienvenue a été mis à jour.');
          break;

        case 'remove':
          config[message.guild.id].welcomeChannel = null;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le canal de bienvenue a été supprimé.');
          break;

        default:
          message.reply(
            'Commandes disponibles:\n' +
            '`welcome channel #canal` - Définir le canal de bienvenue\n' +
            '`welcome message <message>` - Définir le message de bienvenue\n' +
            '`welcome remove` - Supprimer le canal de bienvenue'
          );
      }
    } catch (error) {
      console.error('Erreur lors de la configuration du message de bienvenue:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
}; 