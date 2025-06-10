module.exports = {
  name: 'serveraudit',
  description: 'Affiche les dernières actions du journal d\'audit du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('VIEW_AUDIT_LOG')) {
      return message.reply('Vous n\'avez pas la permission de voir le journal d\'audit.');
    }

    try {
      const auditLogs = await message.guild.fetchAuditLogs({ limit: 10 });
      if (auditLogs.entries.size === 0) {
        return message.reply('Aucune action récente dans le journal d\'audit.');
      }

      const actionTypes = {
        GUILD_UPDATE: 'Modification du serveur',
        CHANNEL_CREATE: 'Création de salon',
        CHANNEL_UPDATE: 'Modification de salon',
        CHANNEL_DELETE: 'Suppression de salon',
        CHANNEL_OVERWRITE_CREATE: 'Création de permission',
        CHANNEL_OVERWRITE_UPDATE: 'Modification de permission',
        CHANNEL_OVERWRITE_DELETE: 'Suppression de permission',
        MEMBER_KICK: 'Expulsion de membre',
        MEMBER_BAN: 'Bannissement de membre',
        MEMBER_UNBAN: 'Débannissement de membre',
        MEMBER_UPDATE: 'Modification de membre',
        MEMBER_ROLE_UPDATE: 'Modification de rôle',
        MEMBER_MOVE: 'Déplacement de membre',
        MEMBER_DISCONNECT: 'Déconnexion de membre',
        BOT_ADD: 'Ajout de bot',
        ROLE_CREATE: 'Création de rôle',
        ROLE_UPDATE: 'Modification de rôle',
        ROLE_DELETE: 'Suppression de rôle',
        INVITE_CREATE: 'Création d\'invitation',
        INVITE_UPDATE: 'Modification d\'invitation',
        INVITE_DELETE: 'Suppression d\'invitation',
        WEBHOOK_CREATE: 'Création de webhook',
        WEBHOOK_UPDATE: 'Modification de webhook',
        WEBHOOK_DELETE: 'Suppression de webhook',
        EMOJI_CREATE: 'Création d\'emoji',
        EMOJI_UPDATE: 'Modification d\'emoji',
        EMOJI_DELETE: 'Suppression d\'emoji',
        MESSAGE_DELETE: 'Suppression de message',
        MESSAGE_BULK_DELETE: 'Suppression en masse de messages',
        MESSAGE_PIN: 'Épinglage de message',
        MESSAGE_UNPIN: 'Désépinglage de message',
        INTEGRATION_CREATE: 'Création d\'intégration',
        INTEGRATION_UPDATE: 'Modification d\'intégration',
        INTEGRATION_DELETE: 'Suppression d\'intégration'
      };

      const auditList = auditLogs.entries.map(entry => {
        const executor = entry.executor ? entry.executor.tag : 'Inconnu';
        const target = entry.target ? entry.target.tag || entry.target.name || 'Inconnu' : 'Inconnu';
        const action = actionTypes[entry.action] || entry.action;
        const reason = entry.reason || 'Aucune raison spécifiée';

        return `**Action:** ${action}\n` +
          `Exécuté par: ${executor}\n` +
          `Cible: ${target}\n` +
          `Raison: ${reason}\n` +
          `Date: <t:${Math.floor(entry.createdTimestamp / 1000)}:F>`;
      });

      const embed = {
        title: `📋 Journal d'audit de ${message.guild.name}`,
        description: auditList.join('\n\n'),
        color: 0x00ff00,
        timestamp: new Date(),
        footer: {
          text: `Dernières 10 actions`
        }
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la récupération du journal d\'audit.');
    }
  }
}; 