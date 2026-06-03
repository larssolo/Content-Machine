import { describe, it, expect } from 'vitest';
import { buildCviUserContent } from './cvi';

describe('buildCviUserContent', () => {
  it('builds a document block for a PDF data URL', () => {
    const blocks = buildCviUserContent('data:application/pdf;base64,QUJD', 'application/pdf');
    expect(blocks[0].type).toBe('document');
    expect((blocks[0] as any).source.media_type).toBe('application/pdf');
    expect((blocks[0] as any).source.data).toBe('QUJD');
  });

  it('builds an image block for a PNG data URL', () => {
    const blocks = buildCviUserContent('data:image/png;base64,QUJD', 'image/png');
    expect(blocks[0].type).toBe('image');
    expect((blocks[0] as any).source.media_type).toBe('image/png');
  });

  it('builds a decoded text block for a text data URL', () => {
    const b64 = Buffer.from('Brand farver: blå', 'utf-8').toString('base64');
    const blocks = buildCviUserContent(`data:text/plain;base64,${b64}`, 'text/plain');
    expect(blocks[0].type).toBe('text');
    expect((blocks[0] as any).text).toContain('Brand farver: blå');
  });

  it('always appends a trailing instruction text block', () => {
    const blocks = buildCviUserContent('data:image/png;base64,QUJD', 'image/png');
    const last = blocks[blocks.length - 1];
    expect(last.type).toBe('text');
    expect((last as any).text).toContain('Analysér');
  });
});
