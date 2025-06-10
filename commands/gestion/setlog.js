module.exports = {
  name: 'setlog',
  description: 'Configure le canal de logs',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Cette commande doit être utilisée dans un serveur.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply({
        embeds: [{
          title: '❌ Permission manquante',
          description: 'Vous devez avoir la permission d\'administrateur pour utiliser cette commande.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
    if (!channel) {
      return message.reply({
        embeds: [{
          title: '❌ Canal non spécifié',
          description: 'Veuillez mentionner un canal ou fournir son ID.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    try {
      // Vérifier si le bot a les permissions nécessaires
      if (!channel.permissionsFor(message.guild.members.me).has(['ViewChannel', 'SendMessages', 'EmbedLinks'])) {
        return message.reply({
          embeds: [{
            title: '❌ Permissions manquantes',
            description: 'Je n\'ai pas les permissions nécessaires dans ce canal (Voir le canal, Envoyer des messages, Intégrer des liens).',
            color: 0xff0000,
            timestamp: new Date()
          }]
        });
      }

      // Charger ou créer la configuration
      const config = require('../../config/server_config.json');
      if (!config[message.guild.id]) {
        config[message.guild.id] = {};
      }

      // Mettre à jour la configuration
      config[message.guild.id].logChannel = channel.id;

      // Sauvegarder la configuration
      const fs = require('fs');
      fs.writeFileSync('./config/server_config.json', JSON.stringify(config, null, 2));

      // Envoyer un message de confirmation
      message.reply({
        embeds: [{
          title: '✅ Canal de logs configuré',
          description: `Le canal de logs a été configuré sur ${channel}.`,
          color: 0x00ff00,
          fields: [
            {
              name: '👤 Administrateur',
              value: message.author.tag,
              inline: true
            },
            {
              name: '📝 Canal',
              value: channel.toString(),
              inline: true
            }
          ],
          timestamp: new Date()
        }]
      });

      // Envoyer un message dans le nouveau canal de logs
      channel.send({
        embeds: [{
          title: '📝 Canal de logs configuré',
          description: 'Ce canal a été configuré comme canal de logs.',
          color: 0x00ff00,
          fields: [
            {
              name: '👤 Administrateur',
              value: message.author.tag,
              inline: true
            }
          ],
          timestamp: new Date()
        }]
      });
    } catch (error) {
      console.error('Erreur setlog:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la configuration du canal de logs.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 