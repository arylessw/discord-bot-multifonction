module.exports = {
  name: 'moveall',
  description: 'Déplacer tous les membres d\'un salon vocal vers un autre',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const sourceChannel = message.mentions.channels.first();
    const targetChannel = message.mentions.channels.last();

    if (!sourceChannel || !targetChannel) {
      return message.reply('Veuillez mentionner le salon source et le salon cible.');
    }

    if (sourceChannel.type !== 'GUILD_VOICE' || targetChannel.type !== 'GUILD_VOICE') {
      return message.reply('Les deux salons doivent être des salons vocaux.');
    }

    if (sourceChannel.id === targetChannel.id) {
      return message.reply('Les salons source et cible doivent être différents.');
    }

    try {
      // Récupérer tous les membres dans le salon source
      const membersInSource = sourceChannel.members;

      if (membersInSource.size === 0) {
        return message.reply('Aucun membre n\'est actuellement dans le salon source.');
      }

      // Déplacer chaque membre
      let movedCount = 0;
      let failedCount = 0;

      for (const [id, member] of membersInSource) {
        try {
          await member.voice.setChannel(targetChannel);
          movedCount++;
        } catch (error) {
          console.error(`Erreur lors du déplacement de ${member.user.tag}:`, error);
          failedCount++;
        }
      }

      // Envoyer un message de confirmation
      message.reply(
        `✅ Déplacement terminé !\n` +
        `- ${movedCount} membre(s) déplacé(s) avec succès\n` +
        `- ${failedCount} échec(s)`
      );

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const embed = {
            title: '🎵 Membres déplacés',
            fields: [
              {
                name: '📌 Salon source',
                value: sourceChannel.toString(),
                inline: true
              },
              {
                name: '📌 Salon cible',
                value: targetChannel.toString(),
                inline: true
              },
              {
                name: '✅ Déplacés',
                value: `${movedCount} membre(s)`,
                inline: true
              },
              {
                name: '❌ Échecs',
                value: `${failedCount} membre(s)`,
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
      console.error('Erreur lors du déplacement des membres:', error);
      message.reply('❌ Une erreur est survenue lors du déplacement des membres.');
    }
  }
}; 