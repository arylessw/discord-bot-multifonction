const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'unbanall',
  description: 'Débannit tous les utilisateurs bannis du serveur',
  async execute(message, args, client) {
    // Vérifier si l'utilisateur a la permission de bannir
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('Vous n\'avez pas la permission de débannir des membres.');
    }

    // Vérifier si le bot a la permission de bannir
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('Je n\'ai pas la permission de débannir des membres.');
    }

    try {
      // Récupérer tous les bans
      const bans = await message.guild.bans.fetch();
      
      if (bans.size === 0) {
        return message.reply('Il n\'y a aucun utilisateur banni sur ce serveur.');
      }

      // Envoyer un message de confirmation
      const confirmMessage = await message.reply(`Êtes-vous sûr de vouloir débannir ${bans.size} utilisateurs ? Répondez par "oui" pour confirmer.`);

      // Attendre la confirmation
      const filter = m => m.author.id === message.author.id && m.content.toLowerCase() === 'oui';
      const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });

      if (!collected.first()) {
        return message.reply('Commande annulée.');
      }

      // Débannir tous les utilisateurs
      let successCount = 0;
      let failCount = 0;

      for (const [id, ban] of bans) {
        try {
          await message.guild.members.unban(id);
          successCount++;
        } catch (error) {
          console.error(`Erreur lors du débannissement de ${id}:`, error);
          failCount++;
        }
      }

      // Envoyer le résultat
      await message.reply(`Opération terminée !\n✅ ${successCount} utilisateurs ont été débannis\n❌ ${failCount} échecs`);

    } catch (error) {
      console.error('Erreur lors de la commande unbanall:', error);
      message.reply('Une erreur est survenue lors de l\'exécution de la commande.');
    }
  }
}; 