module.exports = {
  name: 'antirole',
  description: 'Configure la protection contre la création de rôles',
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
        const isEnabled = serverConfig.antiraid.antiRole || false;
        return message.reply({
          embeds: [{
            title: '🛡️ Protection contre la création de rôles',
            description: `La protection est actuellement **${isEnabled ? 'activée' : 'désactivée'}**.`,
            color: isEnabled ? 0x00ff00 : 0xff0000,
            fields: [
              {
                name: 'ℹ️ Information',
                value: 'Cette protection empêche la création de nouveaux rôles par les membres non autorisés.',
                inline: false
              },
              {
                name: '⚙️ Configuration',
                value: 'Utilisez `antirole on` pour activer ou `antirole off` pour désactiver.',
                inline: false
              }
            ],
            timestamp: new Date()
          }]
        });
      }

      const action = args[0].toLowerCase();
      if (!['on', 'off'].includes(action)) {
        return message.reply({
          embeds: [{
            title: '❌ Action invalide',
            description: 'Actions disponibles : `on`, `off`',
            color: 0xff0000,
            timestamp: new Date()
          }]
        });
      }

      const isEnabled = action === 'on';
      serverConfig.antiraid.antiRole = isEnabled;

      message.reply({
        embeds: [{
          title: isEnabled ? '✅ Protection activée' : '❌ Protection désactivée',
          description: `La protection contre la création de rôles a été ${isEnabled ? 'activée' : 'désactivée'}.`,
          color: isEnabled ? 0x00ff00 : 0xff0000,
          fields: [
            {
              name: '🛡️ État',
              value: isEnabled ? 'Activée' : 'Désactivée',
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

      // Sauvegarder la configuration
      config[message.guild.id] = serverConfig;
      require('fs').writeFileSync('./config/server_config.json', JSON.stringify(config, null, 2));

      // Envoyer un message dans le canal de logs si configuré
      if (serverConfig.logChannel) {
        const logChannel = message.guild.channels.cache.get(serverConfig.logChannel);
        if (logChannel) {
          const logEmbed = {
            title: '⚙️ Protection anti-rôle modifiée',
            description: `La protection contre la création de rôles a été ${isEnabled ? 'activée' : 'désactivée'} par ${message.author.tag}`,
            color: isEnabled ? 0x00ff00 : 0xff0000,
            fields: [
              {
                name: '👮 Modérateur',
                value: message.author.tag,
                inline: true
              },
              {
                name: '🛡️ État',
                value: isEnabled ? 'Activée' : 'Désactivée',
                inline: true
              }
            ],
            timestamp: new Date()
          };
          logChannel.send({ embeds: [logEmbed] });
        }
      }

    } catch (error) {
      console.error('Erreur antirole:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la configuration de la protection contre la création de rôles.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 