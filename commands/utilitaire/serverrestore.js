const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'serverrestore',
  description: 'Restaure les paramètres du serveur à partir d\'une sauvegarde',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('Vous n\'avez pas la permission de restaurer les paramètres du serveur.');
    }

    if (!args[0]) {
      return message.reply('Veuillez spécifier l\'ID de la sauvegarde à restaurer.');
    }

    try {
      const backupDir = path.join(__dirname, '../../backups');
      const backupFile = path.join(backupDir, `${message.guild.id}_${args[0]}.json`);

      if (!fs.existsSync(backupFile)) {
        return message.reply('Sauvegarde introuvable.');
      }

      const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));

      // Restaurer les paramètres de base
      await message.guild.setName(backupData.name);
      if (backupData.description) {
        await message.guild.setDescription(backupData.description);
      }
      await message.guild.setVerificationLevel(backupData.verificationLevel);
      await message.guild.setExplicitContentFilter(backupData.explicitContentFilter);
      await message.guild.setDefaultMessageNotifications(backupData.defaultMessageNotifications);

      // Restaurer les rôles
      for (const roleData of backupData.roles) {
        const existingRole = message.guild.roles.cache.find(r => r.name === roleData.name);
        if (existingRole) {
          await existingRole.edit({
            name: roleData.name,
            color: roleData.color,
            hoist: roleData.hoist,
            position: roleData.position,
            permissions: roleData.permissions,
            mentionable: roleData.mentionable
          });
        } else {
          await message.guild.roles.create({
            name: roleData.name,
            color: roleData.color,
            hoist: roleData.hoist,
            position: roleData.position,
            permissions: roleData.permissions,
            mentionable: roleData.mentionable
          });
        }
      }

      // Restaurer les salons
      for (const channelData of backupData.channels) {
        const existingChannel = message.guild.channels.cache.find(c => c.name === channelData.name);
        if (existingChannel) {
          await existingChannel.edit({
            name: channelData.name,
            position: channelData.position,
            parent: channelData.parent
          });
        } else {
          await message.guild.channels.create({
            name: channelData.name,
            type: channelData.type,
            position: channelData.position,
            parent: channelData.parent
          });
        }
      }

      const embed = {
        title: '✅ Restauration terminée',
        description: 'Les paramètres du serveur ont été restaurés avec succès.',
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la restauration des paramètres du serveur.');
    }
  }
}; 