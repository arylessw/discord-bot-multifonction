module.exports = {
  name: 'serverchannels',
  description: 'Affiche la liste des salons du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    try {
      const channels = message.guild.channels.cache
        .sort((a, b) => a.position - b.position);

      if (channels.size === 0) {
        return message.reply('Ce serveur n\'a pas de salons.');
      }

      const channelTypes = {
        0: '📝 Textuel',
        1: '🔊 DM',
        2: '🔊 Vocal',
        3: '🔊 DM de groupe',
        4: '📁 Catégorie',
        5: '📢 Annonces',
        6: '🧵 Fil d\'annonces',
        7: '🧵 Fil public',
        8: '🔒 Fil privé',
        9: '📢 Annonces',
        10: '🎤 Scène',
        11: '📝 Salon de répertoire',
        12: '📝 Forum',
        13: '📝 Media'
      };

      const channelList = channels.map(channel => {
        const type = channelTypes[channel.type] || 'Inconnu';
        const category = channel.parent ? `\nCatégorie: ${channel.parent.name}` : '';
        const topic = channel.topic ? `\nSujet: ${channel.topic}` : '';
        const nsfw = channel.nsfw ? '\nNSFW: Oui' : '';
        const slowmode = channel.rateLimitPerUser > 0 ? `\nRalentissement: ${channel.rateLimitPerUser}s` : '';
        const bitrate = channel.bitrate ? `\nBitrate: ${channel.bitrate / 1000}kbps` : '';
        const userLimit = channel.userLimit ? `\nLimite d'utilisateurs: ${channel.userLimit}` : '';

        return `**${type} - ${channel.name}**\n` +
          `ID: ${channel.id}\n` +
          `Position: ${channel.position}${category}${topic}${nsfw}${slowmode}${bitrate}${userLimit}`;
      });

      const embed = {
        title: `📺 Salons de ${message.guild.name}`,
        description: channelList.join('\n\n'),
        color: 0x00ff00,
        timestamp: new Date(),
        footer: {
          text: `Total: ${channels.size} salons`
        }
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur serverchannels:', error);
      message.reply('Une erreur est survenue lors de la récupération des salons.');
    }
  }
}; 