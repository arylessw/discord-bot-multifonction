const fs = require("fs");
const path = require("path");
const { requireOwner } = require("../../utils/ownerCheck.js");

module.exports = {
  name: 'clearowners',
  description: 'Supprime tous les owners du bot',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    const ownersPath = path.join(__dirname, '../../data/owners.json');
    const owners = { owners: [] };
    
    fs.writeFileSync(ownersPath, JSON.stringify(owners, null, 2));
    message.reply('Tous les owners ont été supprimés du bot.');
  }
}; 