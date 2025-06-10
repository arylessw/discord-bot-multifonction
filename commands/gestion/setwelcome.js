module.exports = {
  name: 'setwelcome',
  description: 'Configure le canal de bienvenue',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Cette commande doit être utilisée dans un serveur.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply({
        embeds: [{
          title: '❌ Permission manquante',
          description: 'Vous devez avoir la permission d\'administrateur pour utiliser cette commande.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    // Si aucun argument n'est fourni, afficher le canal de bienvenue actuel
    if (!args[0]) {
      const config = require('../../config/server_config.json');
      const currentChannel = config[message.guild.id]?.welcomeChannel;
      
      if (!currentChannel) {
        return message.reply({
          embeds: [{
            title: 'ℹ️ Canal de bienvenue',
            description: 'Aucun canal de bienvenue n\'est configuré.',
            color: 0x3498db,
            timestamp: new Date()
          }]
        });
      }

      const channel = message.guild.channels.cache.get(currentChannel);
      if (!channel) {
        return message.reply({
          embeds: [{
            title: '⚠️ Canal introuvable',
            description: 'Le canal de bienvenue configuré n\'existe plus.',
            color: 0xffa500,
            timestamp: new Date()
          }]
        });
      }

      return message.reply({
        embeds: [{
          title: 'ℹ️ Canal de bienvenue actuel',
          description: `Le canal de bienvenue actuel est ${channel}.`,
          color: 0x3498db,
          fields: [
            {
              name: '📝 Canal',
              value: channel.toString(),
              inline: true
            },
            {
              name: '🆔 ID',
              value: channel.id,
              inline: true
            }
          ],
          timestamp: new Date()
        }]
      });
    }

    // Si l'argument est "remove", supprimer le canal de bienvenue
    if (args[0].toLowerCase() === 'remove') {
      const config = require('../../config/server_config.json');
      if (!config[message.guild.id]?.welcomeChannel) {
        return message.reply({
          embeds: [{
            title: 'ℹ️ Information',
            description: 'Aucun canal de bienvenue n\'est configuré.',
            color: 0x3498db,
            timestamp: new Date()
          }]
        });
      }

      const oldChannel = message.guild.channels.cache.get(config[message.guild.id].welcomeChannel);
      delete config[message.guild.id].welcomeChannel;

      const fs = require('fs');
      fs.writeFileSync('./config/server_config.json', JSON.stringify(config, null, 2));

      const embed = {
        title: '✅ Canal de bienvenue supprimé',
        description: 'Le canal de bienvenue a été supprimé.',
        color: 0x00ff00,
        fields: [
          {
            name: '👤 Administrateur',
            value: message.author.tag,
            inline: true
          }
        ],
        timestamp: new Date()
      };

      if (oldChannel) {
        embed.fields.push({
          name: '📝 Ancien canal',
          value: oldChannel.toString(),
          inline: true
        });
      }

      message.reply({ embeds: [embed] });

      // Envoyer un message dans le canal de logs si configuré
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          logChannel.send({ embeds: [embed] });
        }
      }

      return;
    }

    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) {
      return message.reply({
        embeds: [{
          title: '❌ Canal non spécifié',
          description: 'Veuillez mentionner un canal ou fournir son ID.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    try {
      // Vérifier si le bot a les permissions nécessaires
      if (!channel.permissionsFor(message.guild.members.me).has(['ViewChannel', 'SendMessages', 'EmbedLinks'])) {
        return message.reply({
          embeds: [{
            title: '❌ Permissions manquantes',
            description: 'Je n\'ai pas les permissions nécessaires dans ce canal (Voir le canal, Envoyer des messages, Intégrer des liens).',
            color: 0xff0000,
            timestamp: new Date()
          }]
        });
      }

      // Charger ou créer la configuration
      const config = require('../../config/server_config.json');
      if (!config[message.guild.id]) {
        config[message.guild.id] = {};
      }

      const oldChannel = config[message.guild.id].welcomeChannel ? message.guild.channels.cache.get(config[message.guild.id].welcomeChannel) : null;

      // Mettre à jour la configuration
      config[message.guild.id].welcomeChannel = channel.id;

      // Sauvegarder la configuration
      const fs = require('fs');
      fs.writeFileSync('./config/server_config.json', JSON.stringify(config, null, 2));

      const embed = {
        title: '✅ Canal de bienvenue configuré',
        description: `Le canal de bienvenue a été configuré sur ${channel}.`,
        color: 0x00ff00,
        fields: [
          {
            name: '👤 Administrateur',
            value: message.author.tag,
            inline: true
          },
          {
            name: '📝 Nouveau canal',
            value: channel.toString(),
            inline: true
          }
        ],
        timestamp: new Date()
      };

      if (oldChannel) {
        embed.fields.push({
          name: '🔄 Ancien canal',
          value: oldChannel.toString(),
          inline: true
        });
      }

      // Envoyer un message de confirmation
      message.reply({ embeds: [embed] });

      // Envoyer un message dans le nouveau canal de bienvenue
      channel.send({
        embeds: [{
          title: '👋 Canal de bienvenue configuré',
          description: 'Ce canal a été configuré comme canal de bienvenue.',
          color: 0x00ff00,
          fields: [
            {
              name: '👤 Administrateur',
              value: message.author.tag,
              inline: true
            }
          ],
          timestamp: new Date()
        }]
      });

      // Envoyer un message dans le canal de logs si configuré
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Erreur setwelcome:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la configuration du canal de bienvenue.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 