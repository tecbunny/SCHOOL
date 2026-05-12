import { describe, expect, it } from '@jest/globals';

import { parseDataImage } from './data-image';

describe('parseDataImage', () => {
  it('extracts mime type and base64 payload', () => {
    expect(parseDataImage('data:image/png;base64,aGVsbG8=', 100)).toEqual({
      mimeType: 'image/png',
      data: 'aGVsbG8=',
    });
  });

  it('rejects malformed, non-image, and oversized data urls', () => {
    expect(parseDataImage('data:text/plain;base64,aGVsbG8=', 100)).toBeNull();
    expect(parseDataImage('image/png;base64,aGVsbG8=', 100)).toBeNull();
    expect(parseDataImage('data:image/png;base64,aGVsbG8=', 10)).toBeNull();
  });
});
