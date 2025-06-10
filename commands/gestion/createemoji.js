module.exports = {
  name: 'createemoji',
  description: 'Crée un emoji custom sur le serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('ManageEmojisAndStickers')) {
      return message.reply('Vous devez avoir la permission de gérer les emojis pour utiliser cette commande.');
    }

    if (!args[0] || !args[1]) {
      return message.reply(
        'Veuillez spécifier un nom et une URL pour l\'emoji.\n' +
        'Utilisation: `createemoji <nom> <url>`'
      );
    }

    const name = args[0];
    const url = args[1];

    // Vérifier si le nom est valide
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      return message.reply('Le nom de l\'emoji ne doit contenir que des lettres, des chiffres et des underscores.');
    }

    try {
      // Vérifier si l'URL est valide
      if (!url.match(/^https?:\/\/.+\.(png|jpg|jpeg|gif|webp)$/i)) {
        return message.reply('L\'URL doit pointer vers une image valide (PNG, JPG, JPEG, GIF ou WEBP).');
      }

      // Créer l'emoji
      const emoji = await message.guild.emojis.create(url, name, {
        reason: `Créé par ${message.author.tag}`
      });

      // Envoyer un message de confirmation
      message.reply(`✅ L'emoji ${emoji} a été créé avec succès.`);

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const embed = {
            title: '😀 Emoji créé',
            fields: [
              {
                name: '📝 Nom',
                value: emoji.name,
                inline: true
              },
              {
                name: '🖼️ Emoji',
                value: emoji.toString(),
                inline: true
              },
              {
                name: '👤 Modérateur',
                value: message.author.toString(),
                inline: true
              }
            ],
            color: 0x00ff00,
            timestamp: new Date()
          };
          logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'emoji:', error);
      if (error.code === 50035) {
        message.reply('❌ Le serveur a atteint la limite d\'emojis.');
      } else if (error.code === 50013) {
        message.reply('❌ Je n\'ai pas la permission de créer des emojis.');
      } else {
        message.reply('❌ Une erreur est survenue lors de la création de l\'emoji.');
      }
    }
  }
}; 