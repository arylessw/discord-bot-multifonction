module.exports = {
  name: 'serverstats',
  description: 'Affiche les statistiques détaillées du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    const guild = message.guild;
    await guild.fetch();

    // Statistiques des membres
    const totalMembers = guild.memberCount;
    const botCount = guild.members.cache.filter(member => member.user.bot).size;
    const humanCount = totalMembers - botCount;
    const onlineMembers = guild.members.cache.filter(member => member.presence?.status === 'online').size;
    const idleMembers = guild.members.cache.filter(member => member.presence?.status === 'idle').size;
    const dndMembers = guild.members.cache.filter(member => member.presence?.status === 'dnd').size;
    const offlineMembers = totalMembers - (onlineMembers + idleMembers + dndMembers);

    // Statistiques des salons
    const channelCount = guild.channels.cache.size;
    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
    const categoryChannels = guild.channels.cache.filter(c => c.type === 4).size;
    const announcementChannels = guild.channels.cache.filter(c => c.type === 5).size;
    const forumChannels = guild.channels.cache.filter(c => c.type === 15).size;

    // Statistiques des rôles et emojis
    const roleCount = guild.roles.cache.size;
    const emojiCount = guild.emojis.cache.size;
    const boostLevel = guild.premiumTier;
    const boostCount = guild.premiumSubscriptionCount || 0;

    // Statistiques des messages (approximatif)
    const messageCount = guild.approximateMessageCount || 'N/A';

    const embed = {
      title: `📊 Statistiques de ${guild.name}`,
      thumbnail: {
        url: guild.iconURL({ dynamic: true, size: 1024 })
      },
      fields: [
        {
          name: '👥 Membres',
          value: `Total: ${totalMembers}\nHumains: ${humanCount}\nBots: ${botCount}`,
          inline: true
        },
        {
          name: '📊 Statut',
          value: `En ligne: ${onlineMembers}\nInactif: ${idleMembers}\nNe pas déranger: ${dndMembers}\nHors ligne: ${offlineMembers}`,
          inline: true
        },
        {
          name: '📝 Salons',
          value: `Total: ${channelCount}\nTextuels: ${textChannels}\nVocaux: ${voiceChannels}\nCatégories: ${categoryChannels}\nAnnonces: ${announcementChannels}\nForums: ${forumChannels}`,
          inline: false
        },
        {
          name: '🎨 Autres',
          value: `Rôles: ${roleCount}\nEmojis: ${emojiCount}\nMessages: ${messageCount}`,
          inline: true
        },
        {
          name: '🚀 Boost',
          value: `Niveau: ${boostLevel}\nNombre: ${boostCount}`,
          inline: true
        }
      ],
      color: 0x00ff00,
      timestamp: new Date()
    };

    message.reply({ embeds: [embed] });
  }
}; 