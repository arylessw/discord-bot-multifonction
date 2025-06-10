module.exports = {
  name: 'roleinfo',
  description: 'Affiche les informations détaillées d\'un rôle',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!args[0]) {
      return message.reply('Veuillez mentionner un rôle ou spécifier son nom.');
    }

    const role = message.mentions.roles.first() || 
      message.guild.roles.cache.get(args[0]) ||
      message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(' ').toLowerCase());

    if (!role) {
      return message.reply('Rôle non trouvé.');
    }

    const permissions = role.permissions.toArray()
      .filter(perm => !['CREATE_INSTANT_INVITE', 'KICK_MEMBERS', 'BAN_MEMBERS', 'ADMINISTRATOR', 'MANAGE_CHANNELS', 'MANAGE_GUILD', 'ADD_REACTIONS', 'VIEW_AUDIT_LOG', 'PRIORITY_SPEAKER', 'STREAM', 'VIEW_CHANNEL', 'SEND_MESSAGES', 'SEND_TTS_MESSAGES', 'MANAGE_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY', 'USE_EXTERNAL_EMOJIS', 'VIEW_GUILD_INSIGHTS', 'CONNECT', 'SPEAK', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'USE_VAD', 'CHANGE_NICKNAME', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'MANAGE_WEBHOOKS', 'MANAGE_EMOJIS_AND_STICKERS', 'USE_APPLICATION_COMMANDS', 'REQUEST_TO_SPEAK', 'MANAGE_EVENTS', 'MANAGE_THREADS', 'USE_PUBLIC_THREADS', 'USE_PRIVATE_THREADS', 'USE_EXTERNAL_STICKERS', 'SEND_MESSAGES_IN_THREADS', 'START_EMBEDDED_ACTIVITIES', 'MODERATE_MEMBERS'].includes(perm))
      .map(perm => perm.toLowerCase().replace(/_/g, ' '));

    const memberCount = role.members.size;
    const hoisted = role.hoist ? 'Oui' : 'Non';
    const mentionable = role.mentionable ? 'Oui' : 'Non';
    const managed = role.managed ? 'Oui' : 'Non';

    const embed = {
      title: `Informations sur le rôle ${role.name}`,
      fields: [
        {
          name: '👤 Informations générales',
          value: `**ID:** ${role.id}\n**Couleur:** ${role.hexColor}\n**Position:** ${role.position}\n**Créé le:** <t:${Math.floor(role.createdTimestamp / 1000)}:F>`,
          inline: false
        },
        {
          name: '📊 Statistiques',
          value: `**Membres:** ${memberCount}\n**Affiché séparément:** ${hoisted}\n**Mentionnable:** ${mentionable}\n**Géré par une intégration:** ${managed}`,
          inline: false
        }
      ],
      color: role.color,
      timestamp: new Date()
    };

    if (permissions.length > 0) {
      embed.fields.push({
        name: '🔑 Permissions',
        value: permissions.map(p => `\`${p}\``).join(', '),
        inline: false
      });
    }

    message.reply({ embeds: [embed] });
  }
}; 