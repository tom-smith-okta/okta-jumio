	  // var users = require("users.json")

const fs = require('fs');

let rawdata = fs.readFileSync('users.json')

let users = JSON.parse(rawdata)

console.log(users[0])

var this_user = users[0]

var new_user = {}

new_user.referenceID = "54321"
new_user.userID = "87654"

console.log("the referenceID is: " + this_user.referenceID)

users.push(new_user)

fs.writeFileSync('users.json', JSON.stringify(users));





// function intervalFunc() {
//   console.log('Cant stop me now!');
// }

// setInterval(intervalFunc, 1500);

// var i = 0

// const intervalObj = setInterval(() => {
//   console.log('interviewing the interval');

//   if (i == 5) {
//   	clearInterval(intervalObj);

//   		var j = 0

// 		const intervalObj2 = setInterval(() => {
// 		  console.log('now we are in the internal loop.');

// 		  if (j == 5) {
// 		  	clearInterval(intervalObj2);
// 		  }

// 		  else { j++ }

// 		}, 500);


//   }

//   else { i++ }

// }, 500);

// console.log("this line should not appear until everything is finished.")

// // clearInterval(intervalObj);
