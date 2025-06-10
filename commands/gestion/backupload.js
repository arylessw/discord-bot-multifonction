const fs = require('fs');
const path = require('path');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'backupload',
  description: 'Charger une sauvegarde',
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
          '`backupload server <nom>` - Charger une sauvegarde de serveur\n' +
          '`backupload emojis <nom>` - Charger une sauvegarde d\'emojis'
        );
      }

      const type = args[0].toLowerCase();
      const name = args[1];

      if (!name) {
        return message.reply('Veuillez spécifier le nom de la sauvegarde à charger.');
      }

      switch (type) {
        case 'server': {
          const backupPath = path.join(serverBackupDir, `${name}.json`);
          
          if (!fs.existsSync(backupPath)) {
            return message.reply('Cette sauvegarde n\'existe pas.');
          }

          // Demander confirmation
          const confirmMessage = await message.reply(
            `Êtes-vous sûr de vouloir charger la sauvegarde "${name}" ?\n` +
            'Cette action va remplacer la configuration actuelle du serveur.\n' +
            'Répondez avec "oui" pour confirmer.'
          );

          try {
            const collected = await message.channel.awaitMessages({
              filter: m => m.author.id === message.author.id && m.content.toLowerCase() === 'oui',
              max: 1,
              time: 30000,
              errors: ['time']
            });

            const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

            // Mettre à jour le nom du serveur
            await message.guild.setName(backupData.name);

            // Mettre à jour l'icône si disponible
            if (backupData.icon) {
              await message.guild.setIcon(backupData.icon);
            }

            // Mettre à jour la bannière si disponible
            if (backupData.banner) {
              await message.guild.setBanner(backupData.banner);
            }

            // Mettre à jour le splash si disponible
            if (backupData.splash) {
              await message.guild.setSplash(backupData.splash);
            }

            // Mettre à jour la description si disponible
            if (backupData.description) {
              await message.guild.setDescription(backupData.description);
            }

            // Supprimer tous les salons existants
            await Promise.all(message.guild.channels.cache.map(channel => channel.delete()));

            // Créer les catégories
            for (const category of backupData.channels.categories) {
              await message.guild.channels.create(category.name, {
                type: 'GUILD_CATEGORY',
                position: category.position,
                permissionOverwrites: category.permissionOverwrites
              });
            }

            // Créer les salons textuels
            for (const channel of backupData.channels.text) {
              const parent = message.guild.channels.cache.find(c => 
                c.type === 'GUILD_CATEGORY' && c.name === channel.parent
              );
              await message.guild.channels.create(channel.name, {
                type: 'GUILD_TEXT',
                topic: channel.topic,
                nsfw: channel.nsfw,
                position: channel.position,
                parent: parent?.id,
                permissionOverwrites: channel.permissionOverwrites
              });
            }

            // Créer les salons vocaux
            for (const channel of backupData.channels.voice) {
              const parent = message.guild.channels.cache.find(c => 
                c.type === 'GUILD_CATEGORY' && c.name === channel.parent
              );
              await message.guild.channels.create(channel.name, {
                type: 'GUILD_VOICE',
                bitrate: channel.bitrate,
                userLimit: channel.userLimit,
                position: channel.position,
                parent: parent?.id,
                permissionOverwrites: channel.permissionOverwrites
              });
            }

            // Supprimer tous les rôles existants
            await Promise.all(message.guild.roles.cache
              .filter(role => role.name !== '@everyone')
              .map(role => role.delete()));

            // Créer les rôles
            for (const role of backupData.roles) {
              await message.guild.roles.create({
                name: role.name,
                color: role.color,
                hoist: role.hoist,
                position: role.position,
                permissions: role.permissions,
                mentionable: role.mentionable
              });
            }

            message.reply(`✅ La sauvegarde "${name}" a été chargée avec succès.`);
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
            `Êtes-vous sûr de vouloir charger la sauvegarde d'emojis "${name}" ?\n` +
            'Cette action va remplacer les emojis actuels du serveur.\n' +
            'Répondez avec "oui" pour confirmer.'
          );

          try {
            const collected = await message.channel.awaitMessages({
              filter: m => m.author.id === message.author.id && m.content.toLowerCase() === 'oui',
              max: 1,
              time: 30000,
              errors: ['time']
            });

            const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

            // Supprimer tous les emojis existants
            await Promise.all(message.guild.emojis.cache.map(emoji => emoji.delete()));

            // Créer les emojis
            for (const emoji of backupData.emojis) {
              try {
                await message.guild.emojis.create(emoji.url, emoji.name);
              } catch (error) {
                console.error(`Erreur lors de la création de l'emoji ${emoji.name}:`, error);
              }
            }

            message.reply(`✅ La sauvegarde d'emojis "${name}" a été chargée avec succès.`);
          } catch (error) {
            message.reply('❌ Opération annulée ou délai dépassé.');
          }
          break;
        }

        default:
          message.reply('Type de sauvegarde invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la sauvegarde:', error);
      message.reply('❌ Une erreur est survenue lors du chargement de la sauvegarde.');
    }
  }
}; 