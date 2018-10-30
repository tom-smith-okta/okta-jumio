	var promise1 = new Promise(function(resolve, reject) {
	  setTimeout(function() {
	    resolve('foo');
	  }, 300);
	});

	promise1.then(function(value) {
	  console.log(value);
	  // expected output: "foo"
	});

	console.log(promise1);
	// expected output: [object Promise]


	var i = 0

	var promise2 = new Promise(function(resolve, reject) {

		for (i =0; i <= 10; i++) {

			if (i > 5) {resolve(i)}

		}
	});

	promise2.then(function(value) {
	  console.log(value);
	  // expected output: "foo"
	});

	console.log(promise2);
	// expected output: [object Promise]