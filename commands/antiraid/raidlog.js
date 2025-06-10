module.exports = {
  name: 'raidlog',
  description: 'Configure le canal de logs pour les raids',
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

    try {
      // Charger la configuration du serveur
      const config = require('../../config/server_config.json');
      const serverConfig = config[message.guild.id] || {};
      if (!serverConfig.antiraid) {
        serverConfig.antiraid = {};
      }

      // Si aucun argument n'est fourni, afficher l'état actuel
      if (!args[0]) {
        const logChannelId = serverConfig.antiraid.raidLogChannel;
        const logChannel = logChannelId ? message.guild.channels.cache.get(logChannelId) : null;
        
        return message.reply({
          embeds: [{
            title: '📝 Canal de logs de raid',
            description: logChannel ? 
              `Les logs de raid sont actuellement envoyés dans le canal ${logChannel}.` :
              'Aucun canal de logs de raid n\'est configuré.',
            color: logChannel ? 0x00ff00 : 0xff0000,
            fields: [
              {
                name: 'ℹ️ Information',
                value: 'Les logs de raid contiennent des informations sur les tentatives de raid détectées.',
                inline: false
              },
              {
                name: '⚙️ Configuration',
                value: 'Utilisez `raidlog <#canal>` pour définir un canal de logs ou `raidlog off` pour désactiver.',
                inline: false
              }
            ],
            timestamp: new Date()
          }]
        });
      }

      if (args[0].toLowerCase() === 'off') {
        delete serverConfig.antiraid.raidLogChannel;
        message.reply({
          embeds: [{
            title: '✅ Logs de raid désactivés',
            description: 'Les logs de raid ont été désactivés.',
            color: 0xff0000,
            fields: [
              {
                name: '👮 Modérateur',
                value: message.author.tag,
                inline: true
              }
            ],
            timestamp: new Date()
          }]
        });
      } else {
        const channel = message.mentions.channels.first();
        if (!channel) {
          return message.reply({
            embeds: [{
              title: '❌ Canal invalide',
              description: 'Veuillez mentionner un canal valide.',
              color: 0xff0000,
              timestamp: new Date()
            }]
          });
        }

        serverConfig.antiraid.raidLogChannel = channel.id;
        message.reply({
          embeds: [{
            title: '✅ Canal de logs configuré',
            description: `Les logs de raid seront maintenant envoyés dans ${channel}.`,
            color: 0x00ff00,
            fields: [
              {
                name: '📝 Canal',
                value: channel.toString(),
                inline: true
              },
              {
                name: '👮 Modérateur',
                value: message.author.tag,
                inline: true
              }
            ],
            timestamp: new Date()
          }]
        });
      }

      // Sauvegarder la configuration
      config[message.guild.id] = serverConfig;
      require('fs').writeFileSync('./config/server_config.json', JSON.stringify(config, null, 2));

      // Envoyer un message dans le canal de logs si configuré
      if (serverConfig.logChannel) {
        const logChannel = message.guild.channels.cache.get(serverConfig.logChannel);
        if (logChannel) {
          const logEmbed = {
            title: '⚙️ Configuration des logs de raid modifiée',
            description: args[0].toLowerCase() === 'off' ?
              `Les logs de raid ont été désactivés par ${message.author.tag}` :
              `Le canal de logs de raid a été configuré sur ${channel} par ${message.author.tag}`,
            color: args[0].toLowerCase() === 'off' ? 0xff0000 : 0x00ff00,
            fields: [
              {
                name: '👮 Modérateur',
                value: message.author.tag,
                inline: true
              },
              {
                name: '📝 Canal',
                value: args[0].toLowerCase() === 'off' ? 'Désactivé' : channel.toString(),
                inline: true
              }
            ],
            timestamp: new Date()
          };
          logChannel.send({ embeds: [logEmbed] });
        }
      }

    } catch (error) {
      console.error('Erreur raidlog:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la configuration des logs de raid.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 