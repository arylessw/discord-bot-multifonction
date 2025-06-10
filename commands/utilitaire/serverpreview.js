module.exports = {
  name: 'serverpreview',
  description: 'Affiche l\'aperçu du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    try {
      const preview = await message.guild.fetchPreview();
      if (!preview) {
        return message.reply('Ce serveur n\'a pas d\'aperçu disponible.');
      }

      const embed = {
        title: `👀 Aperçu de ${preview.name}`,
        description: preview.description || 'Aucune description',
        fields: [
          {
            name: '👥 Membres',
            value: `Total: ${preview.approximateMemberCount}\n` +
              `En ligne: ${preview.approximatePresenceCount}`,
            inline: true
          },
          {
            name: '📺 Salons',
            value: `Textuels: ${preview.channels.filter(c => c.type === 'GUILD_TEXT').length}\n` +
              `Vocaux: ${preview.channels.filter(c => c.type === 'GUILD_VOICE').length}`,
            inline: true
          },
          {
            name: '🎨 Autres',
            value: `Rôles: ${preview.roles.length}\n` +
              `Emojis: ${preview.emojis.length}`,
            inline: true
          }
        ],
        color: 0x00ff00,
        timestamp: new Date()
      };

      if (preview.icon) {
        embed.thumbnail = {
          url: preview.iconURL({ dynamic: true, size: 4096 })
        };
      }

      if (preview.splash) {
        embed.image = {
          url: preview.splashURL({ dynamic: true, size: 4096 })
        };
      }

      if (preview.banner) {
        embed.image = {
          url: preview.bannerURL({ dynamic: true, size: 4096 })
        };
      }

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la récupération de l\'aperçu du serveur.');
    }
  }
}; 