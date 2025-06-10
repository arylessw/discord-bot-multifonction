module.exports = {
  name: 'serverintegrations',
  description: 'Affiche la liste des intégrations du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('MANAGE_GUILD')) {
      return message.reply('Vous n\'avez pas la permission de voir les intégrations.');
    }

    try {
      const integrations = await message.guild.fetchIntegrations();
      if (integrations.size === 0) {
        return message.reply('Ce serveur n\'a pas d\'intégrations.');
      }

      const integrationList = integrations.map(integration => {
        const type = {
          twitch: 'Twitch',
          youtube: 'YouTube',
          discord: 'Discord',
          guild_subscription: 'Abonnement serveur',
          guild_application_command: 'Commande d\'application',
          guild_application_command_permissions: 'Permissions de commande'
        }[integration.type] || integration.type;

        const enabled = integration.enabled ? 'Oui' : 'Non';
        const syncing = integration.syncing ? 'Oui' : 'Non';
        const expireBehavior = {
          0: 'Supprimer le rôle',
          1: 'Garder le rôle'
        }[integration.expireBehavior] || 'Inconnu';

        return `**${integration.name}**\n` +
          `Type: ${type}\n` +
          `ID: ${integration.id}\n` +
          `Activée: ${enabled}\n` +
          `Synchronisation: ${syncing}\n` +
          `Compte: ${integration.account ? integration.account.name : 'Inconnu'}\n` +
          `Expire le: ${integration.expireGracePeriod ? `${integration.expireGracePeriod} jours` : 'Jamais'}\n` +
          `Comportement d'expiration: ${expireBehavior}`;
      });

      const embed = {
        title: `🔌 Intégrations de ${message.guild.name}`,
        description: integrationList.join('\n\n'),
        color: 0x00ff00,
        timestamp: new Date(),
        footer: {
          text: `Total: ${integrations.size} intégrations`
        }
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la récupération des intégrations.');
    }
  }
}; 