const fs = require('fs');
const path = require('path');
const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'backup',
  description: 'Créer une sauvegarde du serveur ou des emojis',
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
      // Créer les dossiers de sauvegarde s'ils n'existent pas
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      if (!fs.existsSync(serverBackupDir)) {
        fs.mkdirSync(serverBackupDir, { recursive: true });
      }
      if (!fs.existsSync(emojiBackupDir)) {
        fs.mkdirSync(emojiBackupDir, { recursive: true });
      }

      if (!args[0]) {
        return message.reply(
          'Commandes disponibles:\n' +
          '`backup server <nom>` - Créer une sauvegarde du serveur\n' +
          '`backup emojis <nom>` - Créer une sauvegarde des emojis'
        );
      }

      const type = args[0].toLowerCase();
      const name = args[1] || `${message.guild.name}_${Date.now()}`;

      switch (type) {
        case 'server': {
          const backupPath = path.join(serverBackupDir, `${name}.json`);
          
          // Vérifier si une sauvegarde avec ce nom existe déjà
          if (fs.existsSync(backupPath)) {
            return message.reply('Une sauvegarde avec ce nom existe déjà. Veuillez choisir un autre nom.');
          }

          // Créer la sauvegarde du serveur
          const serverData = {
            name: message.guild.name,
            icon: message.guild.iconURL(),
            banner: message.guild.bannerURL(),
            splash: message.guild.splashURL(),
            description: message.guild.description,
            createdAt: message.guild.createdAt,
            channels: {
              categories: message.guild.channels.cache.filter(c => c.type === 'GUILD_CATEGORY').map(c => ({
                name: c.name,
                position: c.position,
                permissionOverwrites: c.permissionOverwrites.cache.map(p => ({
                  id: p.id,
                  type: p.type,
                  allow: p.allow.toArray(),
                  deny: p.deny.toArray()
                }))
              })),
              text: message.guild.channels.cache.filter(c => c.type === 'GUILD_TEXT').map(c => ({
                name: c.name,
                type: c.type,
                topic: c.topic,
                nsfw: c.nsfw,
                position: c.position,
                parent: c.parent?.name,
                permissionOverwrites: c.permissionOverwrites.cache.map(p => ({
                  id: p.id,
                  type: p.type,
                  allow: p.allow.toArray(),
                  deny: p.deny.toArray()
                }))
              })),
              voice: message.guild.channels.cache.filter(c => c.type === 'GUILD_VOICE').map(c => ({
                name: c.name,
                type: c.type,
                bitrate: c.bitrate,
                userLimit: c.userLimit,
                position: c.position,
                parent: c.parent?.name,
                permissionOverwrites: c.permissionOverwrites.cache.map(p => ({
                  id: p.id,
                  type: p.type,
                  allow: p.allow.toArray(),
                  deny: p.deny.toArray()
                }))
              }))
            },
            roles: message.guild.roles.cache.map(r => ({
              name: r.name,
              color: r.color,
              hoist: r.hoist,
              position: r.position,
              permissions: r.permissions.toArray(),
              mentionable: r.mentionable
            })),
            emojis: message.guild.emojis.cache.map(e => ({
              name: e.name,
              url: e.url
            }))
          };

          fs.writeFileSync(backupPath, JSON.stringify(serverData, null, 2));
          message.reply(`✅ La sauvegarde du serveur a été créée avec succès sous le nom "${name}"`);
          break;
        }

        case 'emojis': {
          const backupPath = path.join(emojiBackupDir, `${name}.json`);
          
          // Vérifier si une sauvegarde avec ce nom existe déjà
          if (fs.existsSync(backupPath)) {
            return message.reply('Une sauvegarde avec ce nom existe déjà. Veuillez choisir un autre nom.');
          }

          // Créer la sauvegarde des emojis
          const emojiData = {
            server: message.guild.name,
            createdAt: new Date(),
            emojis: message.guild.emojis.cache.map(e => ({
              name: e.name,
              url: e.url,
              animated: e.animated
            }))
          };

          fs.writeFileSync(backupPath, JSON.stringify(emojiData, null, 2));
          message.reply(`✅ La sauvegarde des emojis a été créée avec succès sous le nom "${name}"`);
          break;
        }

        default:
          message.reply('Type de sauvegarde invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la création de la sauvegarde:', error);
      message.reply('❌ Une erreur est survenue lors de la création de la sauvegarde.');
    }
  }
}; 