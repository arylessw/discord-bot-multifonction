const { requireOwner } = require("../../utils/ownerCheck.js");

module.exports = {
  name: 'serverlist',
  description: 'Affiche la liste des serveurs où le bot est présent',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    const servers = client.guilds.cache.map(guild => ({
      name: guild.name,
      id: guild.id,
      memberCount: guild.memberCount,
      owner: guild.ownerId
    }));

    const embed = {
      title: 'Liste des Serveurs',
      description: servers.map(server => 
        `**${server.name}**\n` +
        `ID: ${server.id}\n` +
        `Membres: ${server.memberCount}\n` +
        `Propriétaire: <@${server.owner}>\n`
      ).join('\n'),
      color: 0x00ff00,
      timestamp: new Date()
    };

    message.reply({ embeds: [embed] });
  }
}; 