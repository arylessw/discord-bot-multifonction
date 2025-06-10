const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'helpalias',
  description: 'Afficher l\'aide sur les alias',
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

      // Vérifier si des alias sont configurés pour ce serveur
      if (!config[message.guild.id] || !config[message.guild.id].aliases || Object.keys(config[message.guild.id].aliases).length === 0) {
        return message.reply('Aucun alias n\'est configuré sur ce serveur.');
      }

      // Créer l'embed avec la liste des alias
      const embed = {
        color: parseInt('00ff00', 16),
        title: 'Liste des alias',
        description: 'Voici la liste des alias configurés sur ce serveur :',
        fields: [],
        footer: {
          text: 'Utilisez ces alias comme des commandes normales'
        }
      };

      // Ajouter chaque alias dans un champ
      for (const [alias, command] of Object.entries(config[message.guild.id].aliases)) {
        embed.fields.push({
          name: alias,
          value: `Commande : \`${command}\``,
          inline: true
        });
      }

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de l\'affichage des alias:', error);
      message.reply('❌ Une erreur est survenue lors de l\'affichage des alias.');
    }
  }
};
