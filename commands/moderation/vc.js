const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'vc',
  description: 'Affiche les statistiques du serveur (membres, vocal, boosts)',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    try {
      // Forcer le chargement de tous les membres si ce n'est pas déjà fait
      if (message.guild.memberCount !== message.guild.members.cache.size) {
        await message.guild.members.fetch();
      }

      // Calculer les statistiques
      const totalMembers = message.guild.memberCount;
      const onlineMembers = message.guild.members.cache.filter(m => m.presence?.status && m.presence.status !== 'offline').size;
      const botsCount = message.guild.members.cache.filter(m => m.user.bot).size;
      const humanMembers = totalMembers - botsCount;

      // Compter les membres en vocal
      const voiceMembers = message.guild.members.cache.filter(m => m.voice.channelId).size;
      
      // Nombre de boosts
      const boostCount = message.guild.premiumSubscriptionCount || 0;
      const boostLevel = message.guild.premiumTier || 0;

      // Créer l'embed
      const statsEmbed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle(`📊 Statistiques de ${message.guild.name}`)
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .addFields(
          { name: '👥 Membres', value: `**Total**: ${totalMembers}\n**Humains**: ${humanMembers}\n**Bots**: ${botsCount}\n**En ligne**: ${onlineMembers}`, inline: true },
          { name: '🎙️ Vocal', value: `**En vocal**: ${voiceMembers}\n**Pourcentage**: ${Math.round((voiceMembers / humanMembers) * 100)}%`, inline: true },
          { name: '✨ Boosts', value: `**Nombre**: ${boostCount}\n**Niveau**: ${boostLevel}`, inline: true }
        )
        .setFooter({ text: `ID: ${message.guild.id} • Créé le ${new Date(message.guild.createdTimestamp).toLocaleDateString()}` })
        .setTimestamp();

      return message.reply({ embeds: [statsEmbed] });
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la commande vc:', error);
      return message.reply('Une erreur est survenue lors de la récupération des statistiques du serveur.');
    }
  }
}; 