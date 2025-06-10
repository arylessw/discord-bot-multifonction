module.exports = {
  name: 'timeout',
  description: 'Met en timeout un membre',
  category: 'Gestion',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply('Vous n\'avez pas la permission de modérer les membres.');
    }

    const member = message.mentions.members.first() || 
      message.guild.members.cache.get(args[0]) ||
      message.guild.members.cache.find(m => m.user.tag.toLowerCase() === args.join(' ').toLowerCase());

    if (!member) {
      return message.reply('Veuillez mentionner un membre valide.');
    }

    if (member.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply('Vous ne pouvez pas mettre en timeout quelqu\'un qui a un rôle supérieur ou égal au vôtre.');
    }

    if (member.isCommunicationDisabled()) {
      return message.reply('Ce membre est déjà en timeout.');
    }

    const duration = parseInt(args[1]);
    if (isNaN(duration) || duration < 1 || duration > 40320) {
      return message.reply('Veuillez spécifier une durée en minutes entre 1 et 40320 (28 jours).');
    }

    const reason = args.slice(2).join(' ') || 'Aucune raison spécifiée';

    try {
      await member.timeout(duration * 60 * 1000, reason);
      
      const embed = {
        title: '⏰ Membre en timeout',
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
            name: '⏳ Durée',
            value: `${duration} minutes`,
            inline: true
          },
          {
            name: '📝 Raison',
            value: reason,
            inline: false
          }
        ],
        color: 0xff0000,
        timestamp: new Date()
      };

      await member.send({ embeds: [embed] }).catch(() => {
        message.reply('Je n\'ai pas pu envoyer un message privé à ce membre.');
      });

      message.reply({ embeds: [embed] });

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Erreur lors du timeout:', error);
      message.reply('Une erreur est survenue lors du timeout.');
    }
  }
}; 