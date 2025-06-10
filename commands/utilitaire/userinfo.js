module.exports = {
  name: 'userinfo',
  description: 'Affiche les informations détaillées d\'un utilisateur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    const member = message.mentions.members.first() || 
      message.guild.members.cache.get(args[0]) ||
      message.guild.members.cache.find(m => m.user.tag.toLowerCase() === args.join(' ').toLowerCase()) ||
      message.member;

    const roles = member.roles.cache
      .filter(role => role.id !== message.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(role => role.toString());

    const permissions = member.permissions.toArray()
      .filter(perm => !['CREATE_INSTANT_INVITE', 'KICK_MEMBERS', 'BAN_MEMBERS', 'ADMINISTRATOR', 'MANAGE_CHANNELS', 'MANAGE_GUILD', 'ADD_REACTIONS', 'VIEW_AUDIT_LOG', 'PRIORITY_SPEAKER', 'STREAM', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'USE_EXTERNAL_EMOJIS', 'VIEW_GUILD_INSIGHTS', 'CONNECT', 'SPEAK', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'USE_VAD', 'CHANGE_NICKNAME', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS', 'MANAGE_EMOJIS_AND_STICKERS', 'USE_APPLICATION_COMMANDS', 'REQUEST_TO_SPEAK', 'MANAGE_EVENTS', 'MANAGE_THREADS', 'USE_PUBLIC_THREADS', 'USE_PRIVATE_THREADS', 'USE_EXTERNAL_STICKERS', 'SEND_MESSAGES_IN_THREADS', 'START_EMBEDDED_ACTIVITIES', 'MODERATE_MEMBERS'].includes(perm))
      .map(perm => perm.toLowerCase().replace(/_/g, ' '));

    const embed = {
      title: `Informations sur ${member.user.tag}`,
      thumbnail: {
        url: member.user.displayAvatarURL({ dynamic: true, size: 1024 })
      },
      fields: [
        {
          name: '👤 Informations générales',
          value: `**ID:** ${member.id}\n**Bot:** ${member.user.bot ? 'Oui' : 'Non'}\n**Compte créé le:** <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`,
          inline: false
        },
        {
          name: '📥 Informations serveur',
          value: `**A rejoint le:** <t:${Math.floor(member.joinedTimestamp / 1000)}:F>\n**Nickname:** ${member.nickname || 'Aucun'}\n**Rôles:** ${roles.length ? roles.join(', ') : 'Aucun'}`,
          inline: false
        }
      ],
      color: member.displayHexColor === '#000000' ? 0x00ff00 : member.displayHexColor,
      timestamp: new Date()
    };

    if (permissions.length > 0) {
      embed.fields.push({
        name: '🔑 Permissions',
        value: permissions.map(p => `\`${p}\``).join(', '),
        inline: false
      });
    }

    if (member.premiumSince) {
      embed.fields.push({
        name: '🚀 Boost',
        value: `Booste depuis le <t:${Math.floor(member.premiumSinceTimestamp / 1000)}:F>`,
        inline: false
      });
    }

    message.reply({ embeds: [embed] });
  }
}; 