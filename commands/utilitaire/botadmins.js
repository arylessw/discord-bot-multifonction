const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'botadmins',
  description: 'Affiche la liste des administrateurs du bot',
  async execute(message, args, client) {
    const ownersPath = path.join(__dirname, '../../data/owners.json');
    const owners = JSON.parse(fs.readFileSync(ownersPath, 'utf8'));

    if (owners.owners.length === 0) {
      return message.reply('Aucun administrateur n\'est configuré pour le bot.');
    }

    const adminList = await Promise.all(owners.owners.map(async (id) => {
      const user = await client.users.fetch(id).catch(() => null);
      return user ? {
        name: user.tag,
        id: user.id,
        createdAt: user.createdAt
      } : null;
    }));

    const embed = {
      title: 'Liste des Administrateurs du Bot',
      description: adminList.filter(admin => admin).map(admin => 
        `**${admin.name}**\n` +
        `ID: ${admin.id}\n` +
        `Compte créé le : <t:${Math.floor(admin.createdAt.getTime() / 1000)}:F>\n`
      ).join('\n'),
      color: 0x00ff00,
      timestamp: new Date()
    };

    message.reply({ embeds: [embed] });
  }
}; 