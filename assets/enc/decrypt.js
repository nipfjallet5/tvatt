const glob = require('glob');
let CryptoJS = require('crypto-js');
let fs = require('fs');

let password = CryptoJS.SHA256(process.argv[2]).toString();

glob(__dirname + '/**/*.enc', {}, (err, files)=>{
    files.forEach(f => {
        const clearText = JSON.parse(CryptoJS.AES.decrypt(fs.readFileSync(f).toString(), password).toString(CryptoJS.enc.Utf8));
        const outFile = f.replace('.enc', '');
        
        fs.writeFileSync(outFile, JSON.stringify(clearText, null, 2));
    })
})


