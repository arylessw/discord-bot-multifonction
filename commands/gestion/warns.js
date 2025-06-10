module.exports = {
  name: 'warns',
  description: 'Affiche les avertissements d\'un membre',
  category: 'Gestion',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply('Vous n\'avez pas la permission de modérer les membres.');
    }

    const member = message.mentions.members.first() || 
      message.guild.members.cache.get(args[0]) ||
      message.guild.members.cache.find(m => m.user.tag.toLowerCase() === args.join(' ').toLowerCase());

    if (!member) {
      return message.reply('Veuillez mentionner un membre valide.');
    }

    try {
      const config = require('../../config/server_config.json');
      const warns = config[message.guild.id]?.warns?.[member.id] || [];

      const embed = {
        title: '📋 Avertissements',
        fields: [
          {
            name: '👤 Membre',
            value: `${member.user.tag} (${member.id})`,
            inline: true
          },
          {
            name: '📊 Total',
            value: `${warns.length} avertissement(s)`,
            inline: true
          }
        ],
        color: 0xff9900,
        timestamp: new Date()
      };

      if (warns.length > 0) {
        const warnList = warns.map((warn, index) => {
          const date = new Date(warn.date).toLocaleString();
          const moderator = message.guild.members.cache.get(warn.moderator)?.user.tag || 'Inconnu';
          return `${index + 1}. **${warn.reason}**\n└ Par ${moderator} le ${date}`;
        }).join('\n\n');

        embed.fields.push({
          name: '📝 Liste des avertissements',
          value: warnList,
          inline: false
        });
      } else {
        embed.fields.push({
          name: '📝 Liste des avertissements',
          value: 'Aucun avertissement',
          inline: false
        });
      }

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de l\'affichage des avertissements:', error);
      message.reply('Une erreur est survenue lors de l\'affichage des avertissements.');
    }
  }
}; 