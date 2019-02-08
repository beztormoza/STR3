var sqlite3 = require('sqlite3').verbose();
const BrowserWindow = require('electron').remote.BrowserWindow;
const remote = require('electron').remote;


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

//создадим функцию, которая проанализирует полученые поля с фильтра и вернет соответствующее условия с SQL запроса
let renderSearchElements = (sqlquery) => {
		//подключаемся к БД
		var db = new sqlite3.Database('database/clientsinfo.db');
		console.log('Open the database connection');
		db.serialize(function () {
			let searchContainer = document.getElementById('searchContainer');
			//сначала нужно очистить от предыдущего хлама
			searchContainer.innerHTML = '<h2>Результаты поиска</h2>';

			db.each(sqlquery, (err, row) => {
				console.log(row);				

				let mainContainer = document.createElement('div');
				mainContainer.classList.add('client-info-cont');

				let deleteInfoBtn = document.createElement('div');
				deleteInfoBtn.classList.add('client-info-delete');

				//вешаем сразу обработчик на удаление из Бд и со страницы
				deleteInfoBtn.addEventListener('click', () => {
					let allowence = confirm('Хотите удалить данную запись?');
					if (allowence) {
						let targetElement = event.target || event.srcElement;
						let fullInfoCont = targetElement.parentElement;
        				let idOfFullInfoCont = fullInfoCont.querySelector('table tr:first-child td:last-child');

        				
        				//теперь удалим со страницы
        				searchContainer.removeChild(fullInfoCont);

        				//удалим с БД
        				idOfFullInfoCont = idOfFullInfoCont.textContent;
        				// подкл к бд
        				var db = new sqlite3.Database('database/clientsinfo.db');
        				console.log('Open the database connection.');
        				db.serialize(function() {
        					//сначала скопируем перед удалением
        					console.log(`coping client #${idOfFullInfoCont}`);
        					db.run(`INSERT INTO clients_deleted SELECT * FROM clients WHERE clients.clients_id = ${idOfFullInfoCont};`);

        					console.log(`deleting client #${idOfFullInfoCont}`);
        					db.run(`DELETE FROM clients
        							WHERE clients.clients_id = '${idOfFullInfoCont}';`);
        					});

        				//закрываем соединение с БД
        				db.close((err) => {
        				if (err) {
        					return console.error(err.message);
        					}
        					console.log('Close the database connection.');
        				});
        				actionNotification(`Удалено`);
					}
				});

				mainContainer.append(deleteInfoBtn);


				let tableInfo = document.createElement('table');

				for (var i = 0; i < 11; i++) {
					let tableRow = document.createElement('tr');
					let cellOne = document.createElement('td');
					let cellTwo = document.createElement('td');
					switch (i) {
						case 0:
							cellOne.textContent = `Номер заказа`;
							cellTwo.textContent = `${row.clients_id}`;
						break;
						case 1:
							cellOne.textContent = `Кто добавил?`;
							cellTwo.textContent = `${row.client_current_user}`;
						break;
						case 2:
							cellOne.textContent = `ФИО клиента`;
							cellTwo.textContent = `${row.clients_name}`;
						break;
						case 3:
							cellOne.textContent = `Тел. клиента`;
							cellTwo.textContent = `${row.clients_phone}`;
						break;
						case 4:
							tableRow.classList.add('important-row');
							cellOne.textContent = `Vin-код`;
							cellTwo.textContent = `${row.clients_vincode}`;
						break;
						case 5:
							tableRow.classList.add('important-row');
							cellOne.textContent = `Автономер`;
							cellTwo.textContent = `${row.client_vehicle_number}`;
						break;
						case 6:
							tableRow.classList.add('important-row');
							cellOne.textContent = `Автомобиль`;
							//создадим и настроим окошко с показом цвета
							let colorShowCont = document.createElement('span');
							colorShowCont.classList.add('carColorCont');
							colorShowCont.style.backgroundColor = row.client_vehicle_color;
							cellTwo.textContent = `${row.marque_name} ${row.model_name}`;
							cellTwo.append(colorShowCont);
						break;
						case 7:
							tableRow.classList.add('important-row');
							cellOne.textContent = `Год выпуска авто`;
							cellTwo.textContent = `${row.client_vehicle_year}`;
						break;
						case 8:
							tableRow.classList.add('important-row');
							cellOne.textContent = `Тех. проблема`;
							cellTwo.textContent = `${row.category_name} (${row.repair_object_name})`;
						break;
						case 9:
							cellOne.textContent = `Заметки`;
							cellTwo.textContent = `${row.clients_note}` || `пусто`;
						break;
						case 10:
							cellOne.textContent = `Дата ремонта`;
							cellTwo.textContent = `${row.client_repair_date}` || `пусто`;
						break;
						case 11:
							cellOne.textContent = `Цена ремонта`;
							cellTwo.textContent = `${row.client_repair_cost}` || `пусто`;
						break;

						default:
							cellOne.textContent = `Error`;
					}
					tableRow.append(cellOne, cellTwo);
					tableInfo.append(tableRow);
				}

				mainContainer.append(tableInfo);

				//добавляем инфу об одном клиента в общий контейнер поиска 
				searchContainer.append(mainContainer);
			});
		});

		//закрываем соединение с БД
		db.close((err) => {
			if (err) {
				return console.error(err.message);
			}
			console.log('Close the database connection.');
		});
};



//запрос на поиск в БД и рендеринг найденых элементов
let starSearch = document.getElementById('filterSearch');
starSearch.addEventListener('click', () => {
	let vinCodeField = document.getElementById('vinCode');
	let carNumberField = document.getElementById('carNumber');
	let clientNameField = document.getElementById('clientName');

	if (vinCodeField.value ||
		carNumberField.value ||
		clientNameField.value) {

		let createSqlClause = (elem) => {
			let sqlclauseArr = [];
			for (var i = 0; i < elem.length; i++) {
				if (elem[i].value) {
					if (elem[i].id === 'clientName') {
						sqlclauseArr.push(`${elem[i].getAttribute('sqlclause')} like '${elem[i].value}'`);
					} else {
						sqlclauseArr.push(`${elem[i].getAttribute('sqlclause')} = '${elem[i].value}'`);
					}
				}
			}
			let sqlclauseStr = ``;
			for (var i = 0; i < sqlclauseArr.length; i++) {
				sqlclauseStr += sqlclauseArr[i];
				if (i !== sqlclauseArr.length - 1) {
					sqlclauseStr += ` and `;
				}
			}
		// console.log(sqlclauseStr);
			return sqlclauseStr;
		};
		let sqlClause = createSqlClause([vinCode, carNumberField, clientNameField]);
		sqlClause = `select *
					 from clients,
	 						model, marque,
	 						breakdown, category, repair_object
					where clients.client_vehicle = model.model_id and
	  					  model.model_marque_id = marque.marque_id and
	  					  clients.clients_technical_problem = breakdown.breakdown_id and
	  					  breakdown.breakdown_category_id = category.category_id and
	  					  breakdown.breakdown_repair_object_id = repair_object.repair_object_id and ${sqlClause};`;
		// console.log(sqlClause);
		renderSearchElements(sqlClause);
		actionNotification('Поиск по фильтру');
	} else {
		alert(`Настройте фильтр`);
	}
});


//очищаем поля фильтра
let clearFields = document.getElementById('filterClear');
clearFields.addEventListener('click', () => {
	document.getElementById('vinCode').value = '';
	document.getElementById('carNumber').value = '';
	document.getElementById('clientName').value = '';
	actionNotification('Поля очищены');
});


//смотрим всю базу
let showAllDatabase = document.getElementById('showAllDb');
showAllDatabase.addEventListener('click', () => {
	let queryFindAllClients = `select *
							   from clients,
	 								model, marque,
	 								breakdown, category, repair_object
								where clients.client_vehicle = model.model_id and
	 								model.model_marque_id = marque.marque_id and
	  									clients.clients_technical_problem = breakdown.breakdown_id and
	  									breakdown.breakdown_category_id = category.category_id and
	 									breakdown.breakdown_repair_object_id = repair_object.repair_object_id;`;
	renderSearchElements(queryFindAllClients);
	actionNotification(`Просмотр базы данных клиентов`);
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
let actionNotification = (txt) => {
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