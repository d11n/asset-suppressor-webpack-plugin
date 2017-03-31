(function main(webpack) {
    const package_name = 'asset-suppressor-webpack-plugin';
    let has_run = false;
    let stderr;
    return module.exports = asset_suppressor_plugin;

    function asset_suppressor_plugin(options, ...unused_args) {
        this !== global && error('execute without the `new` keyword');
        has_run && error('has already run once');
        unused_args.length > 0
            && warn('only one \`options\` argument is supported.'
                + ` \`${ unused_args }\` will be ignored`
                )
            ;
        has_run = true;
        const plugin_options = process_options(options);
        return apply_plugin;

        function apply_plugin() {
            const compiler = this;
            compiler instanceof webpack.Compiler
                ? compiler.plugin('emit', remove_assets)
                : error('must be run by webpack')
                ;
        }

        function remove_assets(compilation, callback) {
            const all_chunks = compilation.chunks;
            for (let ci = 0, cn = all_chunks.length - 1; ci <= cn; ci++) {
                const chunk = all_chunks[ci];
                if (-1 !== plugin_options.chunks.indexOf(chunk.name)) {
                    const files = chunk.files;
                    for (let fi = 0, fn = files.length - 1; fi <= fn; fi++) {
                        delete compilation.assets[ files[fi] ];
                    }
                }
            }
            callback && callback();
        }
    }

    function process_options(raw_options) {
        const processed_options = { chunks: [] };
        switch (true) {
            case 'string' === typeof raw_options:
                processed_options.chunks.push(raw_options);
                return processed_options;
            case Array.isArray(raw_options):
                if (0 === raw_options.length) {
                    warn_no_effect('passing in an empty array');
                    return processed_options;
                }
                processed_options.chunks = raw_options.map(String);
                return processed_options;
            case 'function' === typeof raw_options:
                warn_no_effect('passing in a function');
                return processed_options;
            case undefined === raw_options:
            case null === raw_options:
                warn_no_effect(`passing in \`${ raw_options }\``);
                return processed_options;
            case 'object' === typeof raw_options:
                const new_processed_options = undefined !== raw_options.chunks
                    ? process_options(raw_options.chunks)
                    : undefined !== raw_options.chunk // no "s" on the end
                        ? process_options(raw_options.chunk)
                        : process_options
                    ;
                process_options === new_processed_options
                    && warn_no_effect('passing in an options object'
                        + ' that does not have a "chunks" or "chunk" key'
                        )
                    ;
                return new_processed_options;
        }
        warn(`chunk names should be strings, will use "${ raw_options}"`);
        processed_options.chunks.push(String(raw_options));
        return processed_options;
    }

    function error(message) {
        throw new Error(`${ package_name }: ${ message }.`);
    }
    function warn(message) {
        stderr || (stderr = require('process').stderr);
        stderr.write(`\x1b[33m${ package_name }: ${ message }.\x1b[0m\n`);
    }
    function warn_no_effect(message) {
        warn(`${ message } makes the plugin have no effect`);
    }
}(
    require('webpack')
));
