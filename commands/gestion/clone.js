module.exports = {
  name: 'clone',
  description: 'Cloner un salon',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('Veuillez mentionner un salon à cloner.');
    }

    try {
      // Créer le nouveau salon
      const newChannel = await channel.clone({
        name: `${channel.name}-clone`,
        position: channel.position + 1,
        reason: `Cloné par ${message.author.tag}`
      });

      // Copier les permissions
      await newChannel.lockPermissions();

      // Envoyer un message de confirmation
      message.reply(`✅ Le salon ${channel} a été cloné avec succès en ${newChannel}`);

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const embed = {
            title: '📋 Salon cloné',
            fields: [
              {
                name: '📌 Salon original',
                value: channel.toString(),
                inline: true
              },
              {
                name: '📌 Nouveau salon',
                value: newChannel.toString(),
                inline: true
              },
              {
                name: '👤 Modérateur',
                value: message.author.toString(),
                inline: true
              }
            ],
            color: 0x00ff00,
            timestamp: new Date()
          };
          logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Erreur lors du clonage du salon:', error);
      message.reply('❌ Une erreur est survenue lors du clonage du salon.');
    }
  }
}; 