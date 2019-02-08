var sqlite3 = require('sqlite3').verbose();

const BrowserWindow = require('electron').remote.BrowserWindow;
const remote = require('electron').remote;

// //получаем имя текущей авторизированой учетной записи с authentication
// const ipc = require('electron').ipcRenderer;
// ipc.on('message', (event, message) => {
//     document.getElementById('currentUser').textContent = message;
// });
//другой вариант
var db = new sqlite3.Database('database/clientsinfo.db');
console.log('Open the database connection');
db.serialize(function () {
	db.get(`select current_user.current_user_name
			from current_user;`, (err, row) => {
		document.getElementById('currentUser').textContent = row.current_user_name;
	});
});
db.close((err) => {
	if (err) {
		return console.error(err.message);
	}
	console.log('Close the database connection.');
});


//рендеринг пункта "Выбор авто"
let renderCarsElements = () => {
	var db = new sqlite3.Database('database/clientsinfo.db');
	console.log('Open the database connection');
	db.serialize(function () {
		let marqueOfCar = document.getElementById('carMarque');
		db.each(`select marque.marque_id,
				marque.marque_name
				from marque
				order by marque.marque_name asc;`, (err, row) => {
		let marqueOfCarItem = document.createElement('option');
		marqueOfCarItem.setAttribute('value', row.marque_id);
		marqueOfCarItem.textContent = row.marque_name;
		marqueOfCar.append(marqueOfCarItem);
		// console.log(`${row.marque_id}: ${row.marque_name}`);
		});
	});
	db.close((err) => {
		if (err) {
			return console.error(err.message);
		}
		console.log('Close the database connection.');
	});
};



let renderRepairElements = () => {
	var db = new sqlite3.Database('database/clientsinfo.db');
	console.log('Open the database connection');
	db.serialize(function () {

	//рендеринг пункта "что чиним"
	let repairCont = document.getElementById('repair-container');

	db.each(`select distinct category.category_name,
		category.category_id
		from breakdown, category
		where breakdown.breakdown_category_id = category.category_id
		order by category.category_name asc;`, (err, row) => {
			let divCategory = document.createElement('div');
			divCategory.classList.add('category');

			let categoryH3 = document.createElement('h3');
			categoryH3.setAttribute('categoryid', row.category_id);
			categoryH3.textContent = row.category_name;
			divCategory.append(categoryH3);

			let categoryList = document.createElement('ul');
			categoryList.classList.add('category-points');


			db.each(`select category.category_name,
				repair_object.repair_object_name,
				repair_object.repair_object_id
				from repair_object, breakdown, category
				where breakdown.breakdown_category_id = category.category_id and
				breakdown.breakdown_repair_object_id = repair_object.repair_object_id and
				category.category_name = '${row.category_name}'
				order by repair_object.repair_object_name asc;`, (err, row2) => {
				// console.log(`${row.category_name}: ${row2.repair_object_name}`);
				let categoryLi = document.createElement('li');
				categoryLi.setAttribute('repobjid', row2.repair_object_id);
				categoryLi.textContent = row2.repair_object_name;


				//повесим обработчик на каждый (обработчик, который будет выводит текст	 выбранного и вешать атрибут)
				//Создаем функцию для пунктов категории ремонта и вешаем ее на каждый
				function chooseRepairItem() {
					let repairCategoryOption = document.getElementById('repair-category-option');

					let target = event.target || event.srcElement;
					let parentTarget = target.parentElement.parentElement;
					parentTarget = parentTarget.querySelector('h3');
					repairCategoryOption.textContent = `Ваш выбор: ${parentTarget.textContent} (${target.textContent})`;

					//Плюс, имея атрибуты с id категории и объекта, мы выполним запрос БД, чтобы, основываясь на уже имеющихся данных, мы получили id поломики, который потом будет добавлен в атрибут абзаца с содержанием поломки
					var db = new sqlite3.Database('database/clientsinfo.db');
					console.log('Open the database connection');
					db.get(`select breakdown.breakdown_id
							from breakdown, category, repair_object
							where breakdown.breakdown_category_id = category.category_id and
							breakdown.breakdown_repair_object_id = repair_object.repair_object_id and
							category.category_id = ${parentTarget.getAttribute('categoryid')} and
							repair_object.repair_object_id = ${target.getAttribute('repobjid')};`, (err, row3) => {
							repairCategoryOption.setAttribute('breakdownid', row3.breakdown_id);
					});
					db.close((err) => {
						if (err) {
							return console.error(err.message);
						}
						console.log('Close the database connection.');
					});
				}
				categoryLi.addEventListener('click', chooseRepairItem);

				categoryList.append(categoryLi);
			});

			divCategory.append(categoryList);
			repairCont.append(divCategory);
		});	
	});
	setTimeout(() => {
		db.close((err) => {
			if (err) {
				return console.error(err.message);
			}
			console.log('Close the database connection.');
		});
	}, 5000);
};

renderCarsElements();
renderRepairElements();


	//Создадим спец. обработчик для селекта выбора мерки, чтобы в зависимости от выбраной осуществлялся подходящий запрос в БД, который рендерил бы модели марки в след. селекте.
	//создадим еще раз
	let marqueOfCar = document.getElementById('carMarque');
	marqueOfCar.addEventListener('change', () => {
		let chosenMarque = marqueOfCar[marqueOfCar.selectedIndex].value;

		marqueOfCar.setAttribute('chosenMarque', chosenMarque);

		let modelOfCar = document.getElementById('carModel');

    	// перед тем как добавлять в селект модели его сначала нужно очистить от предыдущих значений, всех кроме модели
    	modelOfCar.innerHTML = '';

    	//после того как присвоили селекту "марка" атрибут с выбраным значением мы будем рендерить селектор "модель"
    	var db = new sqlite3.Database('database/clientsinfo.db');
		console.log('Open the database connection');
    	db.serialize(function () {
    		//теперь уже добавляем
    		db.each(`select	model.model_id,
							model.model_name
					 from model, marque
					 where model.model_marque_id = marque.marque_id and
	  					 marque.marque_id = ${chosenMarque}
						 order by model.model_name asc;`, (err, row) => {
				let modelOfCarItem = document.createElement('option');
				modelOfCarItem.setAttribute('value', row.model_id);
				modelOfCarItem.textContent = row.model_name;
				modelOfCar.append(modelOfCarItem);

				//для того чтобы селекту модели в атрибут записать первое значение аттрибута опшн, когда мы меняем марку
				if (modelOfCar.length === 1) {
					modelOfCar.setAttribute('chosenModel', modelOfCar.firstElementChild.value);
				}
    		});

    		//также как и с маркой повесим id модели в атрибут селекта модели, чтобы в будущем было легко достать его для добавления в БД 		
    		modelOfCar.addEventListener('change', () => {
    			let chosenModel = modelOfCar[modelOfCar.selectedIndex].value;
				modelOfCar.setAttribute('chosenModel', chosenModel);
    		});

    	});

    	db.close((err) => {
    		if (err) {
    			return console.error(err.message);
    		}
    		console.log('Close the database connection.');
    	});

	});


//вешаем обработчик на клавишу добавления кортежа в БД
let btnAddClientToDb = document.getElementById('addClient');
btnAddClientToDb.addEventListener('click', () => {
	let vinCodeValue = document.getElementById('vinCode').value;
	let carNumberValue  = document.getElementById('carNumber').value;
	let carModelValue = document.getElementById('carModel').getAttribute('chosenmodel');
	let breakdownValue = document.getElementById('repair-category-option').getAttribute('breakdownid');

	//new rows in db
	let clientsNumberValue = document.getElementById('clientPhoneNumber').value;
	let carReleaseYearValue = document.getElementById('carYear').value;
	let carColorValue = document.getElementById('carColor').value;
	let currentUserValue = document.getElementById('currentUser').textContent;

	if (!vinCodeValue || !carNumberValue ||
		!carModelValue || carModelValue === null ||
		!breakdownValue || breakdownValue === null ||
		!clientsNumberValue || !carReleaseYearValue ||
		!currentUserValue || currentUserValue === null) {
		return actionNotification(`Ошибка, проверьте правильность введенных данных`);
	}

	//получаем остальные переменные, которые не есть обязательными
	let clientNameValue = document.getElementById('clientName').value;
	let repairDateValue = document.getElementById('repairDate').value;
	let repairDay = repairDateValue.substring(8, 10);
	let repairMonth = repairDateValue.substring(5, 7);
	let repairYear = repairDateValue.substring(0, 4);
	repairDateValue = `${repairDay}.${repairMonth}.${repairYear}`;

	let repairCostValue = document.getElementById('repairCost').value;
	let clientNoteValue = document.getElementById('clientNote').value;

	//подключаемся к БД
	var db = new sqlite3.Database('database/clientsinfo.db');
	console.log('Open the database connection');
	db.run(`INSERT INTO clients(clients_name, client_repair_date, client_repair_cost, clients_note, clients_vincode, client_vehicle_number, client_vehicle, clients_technical_problem, clients_phone, client_vehicle_year, client_vehicle_color, client_current_user)
			VALUES
				 (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [clientNameValue, repairDateValue, repairCostValue, clientNoteValue, vinCodeValue, carNumberValue, carModelValue, breakdownValue, clientsNumberValue, carReleaseYearValue, carColorValue, currentUserValue]);
	//закрываем соединение с БД
	db.close((err) => {
		if (err) {
			return console.error(err.message);
	   	}
		console.log('Close the database connection.');
	});
	actionNotification(`Запись была успешно добавлена в базу данных`);
	
	// alert(` vinCodeValue = ${vinCodeValue}
	// 	   carNumberValue = ${carNumberValue}
	// 	   carModelValue = ${carModelValue}
	// 	   breakdownValue = ${breakdownValue}
	// 	   clientNameValue = ${clientNameValue}
	// 	   repairingDate = ${repairingDate}
	// 	   repairCostValue = ${repairCostValue}
	// 	   clientNoteValue = ${clientNoteValue}`);

});

//сменить пользователя
let changeCurrentUser = document.getElementById('changeCurrentUser');
changeCurrentUser.addEventListener('click', () => {
	winAuthentication = new BrowserWindow({ width: 700, height: 650 });

	var db = new sqlite3.Database('database/clientsinfo.db');
	console.log('Open the database connection');
	db.serialize(function () {
		db.run(`DELETE FROM current_user`);
	});
	db.close((err) => {
		if (err) {
			return console.error(err.message);
		}
		console.log('Close the database connection.');
	});

	winAuthentication.loadFile('authentication.html');
          // winApp.webContents.openDevTools();

          // Вызывается, когда окно будет закрыто.
    winAuthentication.on('closed', () => {
          // Разбирает объект окна, обычно вы можете хранить окна     
          // в массиве, если ваше приложение поддерживает несколько окон в это время,
          // тогда вы должны удалить соответствующий элемент.
    	winAuthentication = null;
    });

    setTimeout( () => {
    	let window = remote.getCurrentWindow();
    	window.close();
    }, 1000);
});

//блок уведомлений
function actionNotification(txt) {
	let notificationMessage = document.getElementById('notificationMessage');
	notificationMessage.textContent = txt;

	let notificationCont = document.getElementById('notificationCont');
	let i = 1;
	notificationCont.style.display = "flex";
	notificationCont.style.opacity = i;
	let timerId = setInterval( () => {
		i -= 0.05;
		notificationCont.style.opacity = i;
		if (i <= 0) {
			clearInterval(timerId);
			notificationCont.style.display = "none";
		}
	}, 100);
};

// модальные окна
// let modal = document.
// let btnAddRepairObj = document.getElementById('addRepairObj');
// btnAddRepairObj.addEventListener('click', () => {
// 	let modal = document.getElementById('modalEdit');
// 	modal.style.display = "block";

// 	let spanClose = document.getElementById('modalClose');
// 	spanClose.addEventListener('click', () => {
// 		modal.style.display = "none";
// 	});

// 	//Заполним селект старыми категориями
// 	let newCategories = document.getElementById('newCategories');
// 	let oldCategories = document.getElementById('oldCategories');
// 	var db = new sqlite3.Database('database/clientsinfo.db');
// 	console.log('Open the database connection');
// 	db.each(`select *
// 			 from category;`, (err, row) => {
// 		let option = document.createElement('option');
// 		option.setAttribute('value', row.category_id);
// 		option.textContent = row.category_name;
// 		oldCategories.append(option);
// 	});
// 	db.close((err) => {
// 		if (err) {
// 			return console.error(err.message);
// 		}
// 		console.log('Close the database connection.');
// 	});
// 	oldCategories.addEventListener('change', () => {
// 		newCategories.value = "";
// 	});
// 	newCategories.addEventListener('keydown', () => {
// 		oldCategories.value = '0';
// 	});
// 	let btnAddToRepairObj = document.getElementById('addToRepairObj');
// 	btnAddToRepairObj.addEventListener('click', () => {
// 		let pointToCat = document.getElementById('pointToCat').value;
// 		let checkeSelect = oldCategories.options[oldCategories.selectedIndex].value;
// 		if (pointToCat && checkeSelect != 0 || newCategories.value) {
// 			var db = new sqlite3.Database('database/clientsinfo.db');
// 			console.log('Open the database connection');
// 			let lastIdOfCategory = 0;
// 			if (checkeSelect != 0) {
// 				lastIdOfCategory = checkeSelect;
// 			} else {
// 				db.run(`INSERT INTO category(category_name) VALUES(?)`, [newCategories.value]);
// 				lastIdOfCategory = 0;
// 				db.each(`SELECT * FROM category`, (err, row) => {
// 					lastIdOfCategory++;
// 				});
// 			}
// 			db.run(`INSERT INTO repair_object(repair_object_name) VALUES(?)`, [pointToCat]);
// 			let lastIdOfRepairObject = 0;
// 			db.each(`SELECT * FROM repair_object`, (err, row) => {
// 					lastIdOfRepairObject++;
// 			});
// 			setTimeout(() => {
// 				console.log("lastIdOfCategory", lastIdOfCategory);
// 				console.log("lastIdOfRepairObject", lastIdOfRepairObject);
// 				db.run(`INSERT INTO breakdown(breakdown_category_id, breakdown_repair_object_id) VALUES(?, ?)`, [lastIdOfCategory, lastIdOfRepairObject]);
// 				db.close((err) => {
// 					if (err) {
// 						return console.error(err.message);
// 					}
// 					console.log('Close the database connection.');
// 				});
// 				document.getElementById('repair-container').innerHTML = '';
// 				renderRepairElements();
// 				modal.style.display = "none";
// 			}, 500);
// 		} else {
// 			alert('Поля заполнены неправильно');
// 		}

// 		// alert(`${checkeSelect}
// 		// 	   ${newCategories.value}`);

// 	});
// });








