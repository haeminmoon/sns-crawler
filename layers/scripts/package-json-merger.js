const fs = require('fs');
const path = require('path');


function findFiles(parentDir, filename) {
  if (!fs.existsSync(parentDir)) {
    console.log(`${parentDir} directory does not exist!`);
    return;
  }

  const dirs = fs.readdirSync(parentDir);

  let foundFiles = [];

  for (let i = 0; i < dirs.length; i++) {
    let dir = path.join(parentDir, dirs[i]);
    let stat = fs.lstatSync(dir);

    if (!stat.isDirectory()) { continue; } 
    
    let filePath = path.join(dir, filename);
    
    if (fs.existsSync(filePath)) {
      console.log(`-- File found: ${filePath}`);
      foundFiles.push(filePath);
    }
  }

  return foundFiles;
}

function extractDependencies(path) {
  const packageJson = JSON.parse(fs.readFileSync(path, 'utf8'));
  return packageJson.dependencies;
}

function mergeDependencies(src, dest) {
  let destDependencies = extractDependencies(dest);

  for (let i = 0; i < src.length; i++) {
    let srcDependencies = extractDependencies(src[i]);
    destDependencies = Object.assign(destDependencies, srcDependencies);
  }

  let destPackageJson = JSON.parse(fs.readFileSync(dest, 'utf8'));
  destPackageJson.dependencies = destDependencies;

  fs.writeFileSync(dest, JSON.stringify(destPackageJson, null, 2));
}

console.log('Merging dependencies...\n\r\n\r');
mergeDependencies(
  findFiles(process.env.PARENT_DIR, 'package.json'),
  path.join(process.env.DEPENDENCIES_DEST, 'package.json')
);
console.log('\n\r\n\rDependencies have been merged successfully.');
