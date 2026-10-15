import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, colorFn) {
  // PNG signature
  const signature = Buffer.from([139, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // color type (RGBA)
  ihdr.writeUInt8(0, 10); // compression method
  ihdr.writeUInt8(0, 11); // filter method
  ihdr.writeUInt8(0, 12); // interlace method

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with filter byte 0 at start of each scanline
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = colorFn(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);

  const crcVal = crc32(typeAndData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([len, typeAndData, crcBuf]);
}

// Brand shield drawing function
function voxShieldIcon(x, y, w, h) {
  const nx = (x / w) * 2 - 1; // -1 to 1
  const ny = (y / h) * 2 - 1; // -1 to 1
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Background rounded pink card
  if (Math.abs(nx) > 0.92 || Math.abs(ny) > 0.92) {
    return [0, 0, 0, 0];
  }

  // Inside shield shape
  // y ranges from -0.8 to +0.8
  // width of shield tapers down as y goes from 0 to 0.8
  const inShieldY = ny > -0.7 && ny < 0.8;
  const maxWidth = ny < 0.1 ? 0.65 : 0.65 * (1 - (ny - 0.1) / 0.7);
  const inShield = inShieldY && Math.abs(nx) < maxWidth;

  if (inShield) {
    // Shield gradient from rose red #FF2A6D to deep magenta #E91E63
    const ratio = (ny + 0.7) / 1.5;
    const r = Math.round(233 + ratio * 20);
    const g = Math.round(30 - ratio * 15);
    const b = Math.round(99 - ratio * 40);

    // Inner symbol: microphone/heart center highlight
    if (dist < 0.22) {
      return [255, 255, 255, 255];
    }
    return [r, g, b, 255];
  }

  // Soft pink background
  return [255, 247, 250, 255];
}

fs.mkdirSync('./public', { recursive: true });

fs.writeFileSync('./public/pwa-192x192.png', createPNG(192, 192, voxShieldIcon));
fs.writeFileSync('./public/pwa-512x512.png', createPNG(512, 512, voxShieldIcon));
fs.writeFileSync('./public/pwa-maskable-512x512.png', createPNG(512, 512, voxShieldIcon));
fs.writeFileSync('./public/apple-touch-icon.png', createPNG(180, 180, voxShieldIcon));
fs.writeFileSync('./public/favicon.ico', createPNG(32, 32, voxShieldIcon));

console.log('PWA PNG and ICO icons created successfully!');
