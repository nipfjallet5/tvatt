let CryptoJS = require('crypto-js');
let fs = require('fs');

function encryptFileBase64(inFile, outFile, password) {
    let encrypted_b64 = CryptoJS.AES.encrypt(Buffer(fs.readFileSync(inFile)).toString('base64'), password);
    return fs.writeFile(outFile, encrypted_b64.toString(), (err) => {
        if (err) throw err;
        console.log('Saved!');
    });
}

function decryptFileBase64(inFile, outFile, password) {
    fs.readFile(inFile, (err, data) => {
        if (err) throw err;
        let dectrypted_b64 = CryptoJS.AES.decrypt(data.toString(), password).toString(CryptoJS.enc.Utf8);
        let bitmap = new Buffer(dectrypted_b64, 'base64');
        fs.writeFileSync(outFile, bitmap);
    });
}

function encryptFile(inFile, outFile, password) {
    console.log('a',inFile);
    console.log('b',outFile);
    console.log('c',password);
    console.log('d',fs.readFileSync(inFile).toString());
    console.log('e',CryptoJS.AES.encrypt(fs.readFileSync(inFile).toString(), password).toString());
    
    fs.writeFileSync(outFile, CryptoJS.AES.encrypt(fs.readFileSync(inFile).toString(), password).toString())
}

function decryptFile(inFile, outFile, password) {
    const data = CryptoJS.AES.decrypt(fs.readFileSync(inFile).toString(), password).toString(CryptoJS.enc.Utf8);
    fs.writeFileSync(outFile, data);
    return data;
}

function base64_encode(file) {
    let bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}

function base64_decode(base64str, file) {
    let bitmap = new Buffer(base64str, 'base64');
    fs.writeFileSync(file, bitmap);
    console.log('******** File created from base64 encoded string ********');
}

let AESencrypt = function(str, key) {
    return CryptoJS.AES.encrypt(str, key);
};

let AESdecrypt = function(str, key) {
    return CryptoJS.AES.decrypt(str, key).toString(CryptoJS.enc.Utf8);
};

const fileName = process.argv.slice(2)[0];
const key = process.argv.slice(2)[1];
console.log(fileName, key);

let password = CryptoJS.SHA256(key).toString();

encryptFile(fileName, `../enc/${fileName}.enc`, password);


// fs.readFile(fileName, (err, data) => {
//     if (err) throw err;
//     let crypto = CryptoJS.AES.encrypt(data.toString(), password).toString();
//     return fs.writeFile(`../assets/enc/${fileName}.enc`, crypto, (err) => {
//         if (err) throw err;
//         console.log('Saved!');
//     });
// });
