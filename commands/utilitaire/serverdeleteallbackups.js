const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'serverdeleteallbackups',
  description: 'Supprime toutes les sauvegardes du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('Vous n\'avez pas la permission de supprimer les sauvegardes.');
    }

    try {
      const backupDir = path.join(__dirname, '../../backups');
      if (!fs.existsSync(backupDir)) {
        return message.reply('Aucune sauvegarde n\'a été trouvée.');
      }

      const files = fs.readdirSync(backupDir);
      const serverBackups = files.filter(file => file.startsWith(`${message.guild.id}_`) && file.endsWith('.json'));

      if (serverBackups.length === 0) {
        return message.reply('Aucune sauvegarde n\'a été trouvée pour ce serveur.');
      }

      let deletedCount = 0;
      for (const file of serverBackups) {
        fs.unlinkSync(path.join(backupDir, file));
        deletedCount++;
      }

      const embed = {
        title: '🗑️ Sauvegardes supprimées',
        description: `${deletedCount} sauvegarde(s) ont été supprimée(s) avec succès.`,
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la suppression des sauvegardes.');
    }
  }
}; 