module.exports = {
  name: 'secur',
  description: 'Configure le niveau de sécurité du système anti-raid',
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
        const currentLevel = serverConfig.antiraid.securityLevel || 'normal';
        const levelInfo = {
          low: {
            color: 0x00ff00,
            description: 'Niveau bas - Protection minimale',
            details: '• Vérification basique des nouveaux membres\n• Délai de vérification court\n• Limites de création modérées'
          },
          normal: {
            color: 0xffff00,
            description: 'Niveau normal - Protection standard',
            details: '• Vérification complète des nouveaux membres\n• Délai de vérification moyen\n• Limites de création strictes'
          },
          high: {
            color: 0xff0000,
            description: 'Niveau élevé - Protection maximale',
            details: '• Vérification approfondie des nouveaux membres\n• Délai de vérification long\n• Limites de création très strictes'
          }
        };

        return message.reply({
          embeds: [{
            title: '🛡️ Niveau de sécurité',
            description: `Le niveau de sécurité est actuellement défini sur **${currentLevel}**.`,
            color: levelInfo[currentLevel].color,
            fields: [
              {
                name: 'ℹ️ Description',
                value: levelInfo[currentLevel].description,
                inline: false
              },
              {
                name: '📋 Détails',
                value: levelInfo[currentLevel].details,
                inline: false
              },
              {
                name: '⚙️ Configuration',
                value: 'Utilisez `secur low`, `secur normal` ou `secur high` pour changer le niveau.',
                inline: false
              }
            ],
            timestamp: new Date()
          }]
        });
      }

      const level = args[0].toLowerCase();
      if (!['low', 'normal', 'high'].includes(level)) {
        return message.reply({
          embeds: [{
            title: '❌ Niveau invalide',
            description: 'Niveaux disponibles : `low`, `normal`, `high`',
            color: 0xff0000,
            timestamp: new Date()
          }]
        });
      }

      serverConfig.antiraid.securityLevel = level;

      const levelInfo = {
        low: {
          color: 0x00ff00,
          description: 'Niveau bas - Protection minimale'
        },
        normal: {
          color: 0xffff00,
          description: 'Niveau normal - Protection standard'
        },
        high: {
          color: 0xff0000,
          description: 'Niveau élevé - Protection maximale'
        }
      };

      message.reply({
        embeds: [{
          title: '✅ Niveau de sécurité modifié',
          description: `Le niveau de sécurité a été défini sur **${level}**.`,
          color: levelInfo[level].color,
          fields: [
            {
              name: '🛡️ Niveau',
              value: level.charAt(0).toUpperCase() + level.slice(1),
              inline: true
            },
            {
              name: '👮 Modérateur',
              value: message.author.tag,
              inline: true
            },
            {
              name: 'ℹ️ Description',
              value: levelInfo[level].description,
              inline: false
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
            title: '⚙️ Niveau de sécurité modifié',
            description: `Le niveau de sécurité a été défini sur **${level}** par ${message.author.tag}`,
            color: levelInfo[level].color,
            fields: [
              {
                name: '👮 Modérateur',
                value: message.author.tag,
                inline: true
              },
              {
                name: '🛡️ Niveau',
                value: level.charAt(0).toUpperCase() + level.slice(1),
                inline: true
              },
              {
                name: 'ℹ️ Description',
                value: levelInfo[level].description,
                inline: false
              }
            ],
            timestamp: new Date()
          };
          logChannel.send({ embeds: [logEmbed] });
        }
      }

    } catch (error) {
      console.error('Erreur secur:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la configuration du niveau de sécurité.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 