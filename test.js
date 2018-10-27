// function intervalFunc() {
//   console.log('Cant stop me now!');
// }

// setInterval(intervalFunc, 1500);

var i = 0

const intervalObj = setInterval(() => {
  console.log('interviewing the interval');

  if (i == 5) {
  	clearInterval(intervalObj);

  		var j = 0

		const intervalObj2 = setInterval(() => {
		  console.log('now we are in the internal loop.');

		  if (j == 5) {
		  	clearInterval(intervalObj2);
		  }

		  else { j++ }

		}, 500);


  }

  else { i++ }

}, 500);

console.log("this line should not appear until everything is finished.")

// clearInterval(intervalObj);
