const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'slowmode',
  description: 'Configurer le mode lent d\'un canal',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('ManageChannels')) {
      return message.reply('Vous devez avoir la permission de gérer les canaux pour utiliser cette commande.');
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
          slowmode: {}
        };
      }

      if (!config[message.guild.id].slowmode) {
        config[message.guild.id].slowmode = {};
      }

      if (!args[0]) {
        return message.reply(
          'Utilisation de la commande:\n' +
          '`slowmode #canal <durée>` - Définir le mode lent (en secondes)\n' +
          '`slowmode #canal off` - Désactiver le mode lent\n' +
          '`slowmode list` - Voir tous les canaux en mode lent'
        );
      }

      if (args[0].toLowerCase() === 'list') {
        const slowmodeChannels = Object.entries(config[message.guild.id].slowmode)
          .filter(([_, value]) => value > 0)
          .map(([channelId, duration]) => {
            const channel = message.guild.channels.cache.get(channelId);
            return channel ? `<#${channelId}>: ${duration} secondes` : null;
          })
          .filter(Boolean);

        if (slowmodeChannels.length === 0) {
          return message.reply('Aucun canal n\'est actuellement en mode lent.');
        }

        return message.reply(
          'Canaux en mode lent:\n' +
          slowmodeChannels.join('\n')
        );
      }

      const channel = message.mentions.channels.first();
      if (!channel) {
        return message.reply('Veuillez mentionner un canal valide.');
      }

      // Vérifier si le bot a les permissions nécessaires
      const botMember = message.guild.members.me;
      const channelPerms = channel.permissionsFor(botMember);
      
      if (!channelPerms.has('ManageChannels')) {
        return message.reply('Je n\'ai pas la permission de gérer ce canal.');
      }

      if (args[1]?.toLowerCase() === 'off') {
        await channel.setRateLimitPerUser(0);
        config[message.guild.id].slowmode[channel.id] = 0;
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
        return message.reply(`✅ Le mode lent a été désactivé dans ${channel.name}`);
      }

      const duration = parseInt(args[1]);
      if (isNaN(duration) || duration < 0 || duration > 21600) {
        return message.reply('La durée doit être un nombre entre 0 et 21600 secondes (6 heures).');
      }

      await channel.setRateLimitPerUser(duration);
      config[message.guild.id].slowmode[channel.id] = duration;
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

      message.reply(`✅ Le mode lent a été défini sur ${duration} secondes dans ${channel.name}`);
    } catch (error) {
      console.error('Erreur lors de la configuration du mode lent:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
};
