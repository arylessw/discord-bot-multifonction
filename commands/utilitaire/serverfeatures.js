module.exports = {
  name: 'serverfeatures',
  description: 'Affiche les fonctionnalités activées sur le serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    try {
      const features = message.guild.features;
      if (features.length === 0) {
        return message.reply('Ce serveur n\'a pas de fonctionnalités spéciales activées.');
      }

      const featureNames = {
        ANIMATED_BANNER: 'Bannière animée',
        ANIMATED_ICON: 'Icône animée',
        BANNER: 'Bannière',
        COMMERCE: 'Commerce',
        COMMUNITY: 'Communauté',
        DISCOVERABLE: 'Découvrable',
        FEATURABLE: 'Mise en avant',
        INVITE_SPLASH: 'Splash d\'invitation',
        MEMBER_VERIFICATION_GATE_ENABLED: 'Porte de vérification',
        MONETIZATION_ENABLED: 'Monétisation',
        MORE_STICKERS: 'Plus de stickers',
        NEWS: 'Salons d\'annonces',
        PARTNERED: 'Partenaire',
        PREVIEW_ENABLED: 'Aperçu',
        PRIVATE_THREADS: 'Threads privés',
        ROLE_ICONS: 'Icônes de rôles',
        SEVEN_DAY_THREAD_ARCHIVE: 'Archives de 7 jours',
        THREE_DAY_THREAD_ARCHIVE: 'Archives de 3 jours',
        TICKETED_EVENTS_ENABLED: 'Événements avec tickets',
        VANITY_URL: 'URL personnalisée',
        VERIFIED: 'Vérifié',
        VIP_REGIONS: 'Régions VIP',
        WELCOME_SCREEN_ENABLED: 'Écran de bienvenue'
      };

      const featureList = features.map(feature => {
        const name = featureNames[feature] || feature;
        return `• ${name}`;
      });

      const embed = {
        title: `✨ Fonctionnalités de ${message.guild.name}`,
        description: featureList.join('\n'),
        color: 0x00ff00,
        timestamp: new Date(),
        footer: {
          text: `Total: ${features.length} fonctionnalités`
        }
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la récupération des fonctionnalités.');
    }
  }
}; 