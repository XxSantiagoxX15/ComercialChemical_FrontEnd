// Karma: ejecuta las pruebas (*.spec.ts) en un Chrome real, con Jasmine.
//   ng run ComercialChemicalFrontEnd:test-karma
// El proyecto también puede ejecutarlas con Vitest (ng test); los archivos de
// prueba son los mismos y funcionan con los dos.
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
    ],
    client: {
      jasmine: { random: false },
      clearContext: false,          // deja visible el resultado de Jasmine en el navegador
    },
    jasmineHtmlReporter: { suppressAll: true },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/karma'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['ChromeHeadless'],
    customLaunchers: {
      // Para servidores de integración continua o contenedores sin entorno gráfico:
      //   ng run ComercialChemicalFrontEnd:test-karma --browsers=ChromeHeadlessCI
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      },
    },
    restartOnFileChange: true,
  });
};
