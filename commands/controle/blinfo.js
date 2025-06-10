const fs = require("fs");
const path = require("path");
const { requireOwner } = require("../../utils/ownerCheck.js");

module.exports = {
  name: 'blinfo',
  description: 'Affiche les informations d\'un utilisateur blacklisté',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    if (!args[0]) {
      return message.reply('Veuillez mentionner un utilisateur ou fournir son ID.');
    }

    const userId = args[0].replace(/[<@!>]/g, '');
    const user = await client.users.fetch(userId).catch(() => null);
    
    if (!user) {
      return message.reply('Utilisateur non trouvé.');
    }

    const blacklistPath = path.join(__dirname, '../../data/blacklist.json');
    const blacklist = JSON.parse(fs.readFileSync(blacklistPath, 'utf8'));

    if (!blacklist.users.includes(userId)) {
      return message.reply('Cet utilisateur n\'est pas blacklisté.');
    }

    const embed = {
      title: 'Informations Blacklist',
      fields: [
        {
          name: 'Utilisateur',
          value: `${user.tag} (${user.id})`,
          inline: true
        },
        {
          name: 'Compte créé le',
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
          inline: true
        },
        {
          name: 'Avatar',
          value: user.displayAvatarURL({ dynamic: true }),
          inline: true
        }
      ],
      color: 0xff0000,
      thumbnail: {
        url: user.displayAvatarURL({ dynamic: true })
      },
      timestamp: new Date()
    };

    message.reply({ embeds: [embed] });
  }
}; 