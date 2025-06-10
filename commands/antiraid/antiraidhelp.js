module.exports = {
  name: 'antiraidhelp',
  description: 'Affiche l\'aide du système anti-raid',
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
      const embed = {
        title: '🛡️ Aide du Système Anti-Raid',
        description: 'Voici la documentation complète du système anti-raid :',
        color: 0x3498db,
        fields: [
          {
            name: '📝 Commandes principales',
            value: '`antiraid` - Configure le système anti-raid\n' +
                   '`antiraidstatus` - Affiche le statut du système\n' +
                   '`antiraidhelp` - Affiche cette aide',
            inline: false
          },
          {
            name: '⚙️ Configuration',
            value: '`antiraid on/off` - Active/désactive le système\n' +
                   '`antiraid security <niveau>` - Définit le niveau de sécurité\n' +
                   '`antiraid limit <nombre>` - Définit la limite de création\n' +
                   '`antiraid delay <secondes>` - Définit le délai de vérification\n' +
                   '`antiraid punishment <type>` - Définit la punition\n' +
                   '`antiraid log <#canal>` - Définit le canal de logs',
            inline: false
          },
          {
            name: '🛡️ Niveaux de sécurité',
            value: '`low` - Protection minimale\n' +
                   '`normal` - Protection standard\n' +
                   '`high` - Protection renforcée\n' +
                   '`extreme` - Protection maximale',
            inline: false
          },
          {
            name: '🔨 Types de punition',
            value: '`kick` - Expulse le membre\n' +
                   '`ban` - Bannit le membre\n' +
                   '`quarantine` - Isole le membre',
            inline: false
          },
          {
            name: '📊 Statistiques',
            value: 'Le système anti-raid fournit des statistiques détaillées sur :\n' +
                   '• Nombre total de membres\n' +
                   '• Nombre de bots\n' +
                   '• Membres en ligne/hors ligne\n' +
                   '• État de la protection\n' +
                   '• Actions effectuées',
            inline: false
          },
          {
            name: '⚠️ Protection contre',
            value: '• Raids de masse\n' +
                   '• Création de comptes suspects\n' +
                   '• Modifications non autorisées\n' +
                   '• Webhooks malveillants\n' +
                   '• Rôles dangereux\n' +
                   '• Spam et mentions @everyone',
            inline: false
          },
          {
            name: '💡 Recommandations',
            value: '• Activez toujours le système anti-raid\n' +
                   '• Configurez un niveau de sécurité approprié\n' +
                   '• Définissez une limite de création\n' +
                   '• Configurez un délai de vérification\n' +
                   '• Définissez une punition\n' +
                   '• Configurez un canal de logs',
            inline: false
          }
        ],
        timestamp: new Date(),
        footer: {
          text: 'Pour plus d\'informations, contactez un administrateur'
        }
      };

      // Envoyer l'embed
      message.reply({ embeds: [embed] });

      // Envoyer un message dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.antiraid?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].antiraid.logChannel);
        if (logChannel) {
          logChannel.send({
            embeds: [{
              title: '📚 Aide Anti-Raid consultée',
              description: `${message.author.tag} a consulté l'aide du système anti-raid.`,
              color: 0x3498db,
              fields: [
                {
                  name: '👤 Utilisateur',
                  value: message.author.tag,
                  inline: true
                }
              ],
              timestamp: new Date()
            }]
          });
        }
      }
    } catch (error) {
      console.error('Erreur antiraidhelp:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de l\'affichage de l\'aide.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 