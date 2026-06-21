const { Project } = require('ts-morph');

const project = new Project({
  tsConfigFilePath: 'D:\\CarbonWise\\tsconfig.json',
});

const sourceFiles = project.getSourceFiles([
  'D:/CarbonWise/components/**/*.tsx',
  'D:/CarbonWise/components/**/*.ts',
  'D:/CarbonWise/hooks/**/*.ts',
  'D:/CarbonWise/lib/**/*.ts',
  'D:/CarbonWise/lib/**/*.tsx',
]);

for (const sourceFile of sourceFiles) {
  let fileChanged = false;

  const handleJsDocs = (node) => {
    const jsDocs = node.getJsDocs();
    if (jsDocs.length === 0) return;
    
    for (const jsDoc of jsDocs) {
      let tags = jsDoc.getTags();
      
      for (const tag of tags) {
        const text = tag.getText();
        if (text.includes('Semantic unit for') || text.includes('Shape or unit of the return value')) {
          tag.remove();
          fileChanged = true;
        }
      }
    }
  };

  sourceFile.getFunctions().forEach(handleJsDocs);
  sourceFile.getVariableStatements().forEach(handleJsDocs);
  sourceFile.getClasses().forEach(handleJsDocs);

  if (fileChanged) {
    sourceFile.saveSync();
    console.log('Cleaned JSDoc in', sourceFile.getFilePath());
  }
}
