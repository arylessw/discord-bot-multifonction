const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'boostembedtest',
  description: 'Teste l\'apparence des embeds de boost',
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

      if (!config[message.guild.id]?.boostLogChannel) {
        return message.reply('❌ Le canal de logs de boost n\'est pas configuré. Utilisez `autoconfiglog` pour configurer les logs.');
      }

      const boostChannel = message.guild.channels.cache.get(config[message.guild.id].boostLogChannel);
      if (!boostChannel) {
        return message.reply('❌ Le canal de logs de boost n\'existe plus. Utilisez `autoconfiglog` pour reconfigurer les logs.');
      }

      // Créer un embed de test pour le boost
      const boostEmbed = new MessageEmbed()
        .setTitle('✨ Nouveau boost !')
        .setDescription(`${message.author} a boosté le serveur !`)
        .addField('Niveau de boost', 'Niveau 1', true)
        .addField('Boosts totaux', '1', true)
        .setColor(0xf47fff)
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      // Envoyer l'embed de test
      await boostChannel.send({ embeds: [boostEmbed] });

      message.reply('✅ Un embed de test a été envoyé dans le canal de logs de boost.');
    } catch (error) {
      console.error('Erreur lors du test des embeds de boost:', error);
      message.reply('❌ Une erreur est survenue lors du test des embeds de boost.');
    }
  }
};
