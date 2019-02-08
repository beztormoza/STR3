		var sqlite3 = require('sqlite3').verbose();
		
		var db = new sqlite3.Database('database/test.db');
		db.serialize(function () {
			db.run("CREATE TABLE IF NOT EXISTS Products (name, barcode, quantity)");

			// db.run("INSERT INTO Products VALUES (?, ?, ?)", ['product001', 'xxxxx', 20]);
			// db.run("INSERT INTO Products VALUES (?, ?, ?)", ['product002', 'xxxxx', 40]);
			// db.run("INSERT INTO Products VALUES (?, ?, ?)", ['product003', 'xxxxx', 60]);

			db.each("SELECT * FROM Products", function (err, row) {
				console.log(row);
			});

			console.log('creating table');
			// db.run(`CREATE TABLE IF NOT EXISTS users (
			// 	id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
			// 	name varchar(30) NOT NULL,
			// 	age INTEGER(3) NOT NULL
			// 	)`);

/*			console.log('inserting');
			// INSERT INTO users(name, age)
			db.run("INSERT INTO users(name, age) VALUES (?, ?)", ["Den", 12]);
			db.run("INSERT INTO users(name, age) VALUES (?, ?)", ["Sasha", 22]);
			db.run("INSERT INTO users(name, age) VALUES (?, ?)", ["Oleg", 42]);
			db.run("INSERT INTO users(name, age) VALUES (?, ?)", ["Vasya", 44]);

			console.log('updating');
			db.run("UPDATE users SET name = 'UPDATED' WHERE id = 3");*/

			// let body = document.getElementsByTagName('body')[0];
			// db.each("SELECT * FROM users", function (err, row) {
			// 	let div = document.createElement('div');
			// 	div.textContent = `${row.name} ${row.age} => number ${row.id}`;
			// 	body.append(div);
			// 	console.log(row);
			// });

		

			// let queryImplement = document.getElementById('query');
			// queryField.addEventListener("click", () => {
			// 	db.run
			// });

});

		// db.serialize(function() {
		// 	db.run("CREATE TABLE lorem (info TEXT)");

		// 	var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
		// 	for (var i = 0; i < 10; i++) {
		// 		stmt.run("Ipsum " + i);
		// 	}
		// 	stmt.finalize();

		// 	db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
		// 		console.log(row.id + ": " + row.info);
		// 	});
		// });

		// db.close();