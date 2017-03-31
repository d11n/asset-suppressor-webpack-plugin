# Asset Suppressor (Webpack plugin)

### Prevent Webpack from outputting unwanted asset files.

The typical use case for Asset Suppressor is to prevent Webpack from outputting `.js` files for chunks that do not include any JavaScript intended to be executed in a web browser. These chunks normally only include HTML files, CSS files, images, etc. and only have JavaScript intended to be executed by Node as part of Webpack.

<br/>

## Basic Usage

Asset Suppressor takes in Webpack chunk names to determine which assets to suppress. These chunk names would typically be the same as the names of Webpack entry points.

##### `webpack.config.js`

```javascript
const asset_suppressor = require('asset-suppressor-webpack-plugin');
config.plugins.push(asset_suppressor([ 'assets' ]));
```

<br/>

## Complete Example

### Project Structure

./config/<br/>
&nbsp;&nbsp;&nbsp;&nbsp;webpack/<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;entry.assets.js<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;entry.index.js<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;webpack.config.js<br/>
./source/<br/>
&nbsp;&nbsp;&nbsp;&nbsp;images/<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;logo.png<br/>
&nbsp;&nbsp;&nbsp;&nbsp;index.css<br/>
&nbsp;&nbsp;&nbsp;&nbsp;index.html<br/>
&nbsp;&nbsp;&nbsp;&nbsp;index.js<br/>
./package.json

<br/>

##### `./package.json`

```json
{
    "name": "asset-suppressor-example",
    "//": "other package fields",
    "dependencies": {
        "css-loader": "^0.28.0",
        "extract-loader": "^0.1.0",
        "file-loader": "^0.10.1",
        "html-loader": "^0.4.5",
        "webpack": "2.x"
    }
}
```

<br/>

##### `./config/webpack/webpack.config.js`

```javascript
const path = require('path');
const project_root_path = path.join(__dirname, '../..');

const config = {
    context: path.join(project_root_path, 'source'),
    entry: {
        index: '../config/webpack/entry.index.js',
        assets: '../config/webpack/entry.assets.js',
        // other entry points
    },
    output: {
        filename: '[name].[hash].js',
        path: path.join(project_root_path, 'target'),
        // other output configuration
    },
    // other webpack configuration
    module: { rules: [] },
    plugins: [],
};

config.module.rules.push({
    test: /\.html$/,
    loaders: [
        {
            loader: 'file-loader',
            options: {
                name: '[path][name].[hash].html',
            },
        },
        'extract-loader',
        {
            loader: 'html-loader',
            options: {
                attrs: [ 'img:src', 'link:href' ],
            },
        },
    ],
});
config.module.rules.push({
    test: /\.css$/,
    loaders: [
        {
            loader: 'file-loader',
            options: {
                name: '[path][name].[hash].css',
            },
        },
        'extract-loader',
        'css-loader',
    ],
});
config.module.rules.push({
    test: /\.(jpg|png|gif|svg)$/,
    loaders: [
        {
            loader: 'file-loader',
            options: {
                name: '[path][name].[hash].[ext]',
            },
        },
    ],
});
// other module rules

module.exports = config;
```

<br/>

##### `./config/webpack/entry.assets.js`

```javascript
require('../../source/index.html');
```

<br/>

##### `./config/webpack/entry.index.js`

```javascript
require('../../source/index.js');
```

<br/>

### Building with Webpack
As long as `./source/index.html` references `index.css` in a `<link>` tag and `logo.png` in an `<img>` tag, running the following at the command line:

```shell
./node_modules/webpack/bin/webpack.js --config ./config/webpack/webpack.config.js
```

will output something similar to:

./target/<br/>
&nbsp;&nbsp;&nbsp;&nbsp;images/<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;**logo**.d41d8cd98f00b204e9800998ecf8427e **.png** <br/>
&nbsp;&nbsp;&nbsp;&nbsp;_**assets**.3e267d4bba3349f61186 **.js**_ <br/>
&nbsp;&nbsp;&nbsp;&nbsp;**index**.3e267d4bba3349f61186 **.js** <br/>
&nbsp;&nbsp;&nbsp;&nbsp;**index**.59439cbef37d30a7a6f3e3b84d71b941 **.css** <br/>
&nbsp;&nbsp;&nbsp;&nbsp;**index**.fa5d58cd19972afd9f184420c5177aaa **.html** <br/>

Notice the `assets.3e267d4bba3349f61186.js` file. It contains no JavaScript needed in a web browser environment. `./config/webpack/entry.assets.js` merely tells Webpack to include `index.html` in the build and to parse it for its dependencies.

For a cleaner build with no useless `.js` files, Asset Suppressor
tells Webpack to not output the `.js` file (including its source map, if enabled) for the `assets` entry point by adding the following to `./config/webpack/webpack.config.js`, just above the `module.exports` line:

```javascript
const asset_suppressor = require('asset-suppressor-webpack-plugin');
config.plugins.push(asset_suppressor({
    chunk: 'assets',
}));
```

or the shorthand:

```javascript
config.plugins.push(asset_suppressor('assets'));
```

And if there are multiple chunks that need their `.js` assets suppressed:

```javascript
config.plugins.push(asset_suppressor({
    chunks: [ 'www_assets', 'blog_assets' ],
}));
```

or the shorthand:

```javascript
config.plugins.push(asset_suppressor([ 'www', 'blog' ]));
```
