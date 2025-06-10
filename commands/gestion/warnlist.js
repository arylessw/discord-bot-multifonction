const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'warnlist',
  description: 'Afficher la liste des avertissements d\'un membre',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Veuillez mentionner un membre.');
    }

    try {
      // Charger le fichier de warnings du serveur
      const warningsFile = path.join(__dirname, '../../warnings', `${message.guild.id}.json`);
      if (!fs.existsSync(warningsFile)) {
        return message.reply('Aucun avertissement n\'a été enregistré sur ce serveur.');
      }

      const warnings = JSON.parse(fs.readFileSync(warningsFile));
      if (!warnings[member.id] || warnings[member.id].length === 0) {
        return message.reply(`${member} n'a aucun avertissement.`);
      }

      // Créer l'embed avec la liste des avertissements
      const embed = new MessageEmbed()
        .setTitle(`⚠️ Avertissements de ${member.user.tag}`)
        .setColor(0xff0000)
        .setTimestamp()
        .setFooter({ text: `ID: ${member.id}` });

      warnings[member.id].forEach((warning, index) => {
        const moderator = message.guild.members.cache.get(warning.moderator);
        embed.addField(
          `Avertissement #${index + 1}`,
          `**Raison:** ${warning.reason}\n` +
          `**Modérateur:** ${moderator ? moderator.user.tag : 'Inconnu'}\n` +
          `**Date:** ${new Date(warning.date).toLocaleString()}`
        );
      });

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de l\'affichage des avertissements:', error);
      message.reply('❌ Une erreur est survenue lors de l\'affichage des avertissements.');
    }
  }
}; 