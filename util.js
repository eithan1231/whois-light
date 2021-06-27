const chunkArray = (array, size) => {
  let chunkedArray = Array(Math.ceil(array.length / size));

  for (let i = 0; i < chunkedArray.length; i++) {
    const sliceIndex = i * size;
    chunkedArray[i] = array.slice(sliceIndex, sliceIndex + size);
  }

  return chunkedArray;
};

module.exports.chunkArray = chunkArray;
