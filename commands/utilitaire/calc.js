const { MessageEmbed } = require('discord.js');
const math = require('mathjs');

module.exports = {
  name: 'calc',
  description: 'Effectue un calcul mathématique',
  async execute(message, args) {
    try {
      if (!args[0]) {
        return message.reply({ content: '❌ Veuillez fournir une expression à calculer.' });
      }

      const expression = args.join(' ');

      // Nettoyer l'expression pour n'autoriser que les caractères mathématiques valides
      const cleanExpression = expression.replace(/[^0-9+\-*/().\s]/g, '');
      
      if (!cleanExpression) {
        return message.reply({ content: '❌ Expression invalide.' });
      }

      try {
        const result = math.evaluate(cleanExpression);
        
        if (typeof result !== 'number' && !isFinite(result)) {
          return message.reply({ content: '❌ Résultat invalide.' });
        }

        const embed = new MessageEmbed()
          .setTitle('🧮 Calculatrice')
          .setColor('#00ff00')
          .addField('Expression', `\`\`\`${cleanExpression}\`\`\``)
          .addField('Résultat', `\`\`\`${result}\`\`\``)
          .setTimestamp();

        message.reply({ embeds: [embed] });
      } catch (error) {
        message.reply({ content: '❌ Expression mathématique invalide.' });
      }
    } catch (error) {
      console.error('Erreur lors du calcul:', error);
      message.reply({ content: '❌ Une erreur est survenue lors du calcul.' });
    }
  }
};
