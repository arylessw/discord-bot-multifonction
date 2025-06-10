const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'clearcustoms',
  description: 'Supprimer toutes les listes personnalisées',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const configDir = path.join(__dirname, '../../config');
    const configFile = path.join(configDir, 'server_config.json');

    try {
      // Créer le dossier config s'il n'existe pas
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      // Charger la configuration existante
      let config = {};
      if (fs.existsSync(configFile)) {
        config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      }

      // Initialiser la configuration du serveur si elle n'existe pas
      if (!config[message.guild.id]) {
        config[message.guild.id] = {};
      }

      // Supprimer toutes les listes personnalisées
      if (config[message.guild.id].customlists) {
        delete config[message.guild.id].customlists;
      }

      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
      message.reply('✅ Toutes les listes personnalisées ont été supprimées.');

    } catch (error) {
      console.error('Erreur lors de la suppression des listes personnalisées:', error);
      message.reply('❌ Une erreur est survenue lors de la suppression.');
    }
  }
};
