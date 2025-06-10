module.exports = {
  name: 'serverinfo',
  description: 'Affiche les informations générales du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    try {
      const guild = message.guild;
      const owner = await guild.fetchOwner();
      const members = await guild.members.fetch();
      const channels = guild.channels.cache;
      const roles = guild.roles.cache.filter(role => role.id !== guild.id);
      const emojis = guild.emojis.cache;
      const boostLevel = guild.premiumTier;
      const boostCount = guild.premiumSubscriptionCount;

      const verificationLevel = {
        0: 'Aucune',
        1: 'Basse',
        2: 'Moyenne',
        3: 'Élevée',
        4: 'Très élevée'
      }[guild.verificationLevel];

      const contentFilter = {
        0: 'Désactivé',
        1: 'Membres sans rôle',
        2: 'Tous les membres'
      }[guild.explicitContentFilter];

      const embed = {
        title: `📊 Informations sur ${guild.name}`,
        thumbnail: {
          url: guild.iconURL({ dynamic: true, size: 4096 })
        },
        fields: [
          {
            name: '👑 Propriétaire',
            value: `${owner.user.tag} (${owner.id})`,
            inline: true
          },
          {
            name: '🆔 ID du serveur',
            value: guild.id,
            inline: true
          },
          {
            name: '📅 Création',
            value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
            inline: true
          },
          {
            name: '👥 Membres',
            value: `Total: ${members.size}\n` +
              `Humains: ${members.filter(m => !m.user.bot).size}\n` +
              `Bots: ${members.filter(m => m.user.bot).size}`,
            inline: true
          },
          {
            name: '📺 Salons',
            value: `Total: ${channels.size}\n` +
              `Textuels: ${channels.filter(c => c.type === 'GUILD_TEXT').size}\n` +
              `Vocaux: ${channels.filter(c => c.type === 'GUILD_VOICE').size}\n` +
              `Catégories: ${channels.filter(c => c.type === 'GUILD_CATEGORY').size}`,
            inline: true
          },
          {
            name: '🎨 Autres',
            value: `Rôles: ${roles.size}\n` +
              `Emojis: ${emojis.size}\n` +
              `Boost: Niveau ${boostLevel} (${boostCount} boosts)`,
            inline: true
          },
          {
            name: '🔒 Sécurité',
            value: `Vérification: ${verificationLevel}\n` +
              `Filtre de contenu: ${contentFilter}\n` +
              `2FA requis: ${guild.mfaLevel === 1 ? 'Oui' : 'Non'}`,
            inline: true
          }
        ],
        color: 0x00ff00,
        timestamp: new Date()
      };

      if (guild.banner) {
        embed.image = {
          url: guild.bannerURL({ dynamic: true, size: 4096 })
        };
      }

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la récupération des informations du serveur.');
    }
  }
}; 