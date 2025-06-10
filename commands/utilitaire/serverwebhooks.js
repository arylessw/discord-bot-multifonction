module.exports = {
  name: 'serverwebhooks',
  description: 'Affiche la liste des webhooks du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('MANAGE_WEBHOOKS')) {
      return message.reply('Vous n\'avez pas la permission de voir les webhooks.');
    }

    try {
      const webhooks = await message.guild.fetchWebhooks();
      if (webhooks.size === 0) {
        return message.reply('Ce serveur n\'a pas de webhooks.');
      }

      const webhookList = webhooks.map(webhook => {
        const channel = webhook.channel ? webhook.channel.name : 'Inconnu';
        const creator = webhook.owner ? webhook.owner.tag : 'Inconnu';
        const type = webhook.type === 'Incoming' ? 'Entrant' : 'Sortant';
        const avatar = webhook.avatarURL({ dynamic: true, size: 1024 });

        return `**${webhook.name}**\n` +
          `ID: ${webhook.id}\n` +
          `Type: ${type}\n` +
          `Salon: ${channel}\n` +
          `Créé par: ${creator}\n` +
          `Créé le: <t:${Math.floor(webhook.createdTimestamp / 1000)}:F>\n` +
          `Token: ${webhook.token ? '`' + webhook.token + '`' : 'Non disponible'}`;
      });

      const embed = {
        title: `🔗 Webhooks de ${message.guild.name}`,
        description: webhookList.join('\n\n'),
        color: 0x00ff00,
        timestamp: new Date(),
        footer: {
          text: `Total: ${webhooks.size} webhooks`
        }
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la récupération des webhooks.');
    }
  }
}; 