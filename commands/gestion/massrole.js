module.exports = {
  name: 'massrole',
  description: 'Ajoute un rôle à tous les membres',
  category: 'Gestion',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('ManageRoles')) {
      return message.reply('Vous n\'avez pas la permission de gérer les rôles.');
    }

    const role = message.mentions.roles.first() || 
      message.guild.roles.cache.get(args[0]) ||
      message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(' ').toLowerCase());

    if (!role) {
      return message.reply('Veuillez mentionner un rôle valide.');
    }

    if (role.managed) {
      return message.reply('Ce rôle est géré par une intégration et ne peut pas être modifié.');
    }

    if (role.position >= message.member.roles.highest.position) {
      return message.reply('Vous ne pouvez pas gérer un rôle supérieur ou égal au vôtre.');
    }

    const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';

    try {
      const members = message.guild.members.cache.filter(m => 
        !m.roles.cache.has(role.id) && 
        m.roles.highest.position < role.position &&
        !m.user.bot
      );

      if (members.size === 0) {
        return message.reply('Aucun membre ne peut recevoir ce rôle.');
      }

      const loadingMessage = await message.reply(`⏳ Ajout du rôle en cours... (0/${members.size})`);
      let successCount = 0;
      let failCount = 0;

      for (const [id, member] of members) {
        try {
          await member.roles.add(role, reason);
          successCount++;
        } catch (error) {
          failCount++;
        }
        await loadingMessage.edit(`⏳ Ajout du rôle en cours... (${successCount + failCount}/${members.size})`);
      }

      const embed = {
        title: '✅ Rôle ajouté en masse',
        fields: [
          {
            name: '🎭 Rôle',
            value: role.toString(),
            inline: true
          },
          {
            name: '👮 Modérateur',
            value: message.author.tag,
            inline: true
          },
          {
            name: '📊 Résultats',
            value: `✅ ${successCount} succès\n❌ ${failCount} échecs`,
            inline: true
          },
          {
            name: '📝 Raison',
            value: reason,
            inline: false
          }
        ],
        color: 0x00ff00,
        timestamp: new Date()
      };

      await loadingMessage.edit({ content: null, embeds: [embed] });

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout en masse du rôle:', error);
      message.reply('Une erreur est survenue lors de l\'ajout en masse du rôle.');
    }
  }
}; 