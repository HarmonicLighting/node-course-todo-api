const {SHA256,SHA512,SHA3} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = '123abc!';

bcrypt.genSalt(13,(err,salt)=>{
  bcrypt.hash(password,salt,(err,hash)=>{
    console.log(hash);
  });
});

var hashedPassword = '$2a$13$SVGNVwyfebypTwvjtyrcn.w7q9mYLpwccKLXvPGgdSdD4lRXPrg3G';

bcrypt.compare(password,hashedPassword,(err,res)=>{
  console.log(res);
});

// var data = {
//   id:10
// };
//
// var token = jwt.sign(data,'123abc');
// console.log(token);
//
// var decoded = jwt.verify(token,'123abc');
// console.log('decoded',decoded);

// var message = 'I am user number 2';
// var hash = SHA256(message).toString();
// var hash2 = SHA512(message).toString();
// var hash3 = SHA3(message).toString();
//
// console.log('Message: '+message);
// console.log('SHA256: '+hash);
// console.log('SHA512: '+hash2);
// console.log('SHA3: '+hash3);
//
// var data = {
//   id: 4
// };
//
// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// };
//
// token.data.id = 5;
//
// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();
//
// if (resultHash == token.hash) {
//   console.log('Data was not changed');
// }else{
//   console.log('Data was changed');
// }
