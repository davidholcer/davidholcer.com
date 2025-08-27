const fs = require('fs');
const path = require('path');

// Function to generate index files for blog and works directories
function generateContentIndex() {
  const publicDir = path.join(__dirname, '../public/assets');
  
  // Generate blog index
  const blogDir = path.join(publicDir, 'blog');
  if (fs.existsSync(blogDir)) {
    const blogFiles = fs.readdirSync(blogDir)
      .filter(file => file.endsWith('.mdx'))
      .sort();
    
    const blogIndex = {
      files: blogFiles,
      generated: new Date().toISOString(),
      count: blogFiles.length
    };
    
    fs.writeFileSync(
      path.join(blogDir, '_index.json'),
      JSON.stringify(blogIndex, null, 2)
    );
    
    console.log(`Generated blog index with ${blogFiles.length} files:`, blogFiles);
  }
  
  // Generate works index
  const worksDir = path.join(publicDir, 'works');
  if (fs.existsSync(worksDir)) {
    const worksFiles = fs.readdirSync(worksDir)
      .filter(file => file.endsWith('.mdx'))
      .sort();
    
    const worksIndex = {
      files: worksFiles,
      generated: new Date().toISOString(),
      count: worksFiles.length
    };
    
    fs.writeFileSync(
      path.join(worksDir, '_index.json'),
      JSON.stringify(worksIndex, null, 2)
    );
    
    console.log(`Generated works index with ${worksFiles.length} files:`, worksFiles);
  }
}

// Run the function
generateContentIndex();
