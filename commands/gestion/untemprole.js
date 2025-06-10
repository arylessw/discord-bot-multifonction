module.exports = {
  name: 'untemprole',
  description: 'Retire un rôle temporaire d\'un membre',
  category: 'Gestion',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('ManageRoles')) {
      return message.reply('Vous n\'avez pas la permission de gérer les rôles.');
    }

    if (args.length < 2) {
      return message.reply('Usage: !untemprole <@membre> <@rôle>');
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Veuillez mentionner un membre.');
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

    if (!member.roles.cache.has(role.id)) {
      return message.reply('Ce membre n\'a pas ce rôle.');
    }

    try {
      await member.roles.remove(role);
      
      const embed = {
        title: '🎭 Rôle temporaire retiré',
        fields: [
          {
            name: '👤 Membre',
            value: `${member.user.tag} (${member.id})`,
            inline: true
          },
          {
            name: '👮 Modérateur',
            value: message.author.tag,
            inline: true
          },
          {
            name: '🎨 Rôle',
            value: role.name,
            inline: true
          }
        ],
        color: 0xff9900,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Erreur lors du retrait du rôle temporaire:', error);
      message.reply('Une erreur est survenue lors du retrait du rôle temporaire.');
    }
  }
}; 