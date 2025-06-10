const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'rolelogon',
  description: 'Active les logs de rôles du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    try {
      const configPath = path.join(__dirname, '../../config/server_config.json');
      let config = {};
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }

      if (!config[message.guild.id]) {
        config[message.guild.id] = {};
      }

      // Vérifier si le canal de logs existe
      if (!config[message.guild.id].roleLogChannel) {
        return message.reply('❌ Le canal de logs de rôles n\'est pas configuré. Utilisez `autoconfiglog` pour configurer les logs.');
      }

      const roleChannel = message.guild.channels.cache.get(config[message.guild.id].roleLogChannel);
      if (!roleChannel) {
        return message.reply('❌ Le canal de logs de rôles n\'existe plus. Utilisez `autoconfiglog` pour reconfigurer les logs.');
      }

      // Activer les logs de rôles
      config[message.guild.id].roleLogEnabled = true;

      // Sauvegarder la configuration
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      const embed = new MessageEmbed()
        .setTitle('✅ Logs de rôles activés')
        .setDescription('Les logs de rôles sont maintenant activés.')
        .addField('Canal de logs', roleChannel.toString())
        .setColor(0x00ff00)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de l\'activation des logs de rôles:', error);
      message.reply('❌ Une erreur est survenue lors de l\'activation des logs de rôles.');
    }
  }
};
