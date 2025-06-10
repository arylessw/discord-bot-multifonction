module.exports = {
  name: 'ping',
  description: 'Affiche la latence du bot',
  async execute(message, args, client) {
    const sent = await message.reply('Calcul de la latence...');
    const latency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);

    const embed = {
      title: '🏓 Pong!',
      fields: [
        {
          name: 'Latence du bot',
          value: `${latency}ms`,
          inline: true
        },
        {
          name: 'Latence de l\'API',
          value: `${apiLatency}ms`,
          inline: true
        }
      ],
      color: 0x00ff00,
      timestamp: new Date()
    };

    sent.edit({ content: null, embeds: [embed] });
  }
}; 