const { withProjectBuildGradle, withAppBuildGradle } = require('expo/config-plugins');

// Helper function to find the correct insertion point for plugins block
// Must be after all buildscript blocks
function findPluginsInsertionPoint(buildGradle) {
  const lines = buildGradle.split('\n');
  let insertionLine = 0;
  let inBuildScript = false;
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if we're entering a buildscript block
    if (line.startsWith('buildscript')) {
      inBuildScript = true;
      braceCount = 0;
    }
    
    if (inBuildScript) {
      // Count braces to find the end of buildscript block
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      braceCount += openBraces - closeBraces;
      
      // If braceCount reaches 0, we've found the end of the buildscript block
      if (braceCount <= 0) {
        inBuildScript = false;
        insertionLine = i + 1; // Insert after this line
      }
    }
  }
  
  // Convert line number back to character position
  let charPosition = 0;
  for (let i = 0; i < insertionLine && i < lines.length; i++) {
    charPosition += lines[i].length + 1; // +1 for newline character
  }
  
  return charPosition;
}

const withChaquopyProjectBuildGradle = (config, props = {}) => {
  const chaquopyVersion = props.version || '16.1.0';
  
  return withProjectBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;
    
    // Check if Chaquopy plugin is already added
    if (buildGradle.includes('com.chaquo.python')) {
      console.log('Chaquopy plugin already exists in project build.gradle');
      return config;
    }
    
    // Find the plugins block and add Chaquopy plugin
    const pluginsRegex = /plugins\s*\{([^}]*)\}/;
    const pluginsMatch = buildGradle.match(pluginsRegex);
    
    if (pluginsMatch) {
      // Add Chaquopy plugin to existing plugins block
      const pluginsContent = pluginsMatch[1];
      const newPluginsContent = pluginsContent + `\n    id("com.chaquo.python") version "${chaquopyVersion}" apply false`;
      const newBuildGradle = buildGradle.replace(pluginsRegex, `plugins {${newPluginsContent}\n}`);
      config.modResults.contents = newBuildGradle;
    } else {
      // Create plugins block after buildscript blocks
      const insertionPoint = findPluginsInsertionPoint(buildGradle);
      const pluginsBlock = `plugins {\n    id("com.chaquo.python") version "${chaquopyVersion}" apply false\n}\n\n`;
      
      const beforeInsertion = buildGradle.substring(0, insertionPoint);
      const afterInsertion = buildGradle.substring(insertionPoint);
      config.modResults.contents = beforeInsertion + pluginsBlock + afterInsertion;
    }
    
    return config;
  });
};

const withChaquopyAppBuildGradle = (config, props = {}) => {
  return withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;
    
    // Check if Chaquopy plugin is already applied
    if (buildGradle.includes('com.chaquo.python')) {
      console.log('Chaquopy plugin already applied in app build.gradle');
      return config;
    }
    
    // Find the plugins block and add Chaquopy plugin
    const pluginsRegex = /plugins\s*\{([^}]*)\}/;
    const pluginsMatch = buildGradle.match(pluginsRegex);
    
    if (pluginsMatch) {
      // Add Chaquopy plugin to existing plugins block
      const pluginsContent = pluginsMatch[1];
      const newPluginsContent = pluginsContent + `\n    id("com.chaquo.python")`;
      const newBuildGradle = buildGradle.replace(pluginsRegex, `plugins {${newPluginsContent}\n}`);
      config.modResults.contents = newBuildGradle;
    } else {
      // Create plugins block if it doesn't exist (though this is unlikely in app build.gradle)
      const pluginsBlock = `plugins {\n    id("com.chaquo.python")\n}\n\n`;
      config.modResults.contents = pluginsBlock + buildGradle;
    }
    
    // Add ndk.abiFilters to android.defaultConfig if not present
    let modifiedBuildGradle = config.modResults.contents;
    
    // Check if abiFilters is already configured
    if (!modifiedBuildGradle.includes('abiFilters')) {
      // Find defaultConfig block within android block
      const defaultConfigRegex = /defaultConfig\s*\{/;
      const defaultConfigMatch = modifiedBuildGradle.match(defaultConfigRegex);
      
      if (defaultConfigMatch) {
        // Find the end of the defaultConfig block
        let braceCount = 0;
        let startIndex = defaultConfigMatch.index + defaultConfigMatch[0].length;
        let insertionPoint = startIndex;
        
        for (let i = startIndex; i < modifiedBuildGradle.length; i++) {
          if (modifiedBuildGradle[i] === '{') {
            braceCount++;
          } else if (modifiedBuildGradle[i] === '}') {
            braceCount--;
            if (braceCount === -1) {
              insertionPoint = i;
              break;
            }
          }
        }
        
        // Insert abiFilters before the closing brace of defaultConfig
        const beforeInsertion = modifiedBuildGradle.substring(0, insertionPoint);
        const afterInsertion = modifiedBuildGradle.substring(insertionPoint);
        const abiFiltersConfig = `        ndk {\n            abiFilters "arm64-v8a", "x86_64"\n        }\n`;
        modifiedBuildGradle = beforeInsertion + abiFiltersConfig + afterInsertion;
      }
    }
    
    // Add chaquopy configuration block
    // Check if chaquopy block already exists
    if (!modifiedBuildGradle.includes('chaquopy {')) {
      const chaquopyConfig = generateChaquopyConfig(props);
      
      // Find the android block and add chaquopy config after it
      const androidBlockRegex = /android\s*\{/;
      const androidMatch = modifiedBuildGradle.match(androidBlockRegex);
      
      if (androidMatch) {
        // Find the end of the android block
        let braceCount = 0;
        let startIndex = androidMatch.index + androidMatch[0].length;
        let endIndex = startIndex;
        
        for (let i = startIndex; i < modifiedBuildGradle.length; i++) {
          if (modifiedBuildGradle[i] === '{') {
            braceCount++;
          } else if (modifiedBuildGradle[i] === '}') {
            braceCount--;
            if (braceCount === -1) {
              endIndex = i + 1;
              break;
            }
          }
        }
        
        // Insert chaquopy config after android block
        const beforeAndroid = modifiedBuildGradle.substring(0, endIndex);
        const afterAndroid = modifiedBuildGradle.substring(endIndex);
        modifiedBuildGradle = beforeAndroid + '\n' + chaquopyConfig + '\n' + afterAndroid;
      } else {
        // If no android block found, append at the end
        modifiedBuildGradle += '\n' + chaquopyConfig + '\n';
      }
    }
    
    // Apply the modified build.gradle content
    config.modResults.contents = modifiedBuildGradle;
    
    return config;
  });
};

function generateChaquopyConfig(props) {
  const pythonVersion = props.pythonVersion || '3.11';
  const buildPython = props.buildPython || '/usr/bin/python3';
  
  let config = `chaquopy {
    defaultConfig {
        version "${pythonVersion}"`;
  
  if (props.buildPython) {
    config += `\n        buildPython "${buildPython}"`;
  }
  
  if (props.staticProxy && props.staticProxy.length > 0) {
    config += `\n        staticProxy {`;
    props.staticProxy.forEach(proxy => {
      config += `\n            "${proxy}"`;
    });
    config += `\n        }`;
  }
  
  if (props.pyc) {
    config += `\n        pyc {`;
    if (props.pyc.src !== undefined) {
      config += `\n            src ${props.pyc.src}`;
    }
    if (props.pyc.pip !== undefined) {
      config += `\n            pip ${props.pyc.pip}`;
    }
    if (props.pyc.stdlib !== undefined) {
      config += `\n            stdlib ${props.pyc.stdlib}`;
    }
    config += `\n        }`;
  }
  
  config += `
    }
}`;
  
  return config;
}

const withChaquopy = (config, props = {}) => {
  // Apply project-level build.gradle modifications first
  config = withChaquopyProjectBuildGradle(config, props);
  
  // Then apply app-level build.gradle modifications
  config = withChaquopyAppBuildGradle(config, props);
  
  return config;
};

module.exports = withChaquopy;
