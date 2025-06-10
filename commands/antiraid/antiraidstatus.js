const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'antiraidstatus',
  category: 'Anti-Raid',
  description: 'Affiche l\'état global du système anti-raid',
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

      const antiraid = serverConfig.antiraid;
      const status = {
        antiBan: antiraid.antiBan || false,
        antiChannel: antiraid.antiChannel || false,
        antiDisconnect: antiraid.antiDisconnect || false,
        antiEveryone: antiraid.antiEveryone || false,
        antiRole: antiraid.antiRole || false,
        antiRoleDanger: antiraid.antiRoleDanger || false,
        antiToken: antiraid.antiToken || false,
        antiUpdate: antiraid.antiUpdate || false,
        antiWebhook: antiraid.antiWebhook || false,
        raiding: antiraid.raiding || false
      };

      // Calculer le pourcentage de protection
      const totalProtections = Object.keys(status).length;
      const activeProtections = Object.values(status).filter(Boolean).length;
      const protectionPercentage = Math.round((activeProtections / totalProtections) * 100);

      // Déterminer la couleur en fonction du pourcentage
      let color;
      if (protectionPercentage >= 80) color = 0x00ff00; // Vert
      else if (protectionPercentage >= 50) color = 0xffff00; // Jaune
      else color = 0xff0000; // Rouge

      // Créer l'embed de statut
      const statusEmbed = {
        title: '🛡️ État du système anti-raid',
        description: `Niveau de protection global : **${protectionPercentage}%**`,
        color: color,
        fields: [
          {
            name: '📊 Statistiques',
            value: `Protections actives : ${activeProtections}/${totalProtections}`,
            inline: false
          },
          {
            name: '⚙️ Configuration',
            value: Object.entries(status)
              .map(([key, value]) => {
                const name = key.replace(/([A-Z])/g, ' $1').toLowerCase();
                return `${value ? '✅' : '❌'} ${name.charAt(0).toUpperCase() + name.slice(1)}`;
              })
              .join('\n'),
            inline: false
          }
        ],
        footer: {
          text: 'Utilisez les commandes individuelles pour configurer chaque protection'
        },
        timestamp: new Date()
      };

      // Ajouter des informations supplémentaires si disponibles
      if (antiraid.securityLevel) {
        statusEmbed.fields.push({
          name: '🛡️ Niveau de sécurité',
          value: antiraid.securityLevel.charAt(0).toUpperCase() + antiraid.securityLevel.slice(1),
          inline: true
        });
      }

      if (antiraid.creationLimit) {
        statusEmbed.fields.push({
          name: '📊 Limite de création',
          value: `${antiraid.creationLimit} par minute`,
          inline: true
        });
      }

      if (antiraid.tokenLimit) {
        statusEmbed.fields.push({
          name: '🔑 Limite de tokens',
          value: `${antiraid.tokenLimit} tokens`,
          inline: true
        });
      }

      if (antiraid.raidLogChannel) {
        const logChannel = message.guild.channels.cache.get(antiraid.raidLogChannel);
        if (logChannel) {
          statusEmbed.fields.push({
            name: '📝 Canal de logs',
            value: logChannel.toString(),
            inline: true
          });
        }
      }

      if (antiraid.whitelist && antiraid.whitelist.length > 0) {
        statusEmbed.fields.push({
          name: '👥 Whitelist',
          value: `${antiraid.whitelist.length} membre(s)`,
          inline: true
        });
      }

      if (antiraid.blacklistedRoles && antiraid.blacklistedRoles.length > 0) {
        statusEmbed.fields.push({
          name: '🎭 Rôles blacklistés',
          value: `${antiraid.blacklistedRoles.length} rôle(s)`,
          inline: true
        });
      }

      message.reply({ embeds: [statusEmbed] });

    } catch (error) {
      console.error('Erreur antiraidstatus:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la récupération de l\'état du système anti-raid.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 