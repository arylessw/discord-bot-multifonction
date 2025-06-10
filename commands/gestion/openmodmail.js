const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'openmodmail',
  description: 'Ouvre un ticket modmail manuellement avec un membre du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Veuillez mentionner un utilisateur.');
    }

    try {
      // Vérifier si un ticket existe déjà
      const existingTicket = message.guild.channels.cache.find(
        channel => channel.name === `modmail-${user.id}` && channel.type === 'GUILD_TEXT'
      );

      if (existingTicket) {
        return message.reply(`Un ticket existe déjà avec ${user.tag} (${existingTicket}).`);
      }

      // Créer le canal du ticket
      const ticketChannel = await message.guild.channels.create(`modmail-${user.id}`, {
        type: 'GUILD_TEXT',
        parent: message.guild.channels.cache.find(c => c.name === 'tickets' && c.type === 'GUILD_CATEGORY'),
        permissionOverwrites: [
          {
            id: message.guild.id,
            deny: ['VIEW_CHANNEL']
          },
          {
            id: user.id,
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
          },
          {
            id: message.guild.roles.cache.find(r => r.name === 'Modérateur')?.id,
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
          }
        ],
        reason: `Ticket modmail ouvert par ${message.author.tag} pour ${user.tag}`
      });

      // Créer l'embed de bienvenue
      const embed = new MessageEmbed()
        .setTitle('📨 Ticket Modmail')
        .setDescription(
          `Bienvenue ${user} !\n` +
          'Ce canal est maintenant ouvert pour la communication avec l\'équipe de modération.\n' +
          'Veuillez décrire votre problème ou votre question.\n\n' +
          'Pour fermer ce ticket, utilisez la commande `!close`.'
        )
        .setColor(0x00ff00)
        .setTimestamp()
        .setFooter({ text: `Ticket ouvert par ${message.author.tag}` });

      // Envoyer l'embed et ajouter les boutons
      const ticketMessage = await ticketChannel.send({ embeds: [embed] });
      await ticketMessage.react('🔒');

      // Envoyer un message de confirmation
      message.reply(`✅ Ticket modmail ouvert avec ${user.tag} (${ticketChannel}).`);

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const logEmbed = {
            title: '📨 Ticket Modmail ouvert',
            fields: [
              {
                name: '📌 Canal',
                value: ticketChannel.toString(),
                inline: true
              },
              {
                name: '👤 Membre',
                value: user.toString(),
                inline: true
              },
              {
                name: '👮 Modérateur',
                value: message.author.toString(),
                inline: true
              }
            ],
            color: 0x00ff00,
            timestamp: new Date()
          };
          logChannel.send({ embeds: [logEmbed] });
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du ticket modmail:', error);
      message.reply('❌ Une erreur est survenue lors de l\'ouverture du ticket.');
    }
  }
}; 