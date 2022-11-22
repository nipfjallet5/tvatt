/**
 * Created by johan on 2017-02-26.
 */

// dum = "U2FsdGVkX185EedbNtyOYENDmXwrXAjOSz0i06amX71UnESvQuJA073cQFGhVNPCmu18u1ZBASfBo6yf5lZBpA==";
// var dum2 = CryptoJS.AES.decrypt(dum, 'nipfjallet5.se');
// console.log(decrypted.toString(CryptoJS.enc.Utf8));

var sendMail = function() {
    $.ajax({
        url: '',
        type: 'POST',
        dataType: 'json',
        username: 'api',
        password: '',
        // headers: {
        //     "Authorization": "Basic "+btoa('api:' + ''),
        //     "Content-Type" : "multipart/form-data; charset=utf-8",
        //     "Content-Type": "application/x-www-form-urlencoded",
        //     "Access-Control-Allow-Origin": "*",
        //     "Access-Control-Allow-Credentials": "true",
        //     "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
        //     "Access-Control-Allow-Headers": "Authorization"
        // },
        data: {
            from:'',
            to:'info@nipfjallet5.se',
            subject:'test both',
            text:'test'
        },
        success: function() {
            console.log('ok');
        },
        error: function(data) {
            console.log('problems');
            console.log(data)
        }
    });
};


// var req = new XMLHttpRequest();
// req.open('GET', document.location, false);
// req.send(null);
// var headers = req.getAllResponseHeaders().toLowerCase();
// console.log(headers);


sendMail();
