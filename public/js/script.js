// -------------------- LOCALS ------------------------- \\
let this_usr;
let socket = io.connect('http://' + document.domain + ':' + location.port);
let key = CryptoJS.lib.WordArray.random(32).toString(); //get client random key
console.log("Generated symmetric key:" + key.toString()); //just for tests

function encrypt(msgString, key) {
    console.log("\nEncrypting: " + msgString)
    console.log("With key: " + key)
    return CryptoJS.AES.encrypt(msgString, key).toString();
}

function decrypt(ciphertextStr, key) {
    console.log("\nDecrypting: " + ciphertextStr)
    console.log("With key: " + key)
    return CryptoJS.AES.decrypt(ciphertextStr, key).toString(CryptoJS.enc.Utf8);
}


socket.on('connect', function () {
  
    let generated_key = key.toString();
    var encryptor = new JSEncrypt(); 
    let server_publickey = "-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDlOJu6TyygqxfWT7eLtGDwajtNFOb9I5XRb6khyfD1Yt3YiCgQWMNW649887VGJiGr/L5i2osbl8C9+WJTeucF+S76xFxdU6jE0NQ+Z+zEdhUTooNRaY5nZiu5PgDB0ED/ZKBUSLKL7eibMxZtMlUDHjm4gwQco1KRMDSmXSMkDwIDAQAB-----END PUBLIC KEY-----";
    encryptor.setPublicKey(server_publickey);

    let encryptedSymmetricKey = encryptor.encrypt(generated_key);

    socket.emit('connection-request', {
        data: 'User Connected',
        encryptedSymmetricKey: encryptedSymmetricKey //sending encrypted symmetric key
    })

    let form = $('form').on('submit', function (e) {

        e.preventDefault()

        let user_name = $('input.username').val()
        let user_input = $('input.message').val()

        //Set fields to 'alert' mode while empty
        $('#message').removeClass("alert alert-danger")
        $('#username').removeClass("alert alert-danger")

        if (user_name !== '' && user_input != '') {
            this_usr = user_name
            console.log('\nSENDING MESSAGE: ')

            let encrypted_input = encrypt(user_input, key).toString();
            socket.emit('message-request', {
                user_name: user_name,
                message: encrypted_input
            });
            
            $('input.message').val('').focus()
            if (user_name !== undefined) document.getElementById("username").disabled = true;

        } else {
            if (user_input == undefined)
                $('#message').addClass("alert alert-danger")
            if (user_name == undefined)
                $('#username').addClass("alert alert-danger")
        }
    })
})

socket.on('message-response', function (msg) {

    $('h3').remove()

    let user = decodeURIComponent(escape(msg.user_name))
    let message = decodeURIComponent(escape(msg.message))
    console.log('\nRECEIVE MESSAGE:')
    console.log("Message from server before decryption: " + message)
    let mess = message.toString()
    mymessage = decrypt(mess, key)
    console.log('Message from server after decryption: '+mymessage)


    //Adding message bubbles
    if (user == this_usr) { //my bubbles
        $('p.me-sign').remove() //remove prev signature
        $('ul.mess').append('<li class="me">' + mymessage + '</li><br><p class="me-sign">' + user + '</p>')
    } else { //other bubbles
        $('p.him-sign').remove() //remove prev signature
        $('ul.mess').append('<li class="him">' + mymessage + '</li><br><p class="him-sign">' + user + '</p>')
    }
})

socket.on('connection-response', function (msg) {
    console.log(msg)
})



