module.exports = {
  name: 'antitokenlimit',
  description: 'Configure la limite de tokens dans le système anti-raid',
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
        const currentLimit = serverConfig.antiraid.tokenLimit || 3;
        return message.reply({
          embeds: [{
            title: '🛡️ Limite de tokens',
            description: `La limite actuelle est de **${currentLimit}** tokens.`,
            color: 0x00ff00,
            fields: [
              {
                name: 'ℹ️ Information',
                value: 'Cette limite définit le nombre maximum de tokens qu\'un utilisateur peut envoyer avant d\'être sanctionné.',
                inline: false
              },
              {
                name: '⚙️ Configuration',
                value: 'Utilisez `antitokenlimit <nombre>` pour définir une nouvelle limite (entre 1 et 10).',
                inline: false
              }
            ],
            timestamp: new Date()
          }]
        });
      }

      const limit = parseInt(args[0]);
      if (isNaN(limit) || limit < 1 || limit > 10) {
        return message.reply({
          embeds: [{
            title: '❌ Limite invalide',
            description: 'La limite doit être un nombre entre 1 et 10.',
            color: 0xff0000,
            timestamp: new Date()
          }]
        });
      }

      serverConfig.antiraid.tokenLimit = limit;

      message.reply({
        embeds: [{
          title: '✅ Limite de tokens modifiée',
          description: `La limite de tokens a été définie sur **${limit}**.`,
          color: 0x00ff00,
          fields: [
            {
              name: '🛡️ Limite',
              value: limit.toString(),
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
            title: '⚙️ Limite de tokens modifiée',
            description: `La limite de tokens a été définie sur **${limit}** par ${message.author.tag}`,
            color: 0x00ff00,
            fields: [
              {
                name: '👮 Modérateur',
                value: message.author.tag,
                inline: true
              },
              {
                name: '🛡️ Limite',
                value: limit.toString(),
                inline: true
              }
            ],
            timestamp: new Date()
          };
          logChannel.send({ embeds: [logEmbed] });
        }
      }

    } catch (error) {
      console.error('Erreur antitokenlimit:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la configuration de la limite de tokens.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 