const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'backupdelete',
  description: 'Supprimer une sauvegarde',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const backupDir = path.join(__dirname, '../../backups');
    const serverBackupDir = path.join(backupDir, 'servers');
    const emojiBackupDir = path.join(backupDir, 'emojis');

    try {
      if (!args[0]) {
        return message.reply(
          'Commandes disponibles:\n' +
          '`backupdelete server <nom>` - Supprimer une sauvegarde du serveur\n' +
          '`backupdelete emojis <nom>` - Supprimer une sauvegarde des emojis'
        );
      }

      const type = args[0].toLowerCase();
      const name = args[1];

      if (!name) {
        return message.reply('Veuillez spécifier le nom de la sauvegarde à supprimer.');
      }

      switch (type) {
        case 'server': {
          const backupPath = path.join(serverBackupDir, `${name}.json`);
          
          if (!fs.existsSync(backupPath)) {
            return message.reply('Cette sauvegarde n\'existe pas.');
          }

          // Demander confirmation
          const confirmMessage = await message.reply(
            `Êtes-vous sûr de vouloir supprimer la sauvegarde "${name}" ?\n` +
            'Répondez avec "oui" pour confirmer.'
          );

          try {
            const collected = await message.channel.awaitMessages({
              filter: m => m.author.id === message.author.id && m.content.toLowerCase() === 'oui',
              max: 1,
              time: 30000,
              errors: ['time']
            });

            fs.unlinkSync(backupPath);
            message.reply(`✅ La sauvegarde "${name}" a été supprimée avec succès.`);
          } catch (error) {
            message.reply('❌ Opération annulée ou délai dépassé.');
          }
          break;
        }

        case 'emojis': {
          const backupPath = path.join(emojiBackupDir, `${name}.json`);
          
          if (!fs.existsSync(backupPath)) {
            return message.reply('Cette sauvegarde n\'existe pas.');
          }

          // Demander confirmation
          const confirmMessage = await message.reply(
            `Êtes-vous sûr de vouloir supprimer la sauvegarde "${name}" ?\n` +
            'Répondez avec "oui" pour confirmer.'
          );

          try {
            const collected = await message.channel.awaitMessages({
              filter: m => m.author.id === message.author.id && m.content.toLowerCase() === 'oui',
              max: 1,
              time: 30000,
              errors: ['time']
            });

            fs.unlinkSync(backupPath);
            message.reply(`✅ La sauvegarde "${name}" a été supprimée avec succès.`);
          } catch (error) {
            message.reply('❌ Opération annulée ou délai dépassé.');
          }
          break;
        }

        default:
          message.reply('Type de sauvegarde invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la sauvegarde:', error);
      message.reply('❌ Une erreur est survenue lors de la suppression de la sauvegarde.');
    }
  }
}; 