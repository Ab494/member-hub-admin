// This is a unit test for the backend config
// It checks that the config loads correctly and has the right structure

const config = require('../config/index.cjs');

describe('App Config', () => {

  test('config loads without errors', () => {
    expect(config).toBeDefined();
  });

  test('has required app properties', () => {
    expect(config).toHaveProperty('port');
    expect(config).toHaveProperty('env');
  });

  test('port is a number', () => {
    expect(typeof config.port).toBe('number');
  });

  test('has database config', () => {
    expect(config).toHaveProperty('database');
    expect(config.database).toHaveProperty('url');
  });

  test('has jwt config', () => {
    expect(config).toHaveProperty('jwt');
    expect(config.jwt).toHaveProperty('secret');
    expect(config.jwt).toHaveProperty('expiresIn');
  });

  test('has redis config', () => {
    expect(config).toHaveProperty('redis');
    expect(config.redis).toHaveProperty('host');
    expect(config.redis).toHaveProperty('port');
  });

});
