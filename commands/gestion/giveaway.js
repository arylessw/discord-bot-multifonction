const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'giveaway',
  description: 'Crée un giveaway',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    if (!args[0]) {
      return message.reply(
        'Utilisation: `giveaway <durée> <nombre_de_gagnants> <prix>`\n' +
        'Exemple: `giveaway 1d 1 Nitro`\n\n' +
        'Formats de durée supportés:\n' +
        '- `s` pour les secondes\n' +
        '- `m` pour les minutes\n' +
        '- `h` pour les heures\n' +
        '- `d` pour les jours'
      );
    }

    try {
      // Parser la durée
      const duration = args[0];
      const durationMatch = duration.match(/^(\d+)([smhd])$/);
      if (!durationMatch) {
        return message.reply('Format de durée invalide. Utilisez la commande sans arguments pour voir les formats supportés.');
      }

      const [, amount, unit] = durationMatch;
      let milliseconds;
      switch (unit) {
        case 's': milliseconds = amount * 1000; break;
        case 'm': milliseconds = amount * 60 * 1000; break;
        case 'h': milliseconds = amount * 60 * 60 * 1000; break;
        case 'd': milliseconds = amount * 24 * 60 * 60 * 1000; break;
      }

      // Parser le nombre de gagnants
      const winnerCount = parseInt(args[1]);
      if (isNaN(winnerCount) || winnerCount < 1) {
        return message.reply('Veuillez spécifier un nombre valide de gagnants.');
      }

      // Parser le prix
      const prize = args.slice(2).join(' ');
      if (!prize) {
        return message.reply('Veuillez spécifier un prix.');
      }

      // Calculer la date de fin
      const endTime = Date.now() + milliseconds;

      // Créer l'embed du giveaway
      const embed = new MessageEmbed()
        .setTitle('🎉 GIVEAWAY')
        .setDescription(
          `**Prix:** ${prize}\n` +
          `**Nombre de gagnants:** ${winnerCount}\n` +
          `**Temps restant:** <t:${Math.floor(endTime / 1000)}:R>\n\n` +
          'Réagissez avec 🎉 pour participer !'
        )
        .setColor(0x00ff00)
        .setTimestamp(endTime)
        .setFooter({ text: `Créé par ${message.author.tag}` });

      // Envoyer le giveaway
      const giveawayMessage = await message.channel.send({ embeds: [embed] });
      await giveawayMessage.react('🎉');

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const logEmbed = {
            title: '🎉 Giveaway créé',
            fields: [
              {
                name: '📝 Giveaway',
                value: `[Cliquez ici](${giveawayMessage.url})`,
                inline: true
              },
              {
                name: '🎁 Prix',
                value: prize,
                inline: true
              },
              {
                name: '🏆 Gagnants',
                value: `${winnerCount} gagnant(s)`,
                inline: true
              },
              {
                name: '⏱️ Durée',
                value: duration,
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
          logChannel.send({ embeds: [logEmbed] });
        }
      }

      // Supprimer le message de commande
      message.delete().catch(console.error);
    } catch (error) {
      console.error('Erreur lors de la création du giveaway:', error);
      message.reply('❌ Une erreur est survenue lors de la création du giveaway.');
    }
  }
}; 