module.exports = {
  name: 'serverwidget',
  description: 'Affiche le widget du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    const guild = message.guild;
    await guild.fetch();

    if (!guild.widgetEnabled) {
      return message.reply('Le widget n\'est pas activé sur ce serveur.');
    }

    try {
      const widget = await guild.fetchWidget();
      const channels = widget.channels;
      const members = widget.members;

      const channelList = channels.map(channel => {
        const type = {
          0: 'Textuel',
          2: 'Vocal'
        }[channel.type] || 'Inconnu';

        return `**${channel.name}**\n` +
          `Type: ${type}\n` +
          `Position: ${channel.position}`;
      });

      const memberList = members.map(member => {
        const status = {
          online: '🟢 En ligne',
          idle: '🟡 Inactif',
          dnd: '🔴 Ne pas déranger',
          offline: '⚫ Hors ligne'
        }[member.status];

        return `**${member.username}**\n` +
          `Statut: ${status}\n` +
          `Activité: ${member.activity ? member.activity.name : 'Aucune'}`;
      });

      const embed = {
        title: `📱 Widget de ${guild.name}`,
        fields: [
          {
            name: '📝 Salons',
            value: channelList.join('\n\n'),
            inline: true
          },
          {
            name: '👥 Membres en ligne',
            value: memberList.join('\n\n'),
            inline: true
          }
        ],
        color: 0x00ff00,
        timestamp: new Date(),
        footer: {
          text: `ID du serveur: ${guild.id}`
        }
      };

      if (widget.instant_invite) {
        embed.description = `[Rejoindre le serveur](${widget.instant_invite})`;
      }

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la récupération du widget.');
    }
  }
}; 