const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'logchannel',
  description: 'Configurer le canal de logs du serveur',
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
          logChannel: null
        };
      }

      if (!args[0]) {
        const currentChannel = config[message.guild.id].logChannel 
          ? `<#${config[message.guild.id].logChannel}>` 
          : 'Aucun canal défini';
        return message.reply(`Le canal de logs actuel est : ${currentChannel}`);
      }

      if (args[0].toLowerCase() === 'remove') {
        config[message.guild.id].logChannel = null;
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
        return message.reply('✅ Le canal de logs a été supprimé.');
      }

      const channel = message.mentions.channels.first();
      if (!channel) {
        return message.reply('Veuillez mentionner un canal valide.');
      }

      // Vérifier si le bot a les permissions nécessaires dans le canal
      const botMember = message.guild.members.me;
      const channelPerms = channel.permissionsFor(botMember);
      
      if (!channelPerms.has(['ViewChannel', 'SendMessages', 'EmbedLinks'])) {
        return message.reply('Je n\'ai pas les permissions nécessaires dans ce canal. J\'ai besoin des permissions : Voir le canal, Envoyer des messages et Intégrer des liens.');
      }

      config[message.guild.id].logChannel = channel.id;
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

      message.reply(`✅ Le canal de logs a été défini sur ${channel.name}`);
    } catch (error) {
      console.error('Erreur lors de la configuration du canal de logs:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
}; 