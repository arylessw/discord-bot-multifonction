module.exports = {
  name: 'voicekick',
  description: 'Expulse un membre d\'un salon vocal',
  category: 'Gestion',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('MoveMembers')) {
      return message.reply('Vous n\'avez pas la permission de déplacer des membres.');
    }

    const member = message.mentions.members.first() || 
      message.guild.members.cache.get(args[0]) ||
      message.guild.members.cache.find(m => m.user.tag.toLowerCase() === args.join(' ').toLowerCase());

    if (!member) {
      return message.reply('Veuillez mentionner un membre valide.');
    }

    if (!member.voice.channel) {
      return message.reply('Ce membre n\'est pas dans un salon vocal.');
    }

    if (member.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply('Vous ne pouvez pas expulser quelqu\'un qui a un rôle supérieur ou égal au vôtre.');
    }

    const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';

    try {
      await member.voice.disconnect(reason);
      
      const embed = {
        title: '🎤 Membre expulsé du salon vocal',
        fields: [
          {
            name: '👤 Membre',
            value: `${member.user.tag} (${member.id})`,
            inline: true
          },
          {
            name: '🎧 Salon',
            value: member.voice.channel.name,
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
      console.error('Erreur lors de l\'expulsion du salon vocal:', error);
      message.reply('Une erreur est survenue lors de l\'expulsion du salon vocal.');
    }
  }
}; 