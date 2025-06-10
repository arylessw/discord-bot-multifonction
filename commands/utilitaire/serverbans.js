module.exports = {
  name: 'serverbans',
  description: 'Affiche la liste des bannissements du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('BAN_MEMBERS')) {
      return message.reply('Vous n\'avez pas la permission de voir la liste des bannissements.');
    }

    try {
      const bans = await message.guild.bans.fetch();
      if (bans.size === 0) {
        return message.reply('Ce serveur n\'a pas de bannissements.');
      }

      const banList = bans.map(ban => {
        const reason = ban.reason || 'Aucune raison spécifiée';
        return `**${ban.user.tag}**\n` +
          `ID: ${ban.user.id}\n` +
          `Raison: ${reason}`;
      });

      const embed = {
        title: `🔨 Bannissements de ${message.guild.name}`,
        description: banList.join('\n\n'),
        color: 0x00ff00,
        timestamp: new Date(),
        footer: {
          text: `Total: ${bans.size} bannissements`
        }
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la récupération des bannissements.');
    }
  }
}; 