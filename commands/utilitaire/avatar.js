module.exports = {
  name: 'avatar',
  description: 'Affiche l\'avatar d\'un utilisateur',
  async execute(message, args, client) {
    const user = message.mentions.users.first() || 
      client.users.cache.get(args[0]) ||
      client.users.cache.find(u => u.tag.toLowerCase() === args.join(' ').toLowerCase()) ||
      message.author;

    const embed = {
      title: `Avatar de ${user.tag}`,
      image: {
        url: user.displayAvatarURL({ dynamic: true, size: 4096 })
      },
      color: 0x00ff00,
      timestamp: new Date()
    };

    message.reply({ embeds: [embed] });
  }
}; 