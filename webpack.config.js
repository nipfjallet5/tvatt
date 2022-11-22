const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // mode: 'production',
    mode: 'development',
    context: path.join(__dirname, 'src'),
    entry: {
        tvattlib: path.join(__dirname, '/src/tvattlib.js'),
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, '.'),
        crossOriginLoading: 'anonymous',
        library: 'tvattlib',
        libraryTarget: 'umd'
    },
    // resolve: {
    //     fallback: { "crypto": false, "path": false, "fs": false}
    // },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
                include: [/node_modules/, path.resolve(__dirname, 'src')],
            },
            {
                test: /\.(woff(2)?|ttf|eot|png|gif)(\?v=\d+\.\d+\.\d+)?$/,
                // exclude: [path.resolve(__dirname, 'src/wasm/bin')],
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'assets/'
                    },
                }]
            },
            ],
        // defaultRules: [
        //     {
        //         type: 'javascript/auto',
        //             resolve: {}
        //     },
        //     {
        //         test: /\.json$/i,
        //             type: 'json'
        //     }
        // ]
    },
    // node: { fs: 'empty' },
    devServer: {
        port:5000,
        // contentBase: path.join(__dirname, '../webapp'),
        // inline: true,
        hot: true,
        historyApiFallback: true,

    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'tvatt.html',
            chunks: ['tvatt']
        }),
    ]
};