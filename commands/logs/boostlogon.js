const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'boostlogon',
  description: 'Active les logs de boost du serveur',
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
      if (!config[message.guild.id].boostLogChannel) {
        return message.reply('❌ Le canal de logs de boost n\'est pas configuré. Utilisez `autoconfiglog` pour configurer les logs.');
      }

      const boostChannel = message.guild.channels.cache.get(config[message.guild.id].boostLogChannel);
      if (!boostChannel) {
        return message.reply('❌ Le canal de logs de boost n\'existe plus. Utilisez `autoconfiglog` pour reconfigurer les logs.');
      }

      // Activer les logs de boost
      config[message.guild.id].boostLogEnabled = true;

      // Sauvegarder la configuration
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      const embed = new MessageEmbed()
        .setTitle('✅ Logs de boost activés')
        .setDescription('Les logs de boost sont maintenant activés.')
        .addField('Canal de logs', boostChannel.toString())
        .setColor(0x00ff00)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de l\'activation des logs de boost:', error);
      message.reply('❌ Une erreur est survenue lors de l\'activation des logs de boost.');
    }
  }
};
