const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'add',
  description: 'Ajouter une permission',
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
          '`add <permission> <@role>` - Ajouter une permission'
        );
      }

      const permission = args[0].toLowerCase();
      const role = message.mentions.roles.first();

      if (!role) {
        return message.reply('Veuillez mentionner un rôle valide.');
      }

      if (!config[message.guild.id].permissions[permission]) {
        config[message.guild.id].permissions[permission] = [];
      }

      if (config[message.guild.id].permissions[permission].includes(role.id)) {
        return message.reply('Cette permission est déjà attribuée à ce rôle.');
      }

      config[message.guild.id].permissions[permission].push(role.id);
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
      message.reply(`✅ La permission "${permission}" a été ajoutée au rôle ${role.name}.`);

    } catch (error) {
      console.error('Erreur lors de l\'ajout de la permission:', error);
      message.reply('❌ Une erreur est survenue lors de l\'ajout de la permission.');
    }
  }
};
