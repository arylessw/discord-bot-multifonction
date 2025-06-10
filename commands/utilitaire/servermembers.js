module.exports = {
  name: 'servermembers',
  description: 'Affiche la liste des membres du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    try {
      const members = await message.guild.members.fetch();
      if (members.size === 0) {
        return message.reply('Ce serveur n\'a pas de membres.');
      }

      const onlineMembers = members.filter(member => member.presence?.status === 'online');
      const idleMembers = members.filter(member => member.presence?.status === 'idle');
      const dndMembers = members.filter(member => member.presence?.status === 'dnd');
      const offlineMembers = members.filter(member => !member.presence || member.presence.status === 'offline');

      const bots = members.filter(member => member.user.bot);
      const humans = members.filter(member => !member.user.bot);

      const embed = {
        title: `👥 Membres de ${message.guild.name}`,
        fields: [
          {
            name: '📊 Statistiques',
            value: `Total: ${members.size}\n` +
              `Humains: ${humans.size}\n` +
              `Bots: ${bots.size}`,
            inline: true
          },
          {
            name: '🟢 En ligne',
            value: onlineMembers.size > 0
              ? onlineMembers.map(member => member.user.tag).join('\n')
              : 'Aucun membre en ligne',
            inline: false
          },
          {
            name: '🟡 Inactif',
            value: idleMembers.size > 0
              ? idleMembers.map(member => member.user.tag).join('\n')
              : 'Aucun membre inactif',
            inline: false
          },
          {
            name: '🔴 Ne pas déranger',
            value: dndMembers.size > 0
              ? dndMembers.map(member => member.user.tag).join('\n')
              : 'Aucun membre en ne pas déranger',
            inline: false
          },
          {
            name: '⚫ Hors ligne',
            value: offlineMembers.size > 0
              ? offlineMembers.map(member => member.user.tag).join('\n')
              : 'Aucun membre hors ligne',
            inline: false
          }
        ],
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la récupération des membres.');
    }
  }
}; 