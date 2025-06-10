const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'autoconfiglog',
  description: 'Configure automatiquement tous les logs du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    try {
      // Créer la catégorie "LOGS" si elle n'existe pas
      let logsCategory = message.guild.channels.cache.find(c => c.name === 'LOGS' && c.type === 'GUILD_CATEGORY');
      if (!logsCategory) {
        logsCategory = await message.guild.channels.create('LOGS', {
          type: 'GUILD_CATEGORY',
          permissionOverwrites: [
            {
              id: message.guild.id,
              deny: ['VIEW_CHANNEL']
            },
            {
              id: message.guild.roles.cache.find(r => r.name === 'Modérateur')?.id,
              allow: ['VIEW_CHANNEL']
            }
          ]
        });
      }

      // Créer les canaux de logs
      const logChannels = {
        'mod-logs': '📝 Modération',
        'message-logs': '💬 Messages',
        'voice-logs': '🎤 Vocal',
        'role-logs': '👥 Rôles',
        'boost-logs': '✨ Boost',
        'raid-logs': '🛡️ Raid',
        'join-logs': '📥 Arrivées',
        'leave-logs': '📤 Départs'
      };

      const createdChannels = [];
      for (const [channelName, channelTopic] of Object.entries(logChannels)) {
        let channel = message.guild.channels.cache.find(c => c.name === channelName && c.type === 'GUILD_TEXT');
        if (!channel) {
          channel = await message.guild.channels.create(channelName, {
            type: 'GUILD_TEXT',
            parent: logsCategory.id,
            topic: channelTopic,
            permissionOverwrites: [
              {
                id: message.guild.id,
                deny: ['VIEW_CHANNEL']
              },
              {
                id: message.guild.roles.cache.find(r => r.name === 'Modérateur')?.id,
                allow: ['VIEW_CHANNEL']
              }
            ]
          });
          createdChannels.push(channel);
        }
      }

      // Mettre à jour la configuration
      const configPath = path.join(__dirname, '../../config/server_config.json');
      let config = {};
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }

      if (!config[message.guild.id]) {
        config[message.guild.id] = {};
      }

      // Configurer les logs
      config[message.guild.id].modLogChannel = message.guild.channels.cache.find(c => c.name === 'mod-logs')?.id;
      config[message.guild.id].messageLogChannel = message.guild.channels.cache.find(c => c.name === 'message-logs')?.id;
      config[message.guild.id].voiceLogChannel = message.guild.channels.cache.find(c => c.name === 'voice-logs')?.id;
      config[message.guild.id].roleLogChannel = message.guild.channels.cache.find(c => c.name === 'role-logs')?.id;
      config[message.guild.id].boostLogChannel = message.guild.channels.cache.find(c => c.name === 'boost-logs')?.id;
      config[message.guild.id].raidLogChannel = message.guild.channels.cache.find(c => c.name === 'raid-logs')?.id;
      config[message.guild.id].joinLogChannel = message.guild.channels.cache.find(c => c.name === 'join-logs')?.id;
      config[message.guild.id].leaveLogChannel = message.guild.channels.cache.find(c => c.name === 'leave-logs')?.id;

      // Sauvegarder la configuration
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      // Envoyer un message de confirmation
      const embed = new MessageEmbed()
        .setTitle('✅ Configuration des logs terminée')
        .setDescription('Tous les canaux de logs ont été configurés avec succès.')
        .addField('Canaux créés', createdChannels.map(c => c.toString()).join('\n') || 'Aucun nouveau canal créé')
        .addField('Catégorie', logsCategory.toString())
        .setColor(0x00ff00)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la configuration des logs:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration des logs.');
    }
  }
};
