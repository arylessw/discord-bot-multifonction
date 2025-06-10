const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'role',
  description: 'Gérer les rôles des membres',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    if (args.length < 3) {
      return message.reply(
        'Veuillez spécifier une action (add/remove), un membre et un rôle.\n' +
        'Utilisation: `!role <add/remove> <@membre> <@rôle>`'
      );
    }

    const action = args[0].toLowerCase();
    if (!['add', 'remove'].includes(action)) {
      return message.reply('L\'action doit être "add" ou "remove".');
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Veuillez mentionner un membre.');
    }

    const role = message.mentions.roles.first();
    if (!role) {
      return message.reply('Veuillez mentionner un rôle.');
    }

    try {
      if (action === 'add') {
        if (member.roles.cache.has(role.id)) {
          return message.reply('Ce membre possède déjà ce rôle.');
        }
        await member.roles.add(role, `Rôle ajouté par ${message.author.tag}`);
        message.reply(`✅ Le rôle ${role} a été ajouté à ${member}.`);
      } else {
        if (!member.roles.cache.has(role.id)) {
          return message.reply('Ce membre ne possède pas ce rôle.');
        }
        await member.roles.remove(role, `Rôle retiré par ${message.author.tag}`);
        message.reply(`✅ Le rôle ${role} a été retiré de ${member}.`);
      }

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const logEmbed = {
            title: action === 'add' ? '➕ Rôle ajouté' : '➖ Rôle retiré',
            fields: [
              {
                name: '👤 Membre',
                value: member.toString(),
                inline: true
              },
              {
                name: '🎭 Rôle',
                value: role.toString(),
                inline: true
              },
              {
                name: '👮 Modérateur',
                value: message.author.toString(),
                inline: true
              }
            ],
            color: action === 'add' ? 0x00ff00 : 0xff0000,
            timestamp: new Date()
          };
          logChannel.send({ embeds: [logEmbed] });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la gestion du rôle:', error);
      message.reply('❌ Une erreur est survenue lors de la gestion du rôle.');
    }
  }
}; 