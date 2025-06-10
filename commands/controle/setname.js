const { requireOwner } = require("../../utils/ownerCheck.js");

module.exports = {
  name: 'setname',
  description: 'Change le nom du bot (réservé aux owners)',
  async execute(message, args, client) {
    // Vérifier que l'utilisateur est owner
    if (!requireOwner(message)) return;

    // Vérifier qu'un nom a été fourni
    if (!args.length) {
      return message.reply('❌ Veuillez spécifier un nouveau nom pour le bot.');
    }

    const newName = args.join(' ');

    // Vérifier la longueur du nom (Discord limite à 32 caractères)
    if (newName.length > 32) {
      return message.reply('❌ Le nom du bot ne peut pas dépasser 32 caractères.');
    }

    try {
      // Sauvegarder l'ancien nom pour le message de confirmation
      const oldName = client.user.username;

      // Changer le nom du bot
      await client.user.setUsername(newName);

      // Confirmer le changement
      message.reply({
        embeds: [{
          title: '✅ Nom modifié',
          description: `Le nom du bot a été changé avec succès.`,
          fields: [
            { name: 'Ancien nom', value: oldName, inline: true },
            { name: 'Nouveau nom', value: newName, inline: true }
          ],
          color: 0x00FF00,
          timestamp: new Date()
        }]
      });
    } catch (error) {
      console.error('Erreur lors du changement de nom:', error);
      
      // Gérer les erreurs spécifiques
      if (error.code === 50035) {
        return message.reply('❌ Discord n\'autorise pas ce nom. Veuillez en choisir un autre.');
      } else if (error.code === 429) {
        return message.reply('❌ Trop de changements récents. Veuillez réessayer plus tard (limite Discord).');
      }
      
      message.reply('❌ Une erreur est survenue lors du changement de nom du bot.');
    }
  }
}; 