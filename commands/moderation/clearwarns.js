const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'clearwarns',
  description: 'Supprime les avertissements d\'un membre',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('MODERATE_MEMBERS')) {
      return message.reply('Vous n\'avez pas la permission de supprimer les avertissements.');
    }

    const member = message.mentions.members.first() || 
      message.guild.members.cache.get(args[0]) ||
      message.guild.members.cache.find(m => m.user.tag.toLowerCase() === args.join(' ').toLowerCase());

    if (!member) {
      return message.reply('Membre non trouvé.');
    }

    const warnsPath = path.join(__dirname, '../../data/warns.json');
    let warns = {};
    
    try {
      if (fs.existsSync(warnsPath)) {
        warns = JSON.parse(fs.readFileSync(warnsPath, 'utf8'));
      }

      if (!warns[message.guild.id] || !warns[message.guild.id][member.id] || warns[message.guild.id][member.id].length === 0) {
        return message.reply(`${member.user.tag} n'a aucun avertissement à supprimer.`);
      }

      delete warns[message.guild.id][member.id];
      fs.writeFileSync(warnsPath, JSON.stringify(warns, null, 2));

      const embed = {
        title: 'Avertissements supprimés',
        description: `Les avertissements de ${member.user.tag} ont été supprimés.`,
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la suppression des avertissements.');
    }
  }
}; 