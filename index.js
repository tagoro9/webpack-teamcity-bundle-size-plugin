/**
 * @module WebpackTeamcityBundleSizePlugin
 */
const path = require("path");

const createDefaultLogger = options => ({
  done: stats => {
    // Only run this if on Team City
    if (process.env && !process.env.TEAMCITY_VERSION) {
      return;
    }
    const { assetsByChunkName, assets } = stats.toJson();

    assets.forEach(asset => {
      const chunkName = asset.chunkNames[0];
      if (!assetsByChunkName[chunkName]) {
        return;
      }

      const { name: assetName, size: assetSize } = asset;
      const chunkFullName = path.basename(assetName);

      console.log(
        `##teamcity[buildStatisticValue key='${options.getKey(
          chunkFullName
        )}' value='${assetSize}']`
      );
    });
  }
});

class WebpackTeamcityBundleSizePlugin {
  constructor(options = { getKey: fileName => fileName, callback: {} }) {
    this.callback = Object.assign(
      {},
      createDefaultLogger(options),
      options.callback
    );
  }
  apply(compiler) {
    Object.keys(this.callback).forEach(key => {
      compiler.plugin(key, this.callback[key]);
    });
  }
}

module.exports = WebpackTeamcityBundleSizePlugin;
