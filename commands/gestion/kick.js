module.exports = {
  name: 'kick',
  description: 'Expulse un membre',
  category: 'Gestion',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('KickMembers')) {
      return message.reply('Vous n\'avez pas la permission d\'expulser des membres.');
    }

    const member = message.mentions.members.first() || 
      message.guild.members.cache.get(args[0]) ||
      message.guild.members.cache.find(m => m.user.tag.toLowerCase() === args.join(' ').toLowerCase());

    if (!member) {
      return message.reply('Veuillez mentionner un membre valide.');
    }

    if (member.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply('Vous ne pouvez pas expulser quelqu\'un qui a un rôle supérieur ou égal au vôtre.');
    }

    if (!member.kickable) {
      return message.reply('Je ne peux pas expulser ce membre.');
    }

    const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';

    try {
      await member.kick(reason);
      
      const embed = {
        title: '👢 Membre expulsé',
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
            name: '📝 Raison',
            value: reason,
            inline: false
          }
        ],
        color: 0xff9900,
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
      console.error('Erreur lors de l\'expulsion:', error);
      message.reply('Une erreur est survenue lors de l\'expulsion.');
    }
  }
}; 