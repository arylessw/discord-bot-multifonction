const fs = require('fs');
const path = require('path');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'backuplist',
  description: 'Afficher la liste des sauvegardes',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    const backupDir = path.join(__dirname, '../../backups');
    const serverBackupDir = path.join(backupDir, 'servers');
    const emojiBackupDir = path.join(backupDir, 'emojis');

    try {
      if (!args[0]) {
        return message.reply(
          'Commandes disponibles:\n' +
          '`backuplist server` - Afficher la liste des sauvegardes de serveurs\n' +
          '`backuplist emojis` - Afficher la liste des sauvegardes d\'emojis'
        );
      }

      const type = args[0].toLowerCase();
      let backupDir;
      let title;

      switch (type) {
        case 'server':
          backupDir = serverBackupDir;
          title = 'Liste des sauvegardes de serveurs';
          break;
        case 'emojis':
          backupDir = emojiBackupDir;
          title = 'Liste des sauvegardes d\'emojis';
          break;
        default:
          return message.reply('Type de sauvegarde invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }

      // Vérifier si le dossier existe
      if (!fs.existsSync(backupDir)) {
        return message.reply('Aucune sauvegarde n\'a été trouvée.');
      }

      // Lire les fichiers de sauvegarde
      const files = fs.readdirSync(backupDir);
      if (files.length === 0) {
        return message.reply('Aucune sauvegarde n\'a été trouvée.');
      }

      // Créer l'embed avec la liste des sauvegardes
      const embed = new MessageEmbed()
        .setColor('#00ff00')
        .setTitle(title)
        .setDescription('Voici la liste des sauvegardes disponibles :')
        .setFooter({ text: `Demandé par ${message.author.tag}` })
        .setTimestamp();

      // Ajouter chaque sauvegarde à l'embed
      for (const file of files) {
        if (file.endsWith('.json')) {
          const backupPath = path.join(backupDir, file);
          const stats = fs.statSync(backupPath);
          const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

          let description = '';
          if (type === 'server') {
            description = `Serveur: ${backupData.name}\n` +
                         `Créé le: ${new Date(backupData.createdAt).toLocaleString()}\n` +
                         `Salons: ${backupData.channels.text.length + backupData.channels.voice.length}\n` +
                         `Rôles: ${backupData.roles.length}\n` +
                         `Emojis: ${backupData.emojis.length}`;
          } else {
            description = `Serveur: ${backupData.server}\n` +
                         `Créé le: ${new Date(backupData.createdAt).toLocaleString()}\n` +
                         `Emojis: ${backupData.emojis.length}`;
          }

          embed.addField(
            file.replace('.json', ''),
            description,
            false
          );
        }
      }

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de l\'affichage de la liste des sauvegardes:', error);
      message.reply('❌ Une erreur est survenue lors de l\'affichage de la liste.');
    }
  }
}; 