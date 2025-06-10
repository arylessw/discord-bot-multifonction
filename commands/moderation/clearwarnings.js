module.exports = {
  name: 'clearwarnings',
  description: 'Efface les avertissements d\'un membre',
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

    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply({
        embeds: [{
          title: '❌ Permission manquante',
          description: 'Vous devez avoir la permission de modérer les membres pour utiliser cette commande.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply({
        embeds: [{
          title: '❌ Membre non spécifié',
          description: 'Veuillez mentionner un membre ou fournir son ID.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    try {
      // Charger la configuration du serveur
      const config = require('../../config/server_config.json');
      const serverConfig = config[message.guild.id] || {};

      // Vérifier si le membre a des avertissements
      if (!serverConfig.warnings || !serverConfig.warnings[target.id] || serverConfig.warnings[target.id].length === 0) {
        return message.reply({
          embeds: [{
            title: 'ℹ️ Aucun avertissement',
            description: `${target.user.tag} n'a aucun avertissement.`,
            color: 0x3498db,
            timestamp: new Date()
          }]
        });
      }

      // Sauvegarder le nombre d'avertissements avant suppression
      const warningCount = serverConfig.warnings[target.id].length;

      // Supprimer les avertissements
      delete serverConfig.warnings[target.id];

      // Sauvegarder la configuration
      config[message.guild.id] = serverConfig;
      require('fs').writeFileSync('./config/server_config.json', JSON.stringify(config, null, 2));

      // Envoyer la confirmation
      const confirmEmbed = {
        title: '✅ Avertissements effacés',
        description: `Les avertissements de ${target.user.tag} ont été effacés.`,
        color: 0x00ff00,
        fields: [
          {
            name: '👤 Membre',
            value: target.user.tag,
            inline: true
          },
          {
            name: '👮 Modérateur',
            value: message.author.tag,
            inline: true
          },
          {
            name: '📊 Avertissements effacés',
            value: `${warningCount} avertissement(s)`,
            inline: true
          }
        ],
        timestamp: new Date()
      };
      message.reply({ embeds: [confirmEmbed] });

      // Envoyer un message dans le canal de logs si configuré
      if (serverConfig.logChannel) {
        const logChannel = message.guild.channels.cache.get(serverConfig.logChannel);
        if (logChannel) {
          const logEmbed = {
            title: '🗑️ Avertissements effacés',
            description: `Les avertissements d'un membre ont été effacés`,
            color: 0x00ff00,
            fields: [
              {
                name: '👤 Membre',
                value: `${target.user.tag} (${target.id})`,
                inline: true
              },
              {
                name: '👮 Modérateur',
                value: `${message.author.tag} (${message.author.id})`,
                inline: true
              },
              {
                name: '📊 Avertissements effacés',
                value: `${warningCount} avertissement(s)`,
                inline: true
              },
              {
                name: '📅 Date',
                value: new Date().toLocaleString(),
                inline: true
              }
            ],
            timestamp: new Date()
          };
          logChannel.send({ embeds: [logEmbed] });
        }
      }

    } catch (error) {
      console.error('Erreur clearwarnings:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de l\'effacement des avertissements.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 