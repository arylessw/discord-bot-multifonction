const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'autoreactlist',
  description: 'Afficher la liste des réactions automatiques sur le serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    const configDir = path.join(__dirname, '../../config');
    const configFile = path.join(configDir, 'server_config.json');

    try {
      // Vérifier si le fichier de configuration existe
      if (!fs.existsSync(configFile)) {
        return message.reply('Aucune réaction automatique n\'est configurée.');
      }

      // Charger la configuration
      const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

      // Vérifier si des réactions automatiques sont configurées pour ce serveur
      if (!config[message.guild.id] || !config[message.guild.id].autoReacts || 
          Object.keys(config[message.guild.id].autoReacts).length === 0) {
        return message.reply('Aucune réaction automatique n\'est configurée sur ce serveur.');
      }

      // Créer l'embed avec la liste des réactions automatiques
      const embed = {
        color: 0x00ff00,
        title: 'Liste des réactions automatiques',
        description: 'Voici la liste des réactions automatiques configurées sur ce serveur :',
        fields: [],
        footer: {
          text: `Demandé par ${message.author.tag}`
        },
        timestamp: new Date()
      };

      // Ajouter chaque canal et ses réactions à l'embed
      for (const [channelId, reactions] of Object.entries(config[message.guild.id].autoReacts)) {
        const channel = message.guild.channels.cache.get(channelId);
        if (channel) {
          embed.fields.push({
            name: `#${channel.name}`,
            value: reactions.map(emoji => emoji).join(', ') || 'Aucune réaction',
            inline: false
          });
        }
      }

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de l\'affichage des réactions automatiques:', error);
      message.reply('❌ Une erreur est survenue lors de l\'affichage de la liste.');
    }
  }
}; 