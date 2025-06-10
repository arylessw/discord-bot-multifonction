const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'messagelogon',
  description: 'Active les logs de messages du serveur',
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
      if (!config[message.guild.id].messageLogChannel) {
        return message.reply('❌ Le canal de logs de messages n\'est pas configuré. Utilisez `autoconfiglog` pour configurer les logs.');
      }

      const messageChannel = message.guild.channels.cache.get(config[message.guild.id].messageLogChannel);
      if (!messageChannel) {
        return message.reply('❌ Le canal de logs de messages n\'existe plus. Utilisez `autoconfiglog` pour reconfigurer les logs.');
      }

      // Activer les logs de messages
      config[message.guild.id].messageLogEnabled = true;

      // Sauvegarder la configuration
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      const embed = new MessageEmbed()
        .setTitle('✅ Logs de messages activés')
        .setDescription('Les logs de messages sont maintenant activés.')
        .addField('Canal de logs', messageChannel.toString())
        .setColor(0x00ff00)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de l\'activation des logs de messages:', error);
      message.reply('❌ Une erreur est survenue lors de l\'activation des logs de messages.');
    }
  }
};
