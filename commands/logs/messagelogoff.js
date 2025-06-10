const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'messagelogoff',
  description: 'Désactive les logs de messages du serveur',
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

      // Désactiver les logs de messages
      config[message.guild.id].messageLogEnabled = false;

      // Sauvegarder la configuration
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      const embed = new MessageEmbed()
        .setTitle('✅ Logs de messages désactivés')
        .setDescription('Les logs de messages sont maintenant désactivés.')
        .setColor(0xff0000)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la désactivation des logs de messages:', error);
      message.reply('❌ Une erreur est survenue lors de la désactivation des logs de messages.');
    }
  }
};
