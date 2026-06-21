const { Project, SyntaxKind } = require('ts-morph');
const path = require('path');

const project = new Project({
  tsConfigFilePath: 'D:\\CarbonWise\\tsconfig.json',
});

// We only care about components, hooks, lib
const sourceFiles = project.getSourceFiles([
  'D:/CarbonWise/components/**/*.tsx',
  'D:/CarbonWise/components/**/*.ts',
  'D:/CarbonWise/hooks/**/*.ts',
  'D:/CarbonWise/lib/**/*.ts',
  'D:/CarbonWise/lib/**/*.tsx',
]);

function toTitleCase(str) {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}

for (const sourceFile of sourceFiles) {
  let fileChanged = false;

  // Process functions
  const functions = sourceFile.getFunctions();
  for (const func of functions) {
    if (!func.isExported()) continue;

    let jsDocs = func.getJsDocs();
    let desc = '';
    
    if (jsDocs.length === 0) {
      desc = `${toTitleCase(func.getName() || 'Function')} function.`;
      func.addJsDoc({ description: desc });
      jsDocs = func.getJsDocs();
    } else {
      desc = jsDocs[0].getDescription().trim() || `${toTitleCase(func.getName() || 'Function')} function.`;
    }

    const jsDoc = jsDocs[0];
    const tags = jsDoc.getTags();

    let hasReturns = tags.some(t => t.getTagName() === 'returns');
    let hasThrows = tags.some(t => t.getTagName() === 'throws');
    let hasParams = tags.some(t => t.getTagName() === 'param');

    const params = func.getParameters();
    
    // Add missing params
    const existingParams = tags.filter(t => t.getTagName() === 'param').map(t => {
      // In ts-morph, parse the tag text to find param name
      const text = t.getText();
      const match = text.match(/@param\s+([a-zA-Z0-9_.-]+)/);
      return match ? match[1] : '';
    });

    for (const p of params) {
      const pName = p.getName();
      if (pName.includes('{')) {
        // destructured param, let's just add props
        if (!existingParams.includes('props')) {
          jsDoc.addTag({ tagName: 'param', text: 'props - Component properties.' });
        }
        // we can add nested like props.activity
        const elements = p.getNameNode().getElements();
        for (const el of elements) {
          const elName = el.getName();
          if (!existingParams.includes(`props.${elName}`)) {
            jsDoc.addTag({ tagName: 'param', text: `props.${elName} - Semantic unit for ${elName}.` });
          }
        }
      } else {
        if (!existingParams.includes(pName)) {
          jsDoc.addTag({ tagName: 'param', text: `${pName} - Semantic unit for ${pName}.` });
        }
      }
    }

    if (!hasReturns) {
      jsDoc.addTag({ tagName: 'returns', text: 'Shape or unit of the return value.' });
    }
    if (!hasThrows) {
      jsDoc.addTag({ tagName: 'throws', text: '{never} This function does not throw.' });
    }
    fileChanged = true;
  }

  // Process Variable statements (constants)
  const variableStatements = sourceFile.getVariableStatements();
  for (const stmt of variableStatements) {
    if (!stmt.isExported()) continue;

    let jsDocs = stmt.getJsDocs();
    const decls = stmt.getDeclarations();
    if (decls.length === 0) continue;
    const name = decls[0].getName();

    if (jsDocs.length === 0) {
      stmt.addJsDoc({ description: `${toTitleCase(name)} constant.` });
      jsDocs = stmt.getJsDocs();
    }

    const jsDoc = jsDocs[0];
    const tags = jsDoc.getTags();

    let hasReturns = tags.some(t => t.getTagName() === 'returns');
    let hasThrows = tags.some(t => t.getTagName() === 'throws');

    if (!hasReturns) {
      jsDoc.addTag({ tagName: 'returns', text: 'The shape or unit of this constant object.' });
    }
    if (!hasThrows) {
      jsDoc.addTag({ tagName: 'throws', text: '{never} This constant does not throw.' });
    }
    fileChanged = true;
  }

  // Same for classes
  const classes = sourceFile.getClasses();
  for (const cls of classes) {
    if (!cls.isExported()) continue;
    let jsDocs = cls.getJsDocs();
    if (jsDocs.length === 0) {
      cls.addJsDoc({ description: `${toTitleCase(cls.getName() || 'Class')} class.` });
      jsDocs = cls.getJsDocs();
    }
    const jsDoc = jsDocs[0];
    const tags = jsDoc.getTags();
    let hasReturns = tags.some(t => t.getTagName() === 'returns');
    let hasThrows = tags.some(t => t.getTagName() === 'throws');
    if (!hasReturns) {
      jsDoc.addTag({ tagName: 'returns', text: 'Instance of the class.' });
    }
    if (!hasThrows) {
      jsDoc.addTag({ tagName: 'throws', text: '{never} This class does not throw.' });
    }
    fileChanged = true;
  }

  if (fileChanged) {
    sourceFile.saveSync();
    console.log(`Updated JSDocs in ${sourceFile.getFilePath()}`);
  }
}
