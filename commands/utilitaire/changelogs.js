module.exports = {
  name: 'changelogs',
  description: 'Affiche les changements récents du bot',
  async execute(message, args, client) {
    const embed = {
      title: 'Changelogs',
      description: '**Dernières mises à jour :**\n\n' +
        '**Version 1.0.0**\n' +
        '• Système de commandes complet\n' +
        '• Gestion des owners\n' +
        '• Système de blacklist\n' +
        '• Configuration du bot\n' +
        '• Gestion des serveurs\n' +
        '• Commandes utilitaires\n' +
        '• Système de modération\n' +
        '• Système de logs\n' +
        '• Système de tickets\n' +
        '• Système de suggestions\n' +
        '• Système de giveaways\n' +
        '• Système de backup\n' +
        '• Système de modmail\n' +
        '• Système de rappels\n' +
        '• Système de rôles temporaires\n' +
        '• Système de vocaux temporaires\n' +
        '• Système de réactions automatiques\n' +
        '• Système de formulaires\n' +
        '• Système de boutons\n' +
        '• Système de menus de rôles\n' +
        '• Système de slowmode\n' +
        '• Système de suppression automatique\n' +
        '• Système de permissions\n' +
        '• Système de langues\n' +
        '• Système de thèmes\n' +
        '• Système de préfixes personnalisés\n' +
        '• Système de commandes personnalisées\n' +
        '• Système de commandes d\'alias\n' +
        '• Système de commandes de maintenance\n' +
        '• Système de commandes de statistiques\n' +
        '• Système de commandes de recherche\n' +
        '• Système de commandes de calcul\n' +
        '• Système de commandes de divertissement\n' +
        '• Système de commandes de modération avancées\n' +
        '• Système de commandes de gestion avancées\n' +
        '• Système de commandes de configuration avancées\n' +
        '• Système de commandes de logs avancées\n' +
        '• Système de commandes de tickets avancées\n' +
        '• Système de commandes de suggestions avancées\n' +
        '• Système de commandes de giveaways avancées\n' +
        '• Système de commandes de backup avancées\n' +
        '• Système de commandes de modmail avancées\n' +
        '• Système de commandes de rappels avancées\n' +
        '• Système de commandes de rôles temporaires avancées\n' +
        '• Système de commandes de vocaux temporaires avancées\n' +
        '• Système de commandes de réactions automatiques avancées\n' +
        '• Système de commandes de formulaires avancées\n' +
        '• Système de commandes de boutons avancées\n' +
        '• Système de commandes de menus de rôles avancées\n' +
        '• Système de commandes de slowmode avancées\n' +
        '• Système de commandes de suppression automatique avancées\n' +
        '• Système de commandes de permissions avancées\n' +
        '• Système de commandes de langues avancées\n' +
        '• Système de commandes de thèmes avancées\n' +
        '• Système de commandes de préfixes personnalisés avancées\n' +
        '• Système de commandes de commandes personnalisées avancées\n' +
        '• Système de commandes de commandes d\'alias avancées\n' +
        '• Système de commandes de maintenance avancées\n' +
        '• Système de commandes de statistiques avancées\n' +
        '• Système de commandes de recherche avancées\n' +
        '• Système de commandes de calcul avancées\n' +
        '• Système de commandes de divertissement avancées',
      color: 0x00ff00,
      timestamp: new Date()
    };

    message.reply({ embeds: [embed] });
  }
}; 