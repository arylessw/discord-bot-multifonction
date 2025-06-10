const fs = require('fs');
const path = require('path');

function convertFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remplacer les imports par des requires
    content = content.replace(/import\s+(\{[^}]+\})\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require("$2")');
    content = content.replace(/import\s+([^;]+)\s+from\s+['"]([^'"]+)['"]/g, 'const $1 = require("$2")');
    
    // Supprimer les lignes avec fileURLToPath et __dirname
    content = content.replace(/import\s+{\s*fileURLToPath\s*}\s+from\s+['"]url['"];?/g, '');
    content = content.replace(/const\s+__filename\s*=\s*fileURLToPath\(import\.meta\.url\);?/g, '');
    content = content.replace(/const\s+__dirname\s*=\s*path\.dirname\(__filename\);?/g, '');
    
    // Remplacer export default par module.exports
    content = content.replace(/export\s+default\s+/g, 'module.exports = ');
    
    fs.writeFileSync(filePath, content);
    console.log(`Converti: ${filePath}`);
  } catch (error) {
    console.error(`Erreur lors de la conversion de ${filePath}:`, error);
  }
}

function processDirectory(directory) {
  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.endsWith('.js')) {
      convertFile(fullPath);
    }
  }
}

// Démarrer la conversion depuis le dossier commands
const commandsDir = path.join(__dirname, 'commands');
if (fs.existsSync(commandsDir)) {
  console.log('Début de la conversion des commandes...');
  processDirectory(commandsDir);
  console.log('Conversion terminée !');
} else {
  console.error('Le dossier commands n\'existe pas !');
} 