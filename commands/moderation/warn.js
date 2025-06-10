const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'warn',
  description: 'Avertit un membre du serveur',
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

    if (target.roles.highest.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerId) {
      return message.reply({
        embeds: [{
          title: '❌ Permission insuffisante',
          description: 'Vous ne pouvez pas avertir un membre ayant un rôle supérieur ou égal au vôtre.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';

    try {
      // Charger la configuration du serveur
      const config = require('../../config/server_config.json');
      const serverConfig = config[message.guild.id] || {};

      // Créer l'embed d'avertissement
      const warnEmbed = {
        title: '⚠️ Avertissement',
        description: `Vous avez reçu un avertissement dans **${message.guild.name}**`,
        color: 0xff9900,
        fields: [
          {
            name: '👤 Modérateur',
            value: message.author.tag,
            inline: true
          },
          {
            name: '📝 Raison',
            value: reason,
            inline: true
          }
        ],
        timestamp: new Date(),
        footer: {
          text: `ID: ${message.id}`
        }
      };

      // Envoyer l'avertissement au membre
      try {
        await target.send({ embeds: [warnEmbed] });
      } catch (error) {
        console.log(`Impossible d'envoyer l'avertissement en DM à ${target.user.tag}`);
      }

      // Envoyer la confirmation dans le canal
      const confirmEmbed = {
        title: '✅ Avertissement envoyé',
        description: `${target} a reçu un avertissement.`,
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
            name: '📝 Raison',
            value: reason,
            inline: false
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
            title: '⚠️ Avertissement',
            description: `Un avertissement a été donné à ${target}`,
            color: 0xff9900,
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
                name: '📝 Raison',
                value: reason,
                inline: false
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

      // Sauvegarder l'avertissement dans la base de données
      if (!serverConfig.warnings) {
        serverConfig.warnings = {};
      }
      if (!serverConfig.warnings[target.id]) {
        serverConfig.warnings[target.id] = [];
      }

      serverConfig.warnings[target.id].push({
        moderator: message.author.id,
        reason: reason,
        date: new Date().toISOString(),
        id: message.id
      });

      // Sauvegarder la configuration
      config[message.guild.id] = serverConfig;
      require('fs').writeFileSync('./config/server_config.json', JSON.stringify(config, null, 2));

    } catch (error) {
      console.error('Erreur warn:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de l\'envoi de l\'avertissement.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
};
