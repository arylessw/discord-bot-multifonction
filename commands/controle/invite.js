const { requireOwner } = require("../../utils/ownerCheck.js");

module.exports = {
  name: 'invite',
  description: 'Génère un lien d\'invitation du bot',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    const inviteLink = client.generateInvite({
      permissions: [
        'ADMINISTRATOR'
      ],
      scopes: ['bot']
    });

    const embed = {
      title: 'Lien d\'invitation du Bot',
      description: `[Cliquez ici pour inviter le bot](${inviteLink})`,
      color: 0x00ff00,
      timestamp: new Date()
    };

    message.reply({ embeds: [embed] });
  }
}; 