const { parseRobustJson } = require('../services/aiValidator');

describe('parseRobustJson', () => {
  it('1. should parse valid JSON', () => {
    const input = '{"test": "value"}';
    expect(parseRobustJson(input)).toEqual({ test: 'value' });
  });

  it('2. should handle malformed JSON (markdown wrapped)', () => {
    const input = '```json\n{"test": "value"}\n```';
    expect(parseRobustJson(input)).toEqual({ test: 'value' });
  });

  it('3. should throw error on truncated JSON', () => {
    const input = '{"test": "value"';
    expect(() => parseRobustJson(input)).toThrow(/Truncated JSON/);
  });

  it('4. should throw error on invalid JSON', () => {
    const input = '{"test": "value",}'; // Trailing comma
    expect(() => parseRobustJson(input)).toThrow(/invalid response/);
  });

  it('5. should throw error on empty string', () => {
    expect(() => parseRobustJson('')).toThrow(/Empty response/);
  });

  it('6. should throw error on null', () => {
    expect(() => parseRobustJson(null)).toThrow(/Empty response/);
  });

  it('7. should throw error on undefined', () => {
    expect(() => parseRobustJson(undefined)).toThrow(/Empty response/);
  });

  it('8. should parse empty array []', () => {
    expect(parseRobustJson('[]')).toEqual([]);
  });

  it('9. should parse empty object {}', () => {
    expect(parseRobustJson('{}')).toEqual({});
  });

  it('10. should throw error on non-JSON responses', () => {
    expect(() => parseRobustJson('This is a plain text response from AI.')).toThrow(/invalid response/);
  });
});
