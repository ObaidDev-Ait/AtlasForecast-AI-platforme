const fs = require('fs');
const path = require('path');
const dir = 'src/Components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const fp = path.join(dir, file);
  let content = fs.readFileSync(fp, 'utf8');
  
  // Find the basic scrollTo effect
  const targetPattern = /useEffect\(\(\) => \{\s*window\.scrollTo\(0, 0\);\s*\}, \[\]\);/g;
  const replacement = `useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.document.dispatchEvent(new Event('DOMContentLoaded', {
        bubbles: true,
        cancelable: true
      }));
    }, 100);
  }, []);`;
  
  if (content.match(targetPattern)) {
    content = content.replace(targetPattern, replacement);
    fs.writeFileSync(fp, content, 'utf8');
    console.log('Updated ' + file);
  }
}
