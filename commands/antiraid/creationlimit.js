module.exports = {
  name: 'creationlimit',
  description: 'Configure la limite de création de canaux/rôles pour le système anti-raid',
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

      // Si aucun argument n'est fourni, afficher la limite actuelle
      if (!args[0]) {
        const currentLimit = serverConfig.antiraid.creationLimit || 3;
        return message.reply({
          embeds: [{
            title: '📊 Limite de création actuelle',
            description: `La limite actuelle est de ${currentLimit} création(s) par minute.`,
            color: 0x3498db,
            fields: [
              {
                name: 'ℹ️ Information',
                value: 'Cette limite s\'applique à la création de canaux et de rôles.',
                inline: false
              },
              {
                name: '💡 Recommandation',
                value: 'La limite recommandée est de 3 créations par minute.',
                inline: false
              }
            ],
            timestamp: new Date()
          }]
        });
      }

      // Vérifier si l'argument est "reset"
      if (args[0].toLowerCase() === 'reset') {
        serverConfig.antiraid.creationLimit = 3;
        message.reply({
          embeds: [{
            title: '✅ Limite réinitialisée',
            description: 'La limite de création a été réinitialisée à 3 par minute.',
            color: 0x00ff00,
            timestamp: new Date()
          }]
        });
      } else {
        // Vérifier si l'argument est un nombre valide
        const newLimit = parseInt(args[0]);
        if (isNaN(newLimit) || newLimit < 1 || newLimit > 10) {
          return message.reply({
            embeds: [{
              title: '❌ Valeur invalide',
              description: 'La limite doit être un nombre entre 1 et 10.',
              color: 0xff0000,
              timestamp: new Date()
            }]
          });
        }

        serverConfig.antiraid.creationLimit = newLimit;
        message.reply({
          embeds: [{
            title: '✅ Limite mise à jour',
            description: `La limite de création a été définie à ${newLimit} par minute.`,
            color: 0x00ff00,
            fields: [
              {
                name: '📊 Nouvelle limite',
                value: `${newLimit} création(s) par minute`,
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
            title: '⚙️ Limite de création modifiée',
            description: `La limite de création a été modifiée par ${message.author.tag}`,
            color: 0x3498db,
            fields: [
              {
                name: '👮 Modérateur',
                value: message.author.tag,
                inline: true
              },
              {
                name: '📊 Nouvelle limite',
                value: `${serverConfig.antiraid.creationLimit} création(s) par minute`,
                inline: true
              }
            ],
            timestamp: new Date()
          };
          logChannel.send({ embeds: [logEmbed] });
        }
      }

    } catch (error) {
      console.error('Erreur creationlimit:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la configuration de la limite de création.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 