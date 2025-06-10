module.exports = {
  name: 'setautorole',
  description: 'Configure le rôle automatique',
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

    // Si aucun argument n'est fourni, afficher le rôle automatique actuel
    if (!args[0]) {
      const config = require('../../config/server_config.json');
      const currentRole = config[message.guild.id]?.autoRole;
      
      if (!currentRole) {
        return message.reply({
          embeds: [{
            title: 'ℹ️ Rôle automatique',
            description: 'Aucun rôle automatique n\'est configuré.',
            color: 0x3498db,
            timestamp: new Date()
          }]
        });
      }

      const role = message.guild.roles.cache.get(currentRole);
      if (!role) {
        return message.reply({
          embeds: [{
            title: '⚠️ Rôle introuvable',
            description: 'Le rôle automatique configuré n\'existe plus.',
            color: 0xffa500,
            timestamp: new Date()
          }]
        });
      }

      return message.reply({
        embeds: [{
          title: 'ℹ️ Rôle automatique actuel',
          description: `Le rôle automatique actuel est ${role}.`,
          color: 0x3498db,
          fields: [
            {
              name: '🎭 Rôle',
              value: role.toString(),
              inline: true
            },
            {
              name: '🆔 ID',
              value: role.id,
              inline: true
            }
          ],
          timestamp: new Date()
        }]
      });
    }

    // Si l'argument est "remove", supprimer le rôle automatique
    if (args[0].toLowerCase() === 'remove') {
      const config = require('../../config/server_config.json');
      if (!config[message.guild.id]?.autoRole) {
        return message.reply({
          embeds: [{
            title: 'ℹ️ Information',
            description: 'Aucun rôle automatique n\'est configuré.',
            color: 0x3498db,
            timestamp: new Date()
          }]
        });
      }

      const oldRole = message.guild.roles.cache.get(config[message.guild.id].autoRole);
      delete config[message.guild.id].autoRole;

      const fs = require('fs');
      fs.writeFileSync('./config/server_config.json', JSON.stringify(config, null, 2));

      const embed = {
        title: '✅ Rôle automatique supprimé',
        description: 'Le rôle automatique a été supprimé.',
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

      if (oldRole) {
        embed.fields.push({
          name: '🎭 Ancien rôle',
          value: oldRole.toString(),
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

    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
    if (!role) {
      return message.reply({
        embeds: [{
          title: '❌ Rôle non spécifié',
          description: 'Veuillez mentionner un rôle ou fournir son ID.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    try {
      // Vérifier si le bot a les permissions nécessaires
      if (!message.guild.members.me.permissions.has('ManageRoles')) {
        return message.reply({
          embeds: [{
            title: '❌ Permission manquante',
            description: 'Je n\'ai pas la permission de gérer les rôles.',
            color: 0xff0000,
            timestamp: new Date()
          }]
        });
      }

      // Vérifier si le rôle est plus haut que le rôle du bot
      if (role.position >= message.guild.members.me.roles.highest.position) {
        return message.reply({
          embeds: [{
            title: '❌ Rôle trop élevé',
            description: 'Le rôle doit être plus bas que mon rôle le plus élevé.',
            color: 0xff0000,
            timestamp: new Date()
          }]
        });
      }

      // Vérifier si le rôle est géré par une intégration
      if (role.managed) {
        return message.reply({
          embeds: [{
            title: '❌ Rôle géré',
            description: 'Ce rôle est géré par une intégration et ne peut pas être utilisé comme rôle automatique.',
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

      const oldRole = config[message.guild.id].autoRole ? message.guild.roles.cache.get(config[message.guild.id].autoRole) : null;

      // Mettre à jour la configuration
      config[message.guild.id].autoRole = role.id;

      // Sauvegarder la configuration
      const fs = require('fs');
      fs.writeFileSync('./config/server_config.json', JSON.stringify(config, null, 2));

      const embed = {
        title: '✅ Rôle automatique configuré',
        description: `Le rôle automatique a été configuré sur ${role}.`,
        color: 0x00ff00,
        fields: [
          {
            name: '👤 Administrateur',
            value: message.author.tag,
            inline: true
          },
          {
            name: '🎭 Nouveau rôle',
            value: role.toString(),
            inline: true
          }
        ],
        timestamp: new Date()
      };

      if (oldRole) {
        embed.fields.push({
          name: '🔄 Ancien rôle',
          value: oldRole.toString(),
          inline: true
        });
      }

      // Envoyer un message de confirmation
      message.reply({ embeds: [embed] });

      // Envoyer un message dans le canal de logs si configuré
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Erreur setautorole:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la configuration du rôle automatique.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 