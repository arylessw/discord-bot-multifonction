const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'autorole',
  description: 'Définir le rôle automatique pour les nouveaux membres',
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
          autoRole: null
        };
      }

      if (!args[0]) {
        const currentRole = config[message.guild.id].autoRole 
          ? `<@&${config[message.guild.id].autoRole}>` 
          : 'Aucun rôle défini';
        return message.reply(`Le rôle automatique actuel est : ${currentRole}`);
      }

      if (args[0].toLowerCase() === 'remove') {
        config[message.guild.id].autoRole = null;
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
        return message.reply('✅ Le rôle automatique a été supprimé.');
      }

      const role = message.mentions.roles.first();
      if (!role) {
        return message.reply('Veuillez mentionner un rôle valide.');
      }

      // Vérifier si le bot a la permission de gérer les rôles
      if (!message.guild.members.me.permissions.has('ManageRoles')) {
        return message.reply('Je n\'ai pas la permission de gérer les rôles.');
      }

      // Vérifier si le rôle est plus haut que le rôle du bot
      if (role.position >= message.guild.members.me.roles.highest.position) {
        return message.reply('Je ne peux pas attribuer ce rôle car il est plus haut que mon rôle le plus élevé.');
      }

      config[message.guild.id].autoRole = role.id;
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

      message.reply(`✅ Le rôle automatique a été défini sur ${role.name}`);
    } catch (error) {
      console.error('Erreur lors de la modification du rôle automatique:', error);
      message.reply('❌ Une erreur est survenue lors de la modification du rôle automatique.');
    }
  }
}; 