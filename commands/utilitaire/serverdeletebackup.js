const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'serverdeletebackup',
  description: 'Supprime une sauvegarde spécifique',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('Vous n\'avez pas la permission de supprimer les sauvegardes.');
    }

    if (!args[0]) {
      return message.reply('Veuillez spécifier l\'ID de la sauvegarde à supprimer.');
    }

    try {
      const backupDir = path.join(__dirname, '../../backups');
      const backupFile = path.join(backupDir, `${message.guild.id}_${args[0]}.json`);

      if (!fs.existsSync(backupFile)) {
        return message.reply('Sauvegarde introuvable.');
      }

      fs.unlinkSync(backupFile);

      const embed = {
        title: '🗑️ Sauvegarde supprimée',
        description: `La sauvegarde avec l'ID ${args[0]} a été supprimée avec succès.`,
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la suppression de la sauvegarde.');
    }
  }
}; 