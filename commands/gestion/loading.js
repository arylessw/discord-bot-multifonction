module.exports = {
  name: 'loading',
  description: 'Affiche une barre de chargement avec le message et la durée souhaitée',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    if (!args[0] || !args[1]) {
      return message.reply(
        'Veuillez spécifier un message et une durée.\n' +
        'Utilisation: `loading <message> <durée_en_secondes>`\n' +
        'Exemple: `loading Chargement en cours... 5`'
      );
    }

    const text = args.slice(0, -1).join(' ');
    const duration = parseInt(args[args.length - 1]);

    if (isNaN(duration) || duration < 1 || duration > 60) {
      return message.reply('La durée doit être un nombre entre 1 et 60 secondes.');
    }

    try {
      // Supprimer le message de commande
      await message.delete();

      // Envoyer le message initial
      const loadingMessage = await message.channel.send(
        `${text}\n` +
        '▱▱▱▱▱▱▱▱▱▱ 0%'
      );

      // Mettre à jour la barre de progression
      const totalSteps = 10;
      const stepDuration = (duration * 1000) / totalSteps;

      for (let i = 1; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, stepDuration));

        const progress = Math.floor((i / totalSteps) * 100);
        const filledBlocks = Math.floor((i / totalSteps) * 10);
        const emptyBlocks = 10 - filledBlocks;

        const progressBar = '▰'.repeat(filledBlocks) + '▱'.repeat(emptyBlocks);
        await loadingMessage.edit(
          `${text}\n` +
          `${progressBar} ${progress}%`
        );
      }

      // Message final
      await loadingMessage.edit(
        `${text}\n` +
        '✅ Terminé !'
      );

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const embed = {
            title: '⏳ Barre de chargement affichée',
            fields: [
              {
                name: '📝 Message',
                value: text,
                inline: true
              },
              {
                name: '⏱️ Durée',
                value: `${duration} seconde(s)`,
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
      console.error('Erreur lors de l\'affichage de la barre de chargement:', error);
      message.reply('❌ Une erreur est survenue lors de l\'affichage de la barre de chargement.');
    }
  }
}; 