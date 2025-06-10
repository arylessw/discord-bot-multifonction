module.exports = {
  name: 'custom',
  description: 'Commande custom',
  async execute(message, args, client) {
    message.reply('Commande custom à compléter.');
  }
};
