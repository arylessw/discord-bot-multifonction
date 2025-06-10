module.exports = {
  name: 'bringall',
  description: 'Déplacer tous les membres en vocal vers un salon vocal',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const targetChannel = message.mentions.channels.first();
    if (!targetChannel) {
      return message.reply('Veuillez mentionner un salon vocal valide.');
    }

    if (targetChannel.type !== 'GUILD_VOICE') {
      return message.reply('Le salon mentionné doit être un salon vocal.');
    }

    try {
      // Récupérer tous les membres en vocal
      const membersInVoice = message.guild.members.cache.filter(member => 
        member.voice.channel && member.voice.channel.id !== targetChannel.id
      );

      if (membersInVoice.size === 0) {
        return message.reply('Aucun membre n\'est actuellement dans un salon vocal.');
      }

      // Déplacer chaque membre
      let movedCount = 0;
      let failedCount = 0;

      for (const [id, member] of membersInVoice) {
        try {
          await member.voice.setChannel(targetChannel);
          movedCount++;
        } catch (error) {
          console.error(`Erreur lors du déplacement de ${member.user.tag}:`, error);
          failedCount++;
        }
      }

      message.reply(
        `✅ Déplacement terminé !\n` +
        `- ${movedCount} membre(s) déplacé(s) avec succès\n` +
        `- ${failedCount} échec(s)`
      );
    } catch (error) {
      console.error('Erreur lors du déplacement des membres:', error);
      message.reply('❌ Une erreur est survenue lors du déplacement des membres.');
    }
  }
}; 