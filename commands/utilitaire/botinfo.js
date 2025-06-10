const { version } = require("discord.js");
const os = require("os");

module.exports = {
  name: 'botinfo',
  description: 'Affiche les informations détaillées du bot',
  async execute(message, args, client) {
    const uptime = client.uptime;
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

    const totalGuilds = client.guilds.cache.size;
    const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const totalChannels = client.channels.cache.size;

    const memoryUsage = process.memoryUsage();
    const ramUsage = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const totalRam = Math.round(os.totalmem() / 1024 / 1024);
    const freeRam = Math.round(os.freemem() / 1024 / 1024);

    const embed = {
      title: 'Informations sur le bot',
      thumbnail: {
        url: client.user.displayAvatarURL({ dynamic: true, size: 1024 })
      },
      fields: [
        {
          name: '👤 Informations générales',
          value: `**Tag:** ${client.user.tag}\n**ID:** ${client.user.id}\n**Créé le:** <t:${Math.floor(client.user.createdTimestamp / 1000)}:F>`,
          inline: false
        },
        {
          name: '📊 Statistiques',
          value: `**Serveurs:** ${totalGuilds}\n**Utilisateurs:** ${totalUsers}\n**Salons:** ${totalChannels}`,
          inline: false
        },
        {
          name: '⏰ Temps de fonctionnement',
          value: `${days} jour(s), ${hours} heure(s), ${minutes} minute(s), ${seconds} seconde(s)`,
          inline: false
        },
        {
          name: '💻 Système',
          value: `**Node.js:** ${process.version}\n**Discord.js:** v${version}\n**RAM utilisée:** ${ramUsage}MB\n**RAM totale:** ${totalRam}MB\n**RAM libre:** ${freeRam}MB`,
          inline: false
        }
      ],
      color: 0x00ff00,
      timestamp: new Date()
    };

    message.reply({ embeds: [embed] });
  }
}; 