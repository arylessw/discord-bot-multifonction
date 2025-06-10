const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'boostembedon',
  description: 'Active les embeds de boost personnalisés',
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

      // Activer les embeds de boost
      config[message.guild.id].boostEmbedEnabled = true;

      // Sauvegarder la configuration
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      const embed = new MessageEmbed()
        .setTitle('✅ Embeds de boost activés')
        .setDescription('Les embeds de boost personnalisés sont maintenant activés.')
        .setColor(0x00ff00)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de l\'activation des embeds de boost:', error);
      message.reply('❌ Une erreur est survenue lors de l\'activation des embeds de boost.');
    }
  }
};
