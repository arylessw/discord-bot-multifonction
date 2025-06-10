module.exports = {
  name: 'temprole',
  description: 'Ajoute un rôle temporaire à un membre',
  category: 'Gestion',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('ManageRoles')) {
      return message.reply('Vous n\'avez pas la permission de gérer les rôles.');
    }

    if (args.length < 3) {
      return message.reply('Usage: !temprole <@membre> <@rôle> <durée>');
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Veuillez mentionner un membre.');
    }

    const role = message.mentions.roles.first();
    if (!role) {
      return message.reply('Veuillez mentionner un rôle.');
    }

    if (!role.editable) {
      return message.reply('Je ne peux pas gérer ce rôle.');
    }

    if (message.member.roles.highest.position <= role.position) {
      return message.reply('Vous ne pouvez pas gérer un rôle supérieur ou égal au vôtre.');
    }

    const duration = args[2];
    const timeRegex = /^(\d+)([mhd])$/;
    const match = duration.match(timeRegex);

    if (!match) {
      return message.reply('Format de durée invalide. Utilisez: 30m (minutes), 2h (heures), 1d (jours)');
    }

    const [, amount, unit] = match;
    let milliseconds;

    switch (unit) {
      case 'm':
        milliseconds = parseInt(amount) * 60 * 1000;
        break;
      case 'h':
        milliseconds = parseInt(amount) * 60 * 60 * 1000;
        break;
      case 'd':
        milliseconds = parseInt(amount) * 24 * 60 * 60 * 1000;
        break;
    }

    try {
      await member.roles.add(role);
      
      const embed = {
        title: '🎭 Rôle temporaire ajouté',
        fields: [
          {
            name: '👤 Membre',
            value: `${member.user.tag} (${member.id})`,
            inline: true
          },
          {
            name: '👮 Modérateur',
            value: message.author.tag,
            inline: true
          },
          {
            name: '🎨 Rôle',
            value: role.name,
            inline: true
          },
          {
            name: '⏱️ Durée',
            value: duration,
            inline: true
          }
        ],
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          logChannel.send({ embeds: [embed] });
        }
      }

      // Supprimer le rôle après la durée spécifiée
      setTimeout(async () => {
        try {
          if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
            
            const removeEmbed = {
              title: '🎭 Rôle temporaire retiré',
              fields: [
                {
                  name: '👤 Membre',
                  value: `${member.user.tag} (${member.id})`,
                  inline: true
                },
                {
                  name: '🎨 Rôle',
                  value: role.name,
                  inline: true
                }
              ],
              color: 0xff9900,
              timestamp: new Date()
            };

            if (logChannel) {
              logChannel.send({ embeds: [removeEmbed] });
            }
          }
        } catch (error) {
          console.error('Erreur lors du retrait du rôle temporaire:', error);
        }
      }, milliseconds);

    } catch (error) {
      console.error('Erreur lors de l\'ajout du rôle temporaire:', error);
      message.reply('Une erreur est survenue lors de l\'ajout du rôle temporaire.');
    }
  }
}; 