module.exports = {
  name: 'confighelp',
  description: 'Affiche l\'aide pour le système de configuration',
  async execute(message, args, client) {
    const embed = {
      title: '⚙️ Aide du Système de Configuration',
      description: 'Voici les commandes disponibles pour configurer le serveur :',
      fields: [
        {
          name: '📝 Paramètres de base',
          value: '`config prefix <préfixe>` - Définit le préfixe du bot\n' +
                 '`config language <fr/en>` - Définit la langue du bot\n' +
                 '`config timezone <fuseau>` - Définit le fuseau horaire\n' +
                 '`config color <#hex>` - Définit la couleur des embeds',
          inline: false
        },
        {
          name: '👋 Messages de bienvenue',
          value: '`config welcome #canal` - Définit le canal de bienvenue\n' +
                 '`config welcomemessage <message>` - Définit le message de bienvenue\n' +
                 '`config leavemessage <message>` - Définit le message de départ\n' +
                 'Variables disponibles: {user}, {server}, {count}',
          inline: false
        },
        {
          name: '👥 Rôles',
          value: '`config autorole @role` - Définit le rôle automatique\n' +
                 '`config modrole @role` - Définit le rôle modérateur\n' +
                 '`config adminrole @role` - Définit le rôle admin\n' +
                 '`config mutedrole @role` - Définit le rôle muet',
          inline: false
        },
        {
          name: '📊 Modération',
          value: '`config logchannel #canal` - Définit le canal de logs\n' +
                 '`config maxwarnings <nombre>` - Définit le nombre max d\'avertissements',
          inline: false
        },
        {
          name: '🛡️ Protection',
          value: '`config antispam <on/off> [messages] [temps] [punition]` - Configure l\'anti-spam\n' +
                 '`config antilink <on/off> [punition]` - Configure l\'anti-liens\n' +
                 '`config antiinvite <on/off> [punition]` - Configure l\'anti-invitations',
          inline: false
        },
        {
          name: '⚠️ Important',
          value: '• Seuls les administrateurs peuvent utiliser ces commandes\n' +
                 '• Les messages de bienvenue supportent des variables\n' +
                 '• Les punitions peuvent être: delete, warn, mute, kick, ban\n' +
                 '• Utilisez `config` sans arguments pour voir la configuration actuelle',
          inline: false
        }
      ],
      color: 0x00ff00,
      timestamp: new Date(),
      footer: {
        text: 'Système de Configuration'
      }
    };

    message.reply({ embeds: [embed] });
  }
}; 