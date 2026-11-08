const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function createCleanDistributionZip() {
  const rootDir = path.resolve(__dirname, '..');
  const distDir = path.join(rootDir, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const zipPath = path.join(distDir, 'safaria-v2.0.0-staging-rc2-source.zip');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', function () {
    console.log(`Successfully created distribution archive: ${zipPath}`);
    console.log(`Total bytes: ${archive.pointer()} (${(archive.pointer() / 1024 / 1024).toFixed(2)} MB)`);
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);

  // Exclude node_modules, .next, .git, etc.
  archive.glob('**/*', {
    cwd: rootDir,
    ignore: [
      'node_modules/**',
      '.next/**',
      '.git/**',
      'dist/**',
      'test-results/**',
      'playwright-report/**',
      '*.log',
      '.env.local',
      '**/.DS_Store'
    ],
    dot: true
  });

  await archive.finalize();
}

createCleanDistributionZip().catch((err) => {
  console.error('Error creating distribution zip:', err);
  process.exit(1);
});
