const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'helptype',
  description: 'Afficher l\'aide sur les types de commandes',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    const configDir = path.join(__dirname, '../../config');
    const configFile = path.join(configDir, 'server_config.json');

    try {
      // Charger la configuration existante
      let config = {};
      if (fs.existsSync(configFile)) {
        config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      }

      // Vérifier si des types sont configurés pour ce serveur
      if (!config[message.guild.id] || !config[message.guild.id].commandTypes || Object.keys(config[message.guild.id].commandTypes).length === 0) {
        return message.reply('Aucun type de commande n\'est configuré sur ce serveur.');
      }

      // Créer l'embed avec la liste des types
      const embed = {
        color: parseInt('00ff00', 16),
        title: 'Types de commandes',
        description: 'Voici la liste des types de commandes configurés sur ce serveur :',
        fields: [],
        footer: {
          text: 'Utilisez ces types pour catégoriser vos commandes'
        }
      };

      // Ajouter chaque type dans un champ
      for (const [type, commands] of Object.entries(config[message.guild.id].commandTypes)) {
        embed.fields.push({
          name: type,
          value: commands.map(cmd => `\`${cmd}\``).join(', ') || 'Aucune commande',
          inline: false
        });
      }

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de l\'affichage des types de commandes:', error);
      message.reply('❌ Une erreur est survenue lors de l\'affichage des types de commandes.');
    }
  }
};
