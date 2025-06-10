module.exports = {
  name: 'serverboost',
  description: 'Affiche les informations sur les boosts du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    try {
      const guild = message.guild;
      const boostLevel = guild.premiumTier;
      const boostCount = guild.premiumSubscriptionCount;
      const boosters = guild.members.cache.filter(member => member.premiumSince);

      const boostLevelInfo = {
        0: {
          name: 'Niveau 0',
          description: 'Aucun boost',
          benefits: [
            'Qualité audio standard',
            'Limite de 50 emojis',
            'Limite de 100kb pour les fichiers'
          ]
        },
        1: {
          name: 'Niveau 1',
          description: '7 boosts',
          benefits: [
            'Qualité audio 128kbps',
            'Limite de 100 emojis',
            'Limite de 8MB pour les fichiers',
            'Icône animée du serveur',
            'URL personnalisée'
          ]
        },
        2: {
          name: 'Niveau 2',
          description: '14 boosts',
          benefits: [
            'Qualité audio 256kbps',
            'Limite de 150 emojis',
            'Limite de 50MB pour les fichiers',
            'Icône animée du serveur',
            'URL personnalisée',
            'Bannière animée',
            'Arrière-plan de salon personnalisé'
          ]
        },
        3: {
          name: 'Niveau 3',
          description: '30 boosts',
          benefits: [
            'Qualité audio 384kbps',
            'Limite de 500 emojis',
            'Limite de 100MB pour les fichiers',
            'Icône animée du serveur',
            'URL personnalisée',
            'Bannière animée',
            'Arrière-plan de salon personnalisé',
            'Badge de serveur personnalisé',
            'Limite de 500 salons'
          ]
        }
      };

      const currentLevel = boostLevelInfo[boostLevel];
      const nextLevel = boostLevelInfo[boostLevel + 1];
      const boostersList = boosters.map(booster => {
        const boostTime = Math.floor(booster.premiumSinceTimestamp / 1000);
        return `**${booster.user.tag}**\n` +
          `Booste depuis: <t:${boostTime}:F>`;
      });

      const embed = {
        title: `🚀 Boosts de ${guild.name}`,
        fields: [
          {
            name: '📊 Statistiques',
            value: `Niveau actuel: ${currentLevel.name}\n` +
              `Nombre de boosts: ${boostCount}\n` +
              `Boosts nécessaires pour le niveau suivant: ${nextLevel ? nextLevel.description : 'Maximum atteint'}`,
            inline: false
          },
          {
            name: '✨ Avantages actuels',
            value: currentLevel.benefits.map(benefit => `• ${benefit}`).join('\n'),
            inline: false
          }
        ],
        color: 0x00ff00,
        timestamp: new Date()
      };

      if (nextLevel) {
        embed.fields.push({
          name: '🎯 Prochain niveau',
          value: nextLevel.benefits.map(benefit => `• ${benefit}`).join('\n'),
          inline: false
        });
      }

      if (boostersList.length > 0) {
        embed.fields.push({
          name: '👥 Boosteurs',
          value: boostersList.join('\n\n'),
          inline: false
        });
      }

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la récupération des informations sur les boosts.');
    }
  }
}; 