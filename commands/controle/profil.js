const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");
const { requireOwner } = require("../../utils/ownerCheck.js");




module.exports = {
  name: 'profil',
  description: 'Change la photo de profil du bot',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    if (!message.attachments.size) {
      return message.reply('Veuillez joindre une image pour la photo de profil.');
    }

    const attachment = message.attachments.first();
    if (!attachment.contentType.startsWith('image/')) {
      return message.reply('Le fichier doit être une image.');
    }

    try {
      await client.user.setAvatar(attachment.url);
      message.reply('La photo de profil du bot a été mise à jour.');
    } catch (error) {
      message.reply('Une erreur est survenue lors du changement de la photo de profil.');
    }
  }
}; 