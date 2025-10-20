const fs = require('fs');

const docs = JSON.parse(fs.readFileSync('/Users/dolphilia/github/libx-dev/registry/docs.json', 'utf8'));
const demoProject = docs.projects.find(p => p.id === 'demo-docs');

console.log('Demo docs project found:', !!demoProject);

if (demoProject) {
  console.log('\nDocuments count:', demoProject.documents.length);
  console.log('\nFirst 2 documents:');
  demoProject.documents.slice(0, 2).forEach((doc, index) => {
    console.log(`\n${index + 1}. Document:`, JSON.stringify(doc, null, 2));
  });
}
