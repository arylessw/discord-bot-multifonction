const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'delperm',
  description: 'Supprimer une permission',
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
        config[message.guild.id] = {
          permissions: {}
        };
      }

      if (!config[message.guild.id].permissions) {
        config[message.guild.id].permissions = {};
      }

      if (!args[0]) {
        const permissions = Object.entries(config[message.guild.id].permissions)
          .map(([perm, roles]) => `${perm}: ${roles.map(r => `<@&${r}>`).join(', ')}`)
          .join('\n');

        return message.reply(
          'Permissions actuelles:\n' +
          (permissions || 'Aucune permission configurée') + '\n\n' +
          'Commandes disponibles:\n' +
          '`delperm <permission>` - Supprimer une permission'
        );
      }

      const permission = args[0].toLowerCase();

      if (!config[message.guild.id].permissions[permission]) {
        return message.reply('Cette permission n\'existe pas.');
      }

      delete config[message.guild.id].permissions[permission];
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
      message.reply(`✅ La permission "${permission}" a été supprimée.`);

    } catch (error) {
      console.error('Erreur lors de la suppression de la permission:', error);
      message.reply('❌ Une erreur est survenue lors de la suppression de la permission.');
    }
  }
};
