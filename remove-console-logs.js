const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript and JavaScript files
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Skip node_modules and dist directories
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Function to remove console logs from a file
function removeConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Remove console.log, console.error, console.warn, console.info statements
    // This regex matches various console statement patterns
    const consoleRegex = /^\s*console\.(log|error|warn|info|debug|trace)\([^;]*\);?\s*$/gm;
    
    // Also match console statements that span multiple lines
    const multiLineConsoleRegex = /console\.(log|error|warn|info|debug|trace)\([^)]*\);?/g;
    
    const originalContent = content;
    
    // Remove single line console statements
    content = content.replace(consoleRegex, '');
    
    // Remove multi-line console statements (more complex)
    content = content.replace(/console\.(log|error|warn|info|debug|trace)\s*\([^;]*\);?/g, '');
    
    // Clean up empty lines that might be left behind
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      modified = true;
      console.log(`✅ Removed console logs from: ${filePath}`);
    }
    
    return modified;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main function
function main() {
  console.log('🧹 Starting console log removal...\n');
  
  const srcDir = path.join(__dirname, 'src');
  const files = findFiles(srcDir);
  
  let totalModified = 0;
  
  files.forEach(file => {
    if (removeConsoleLogs(file)) {
      totalModified++;
    }
  });
  
  console.log(`\n🎉 Completed! Modified ${totalModified} files.`);
  console.log('📦 Your app is now ready for production deployment!');
}

// Run the script
main();
