import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const components = [
  "button", "input", "card", "dialog", "dropdown-menu", 
  "sheet", "tabs", "progress", "sonner", "avatar", "badge"
];

async function fetchComponent(name) {
  try {
    const res = await fetch(`https://ui.shadcn.com/r/styles/new-york/${name}.json`);
    if (!res.ok) throw new Error(`Failed to fetch ${name}`);
    const data = await res.json();
    
    // Create ui directory if it doesn't exist
    const uiDir = path.join(__dirname, 'src', 'components', 'ui');
    if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });

    // Install dependencies
    if (data.dependencies && data.dependencies.length > 0) {
      console.log(`Installing deps for ${name}: ${data.dependencies.join(' ')}`);
      import('child_process').then(cp => {
        cp.execSync(`npm install ${data.dependencies.join(' ')}`, { stdio: 'inherit' });
      });
    }

    // Write files
    for (const file of data.files) {
      const filePath = path.join(uiDir, file.name);
      // Replace @/registry/new-york/ with @/ components/ui/ or just keep it simple
      // shadcn registry files usually don't need much replacement if alias is set
      let content = file.content;
      fs.writeFileSync(filePath, content);
      console.log(`Created ${filePath}`);
    }
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  for (const c of components) {
    await fetchComponent(c);
  }
}

run();
