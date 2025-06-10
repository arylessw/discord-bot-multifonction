module.exports = {
  name: 'voicemove',
  description: 'Déplace un membre dans un autre salon vocal',
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
      return message.reply('Vous ne pouvez pas déplacer quelqu\'un qui a un rôle supérieur ou égal au vôtre.');
    }

    const targetChannel = message.mentions.channels.first() || 
      message.guild.channels.cache.get(args[1]) ||
      message.guild.channels.cache.find(c => c.name.toLowerCase() === args.slice(1).join(' ').toLowerCase());

    if (!targetChannel || targetChannel.type !== 'GUILD_VOICE') {
      return message.reply('Veuillez mentionner un salon vocal valide.');
    }

    const reason = args.slice(2).join(' ') || 'Aucune raison spécifiée';

    try {
      await member.voice.setChannel(targetChannel, reason);
      
      const embed = {
        title: '🎤 Membre déplacé',
        fields: [
          {
            name: '👤 Membre',
            value: `${member.user.tag} (${member.id})`,
            inline: true
          },
          {
            name: '🎧 Salon source',
            value: member.voice.channel.name,
            inline: true
          },
          {
            name: '🎧 Salon destination',
            value: targetChannel.name,
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
    } catch (error) {
      console.error('Erreur lors du déplacement:', error);
      message.reply('Une erreur est survenue lors du déplacement.');
    }
  }
}; 