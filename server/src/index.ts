import { config } from './config.js';
import { pathToFileURL } from 'url';

const isMainModule = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isMainModule) {
  void import('./app.js').then(({ app }) => {
    app.listen(config.port, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${config.port}`);
    });
  });
}
