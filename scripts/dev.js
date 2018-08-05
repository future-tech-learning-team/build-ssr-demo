
require('babel-polyfill')
require('babel-register')({
    presets: [
        [ "env", {
            "targets": {
                "node": "6.10"
            }
        }]
    ],
    plugins: [
        'transform-object-rest-spread',
        'transform-runtime',
    ]
})
require('./dev/index')
