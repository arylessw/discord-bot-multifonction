const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'settings',
  description: 'Affiche les paramètres des logs du serveur',
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

      // Créer l'embed des paramètres
      const embed = new MessageEmbed()
        .setTitle('⚙️ Paramètres des logs')
        .setDescription('Voici les paramètres actuels des logs du serveur.')
        .addField('Logs de modération', config[message.guild.id].modLogEnabled ? `✅ Activé\nCanal: <#${config[message.guild.id].modLogChannel}>` : '❌ Désactivé', true)
        .addField('Logs de messages', config[message.guild.id].messageLogEnabled ? `✅ Activé\nCanal: <#${config[message.guild.id].messageLogChannel}>` : '❌ Désactivé', true)
        .addField('Logs vocaux', config[message.guild.id].voiceLogEnabled ? `✅ Activé\nCanal: <#${config[message.guild.id].voiceLogChannel}>` : '❌ Désactivé', true)
        .addField('Logs de rôles', config[message.guild.id].roleLogEnabled ? `✅ Activé\nCanal: <#${config[message.guild.id].roleLogChannel}>` : '❌ Désactivé', true)
        .addField('Logs de boost', config[message.guild.id].boostLogEnabled ? `✅ Activé\nCanal: <#${config[message.guild.id].boostLogChannel}>` : '❌ Désactivé', true)
        .addField('Logs de raid', config[message.guild.id].raidLogEnabled ? `✅ Activé\nCanal: <#${config[message.guild.id].raidLogChannel}>` : '❌ Désactivé', true)
        .addField('Logs d\'arrivée', config[message.guild.id].joinLogEnabled ? `✅ Activé\nCanal: <#${config[message.guild.id].joinLogChannel}>` : '❌ Désactivé', true)
        .addField('Logs de départ', config[message.guild.id].leaveLogEnabled ? `✅ Activé\nCanal: <#${config[message.guild.id].leaveLogChannel}>` : '❌ Désactivé', true);

      // Ajouter les paramètres du modmail s'ils existent
      if (config[message.guild.id].modmail) {
        embed.addField('Modmail', config[message.guild.id].modmail.enabled ? `✅ Activé\nCatégorie: <#${config[message.guild.id].modmail.category}>\nCanal de logs: <#${config[message.guild.id].modmail.logChannel}>\nRôle staff: <@&${config[message.guild.id].modmail.staffRole}>` : '❌ Désactivé');
      }

      // Ajouter les paramètres des embeds de boost s'ils existent
      if (config[message.guild.id].boostEmbed) {
        embed.addField('Embeds de boost', `Titre: ${config[message.guild.id].boostEmbed.title}\nDescription: ${config[message.guild.id].boostEmbed.description}\nCouleur: ${config[message.guild.id].boostEmbed.color}\nMiniature: ${config[message.guild.id].boostEmbed.thumbnail ? '✅' : '❌'}`);
      }

      embed.setColor(0x00ff00)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de l\'affichage des paramètres des logs:', error);
      message.reply('❌ Une erreur est survenue lors de l\'affichage des paramètres des logs.');
    }
  }
};
