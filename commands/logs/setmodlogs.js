const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'setmodlogs',
  description: 'Configure le canal de logs de modération',
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

      // Vérifier si un canal est mentionné
      const channel = message.mentions.channels.first();
      if (!channel) {
        return message.reply('❌ Veuillez mentionner un canal pour les logs de modération.');
      }

      // Configurer le canal de logs
      config[message.guild.id].modLogChannel = channel.id;

      // Sauvegarder la configuration
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      const embed = new MessageEmbed()
        .setTitle('✅ Canal de logs de modération configuré')
        .setDescription(`Le canal ${channel} a été configuré pour les logs de modération.`)
        .setColor(0x00ff00)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la configuration du canal de logs de modération:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration du canal de logs de modération.');
    }
  }
};
