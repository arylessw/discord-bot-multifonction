const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'raidlogon',
  description: 'Active les logs de raid du serveur',
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
      if (!config[message.guild.id].raidLogChannel) {
        return message.reply('❌ Le canal de logs de raid n\'est pas configuré. Utilisez `autoconfiglog` pour configurer les logs.');
      }

      const raidChannel = message.guild.channels.cache.get(config[message.guild.id].raidLogChannel);
      if (!raidChannel) {
        return message.reply('❌ Le canal de logs de raid n\'existe plus. Utilisez `autoconfiglog` pour reconfigurer les logs.');
      }

      // Activer les logs de raid
      config[message.guild.id].raidLogEnabled = true;

      // Sauvegarder la configuration
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      const embed = new MessageEmbed()
        .setTitle('✅ Logs de raid activés')
        .setDescription('Les logs de raid sont maintenant activés.')
        .addField('Canal de logs', raidChannel.toString())
        .setColor(0x00ff00)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de l\'activation des logs de raid:', error);
      message.reply('❌ Une erreur est survenue lors de l\'activation des logs de raid.');
    }
  }
};
