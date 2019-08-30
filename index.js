const getPixels = require("get-pixels");
const getRgbaPalette = require("get-rgba-palette");
const chroma = require("chroma-js");
const getSvgColors = require("get-svg-colors");
const pify = require("pify");

const patterns = {
  image: /\.(gif|jpg|png|svg)$/i,
  raster: /\.(gif|jpg|png)$/i,
  svg: /svg$/i
};

function colorPalette(input, type, bins = 10, quality, filter, callback) {
  if (typeof type === "function") {
    callback = type;
    type = null;
  }

  // SVG
  if (!Buffer.isBuffer(input)) {
    if (input.match(patterns.svg)) {
      return callback(null, getSvgColors(input, { flat: true }));
    }
  } else if (type === "image/svg+xml") {
    return callback(null, getSvgColors(input, { flat: true }));
  }

  // PNG, GIF, JPG
  return paletteFromBitmap(input, type, bins, quality, filter, callback);
}

function paletteFromBitmap(filename, type, bins, quality, filter, callback) {
  if (!callback) {
    callback = type;
    type = null;
  }

  getPixels(filename, type, function(err, pixels) {
    if (err) return callback(err);
    const palette = getRgbaPalette
      .bins(pixels.data, bins, quality, filter)
      .map(function(bin) {
        return {
          color: {
            red: bin.color[0],
            green: bin.color[1],
            blue: bin.color[2]
          },
          score: bin.amount,
          pixelFraction: bin.amount
        };
      });

    return callback(null, palette);
  });
}

module.exports = pify(colorPalette);
