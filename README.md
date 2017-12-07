# Asset Suppressor (Webpack plugin)

### Prevent Webpack from outputting unwanted asset files

The typical use case for Asset Suppressor is to prevent Webpack from outputting `.js` files for chunks that do not include any JavaScript intended to be executed in a web browser. These chunks normally only include HTML files, CSS files, images, etc. and only have JavaScript intended to be executed by Node as part of Webpack.

<br/>

## Installation

```shell
$ npm install asset-suppressor-webpack-plugin --save-dev
```

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

./source/<br/>
        images/<br/>
                logo.png<br/>
        index.css<br/>
        index.html<br/>
        index.js<br/>
./package.json<br/>
./webpack.config.js

<br/>

##### `package.json`

```json
{
    "name": "asset-suppressor-example",
    "//": "other package fields",
    "devDependencies": {
        "asset-suppressor-webpack-plugin": "^0.1.6",
        "css-loader": "^0.28.0",
        "extract-loader": "^0.1.0",
        "file-loader": "^0.10.1",
        "html-loader": "^0.4.5",
        "webpack": "3.x"
    }
}
```

<br/>

##### `webpack.config.js`

```javascript
...

const asset_injector = require('asset-suppressor-webpack-plugin');

...

webpack_config.entry = {
    index: './index.js',
    assets: './index.html',
    };

...

webpack_config.module.rules.push({
    test: /\.html$/,
    loaders: [
        {
            loader: 'file-loader',
            options: {
                name: '[path][name].html',
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
webpack_config.module.rules.push({
    test: /\.css$/,
    loaders: [
        'file-loader',
        'extract-loader',
        'css-loader',
        ],
    });

...
```

<br/>

### Building with Webpack
As long as `./source/index.html` includes `<link href="index.css"/>` and `<img src="images/logo.png"/>`, running `webpack` from the project root:

```shell
$ ./node_modules/webpack/bin/webpack.js --config ./config/webpack/webpack.config.js
```

will output something similar to:

        ./target/<br/>
                _**assets.** 3e267d4bba3349f61186 **.js**_ <br/>
                **index.** 3e267d4bba3349f61186 **.js** <br/>
                **index.** 59439cbef37d30a7a6f3e3b84d71b941 **.css** <br/>
                **index.html** <br/>
                **logo.** d41d8cd98f00b204e9800998ecf8427e **.png** <br/>

Notice the `assets.3e267d4bba3349f61186.js` file. It contains no JavaScript needed in a web browser environment. The `assets` entry point merely tells Webpack to include `index.html` in the build and to parse it for its dependencies (with this particular config telling Webpack to look in `<img>` and `<link>` tags).

For a cleaner build with no useless `.js` files, Asset Suppressor
tells Webpack to not output the `.js` file (including its source map, if enabled) for the `assets` entry point by adding the following to your Webpack config:

```javascript
const asset_suppressor = require('asset-suppressor-webpack-plugin');
webpack_config.plugins.push(asset_suppressor({
    chunk: 'assets',
}));
```

or the shorthand:

```javascript
webpack_config.plugins.push(asset_suppressor('assets'));
```

And if there are multiple chunks that need their `.js` assets suppressed:

```javascript
webpack_config.plugins.push(asset_suppressor({
    chunks: [ 'www_assets', 'blog_assets', 'lib.css' ],
}));
```

or the shorthand:

```javascript
webpack_config.plugins.push(asset_suppressor([ 'www_assets', 'blog_assets', 'lib.css' ]));
```
