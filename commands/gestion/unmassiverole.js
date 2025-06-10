module.exports = {
  name: 'unmassiverole',
  description: 'Retire un rôle de plusieurs membres',
  category: 'Gestion',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('ManageRoles')) {
      return message.reply('Vous n\'avez pas la permission de gérer les rôles.');
    }

    if (args.length < 2) {
      return message.reply('Usage: !unmassiverole <@rôle> <@membre1> [@membre2] [@membre3] ...');
    }

    const role = message.mentions.roles.first();
    if (!role) {
      return message.reply('Veuillez mentionner un rôle.');
    }

    if (!role.editable) {
      return message.reply('Je ne peux pas gérer ce rôle.');
    }

    if (message.member.roles.highest.position <= role.position) {
      return message.reply('Vous ne pouvez pas gérer un rôle supérieur ou égal au vôtre.');
    }

    const members = message.mentions.members;
    if (members.size === 0) {
      return message.reply('Veuillez mentionner au moins un membre.');
    }

    const success = [];
    const failed = [];

    const loadingMessage = await message.reply('⏳ Retrait des rôles en cours...');

    for (const [, member] of members) {
      try {
        if (member.roles.cache.has(role.id)) {
          await member.roles.remove(role);
          success.push(member.user.tag);
        }
      } catch (error) {
        failed.push(member.user.tag);
        console.error(`Erreur lors du retrait du rôle de ${member.user.tag}:`, error);
      }
    }

    const embed = {
      title: '🎭 Rôles retirés en masse',
      fields: [
        {
          name: '🎨 Rôle',
          value: role.name,
          inline: true
        },
        {
          name: '👮 Modérateur',
          value: message.author.tag,
          inline: true
        }
      ],
      color: 0xff9900,
      timestamp: new Date()
    };

    if (success.length > 0) {
      embed.fields.push({
        name: '✅ Succès',
        value: success.join('\n'),
        inline: false
      });
    }

    if (failed.length > 0) {
      embed.fields.push({
        name: '❌ Échecs',
        value: failed.join('\n'),
        inline: false
      });
    }

    await loadingMessage.edit({ content: null, embeds: [embed] });

    // Envoyer dans le canal de logs si configuré
    const config = require('../../config/server_config.json');
    if (config[message.guild.id]?.logChannel) {
      const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
      if (logChannel) {
        logChannel.send({ embeds: [embed] });
      }
    }
  }
}; 