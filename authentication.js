const BrowserWindow = require('electron').remote.BrowserWindow;
// Храните глобальную ссылку на объект окна, если вы этого не сделаете, окно будет
// автоматически закрываться, когда объект JavaScript собирает мусор.

//для того, чтобы мы могли закрыть окно аутентификации
const remote = require('electron').remote;

var sqlite3 = require('sqlite3').verbose();


let winApp;

//Регистрация
let btnRegister = document.getElementById('registerUser');
btnRegister.addEventListener('click', () => {
  let logRegFieldsCont = document.getElementById('logRegCont');

  logRegFieldsCont.innerHTML = `<input type="text" id="regName" placeholder="Имя пользователя *">
      <input type="password" id="regPass" placeholder="Пароль *">
      <input type="password" id="regConfPass" placeholder="Подтвердите пароль *">
      <input type="submit" id="regAccept" value="Подтвердить">`;

let btnRegAccept = document.getElementById('regAccept');
btnRegAccept.addEventListener('click', () => {
  let name = document.getElementById('regName').value;
  let pass = document.getElementById('regPass').value;
  let confPass = document.getElementById('regConfPass').value;

  //проверка на пустоту
  if (name && pass && confPass) {
    //проверка на длинну
    if (name.length <= 30 && pass.length <= 30 &&
        confPass.length <= 30) {
      // проверка на совпадение паролей
      if (pass === confPass) {
          // alert(`Значения полей 
          //       login ${name}
          //       pass ${pass}
          //       conf pass ${confPass}`);
          document.getElementById('authMessage').textContent = '';
           
          var db = new sqlite3.Database('database/clientsinfo.db');
          console.log('Open the database connection');
          //переменная массив со всеми именами учеток, чтобы проверять на схожеть с именем новой учетки.
          let dbNamesArr = [];
          db.serialize(function () {
            db.each(`select users.users_name
                     from users;`, (err, row) => {
              dbNamesArr.push(row.users_name);
            });

            setTimeout(() => {
              let nameIsDifferent = (arg) => {
                return arg !== name;
              };

              if (dbNamesArr.every(nameIsDifferent) == true) {
                let authMessage = `Учетная запись успешно создана. Теперь вы можете войти в нее`;
                document.getElementById('authMessage').textContent = authMessage;
                document.getElementById('authMessage').style.color = '#25DE2F';
                db.run(`INSERT INTO users(users_name, users_password)
                  VALUES (?, ?)`, [name, pass]);
                
              } else {
                let authMessage = `Учетная запись с таким именем уже существует.`;
                document.getElementById('authMessage').textContent = authMessage;
                document.getElementById('authMessage').style.color = '#FF1C1C';
              }
              db.close((err) => {
                if (err) {
                  return console.error(err.message);
                }
                console.log('Close the database connection.');
              });
              // alert(dbNamesArr.every(nameIsDifferent));
            }, 1200);
          }); 


      } else {
        let authMessage = `Пароли не совпадают`;
        alert(authMessage);
        document.getElementById('authMessage').textContent = authMessage;
        document.getElementById('authMessage').style.color = '#FF1C1C';
      }
    } else {
      let authMessage = `Максимальная длинна поля - 30 символов`;
      alert(authMessage);
      document.getElementById('authMessage').textContent = authMessage;
      document.getElementById('authMessage').style.color = '#FF1C1C';
    }
  } else {
    let authMessage = `Все поля должны быть заполнены`;
    alert(authMessage);
    document.getElementById('authMessage').textContent = authMessage;
    document.getElementById('authMessage').style.color = '#FF1C1C';
  }
});
});


//Вход 
let btnLogin = document.getElementById('loginUser');
btnLogin.addEventListener('click', () => {
  let logRegFieldsCont = document.getElementById('logRegCont');
  logRegFieldsCont.innerHTML = `<input type="text" id="loginName" placeholder="Имя пользователя *">
      <input type="password" id="loginPass" placeholder="Пароль *">
      <input type="submit" id="loginAccept" value="Подтвердить *">`;

  let btnloginAccept = document.getElementById('loginAccept');
  btnloginAccept.addEventListener('click', () => {
    let name = document.getElementById('loginName').value;
    let pass = document.getElementById('loginPass').value;

      var db = new sqlite3.Database('database/clientsinfo.db');
      console.log('Open the database connection');
      let allowence = 'no';
      db.serialize(function () {
        db.each(`SELECT users_name,
         users_password
         FROM users;`, (err, row) => {
          if (name === row.users_name &&
            pass === row.users_password) {
            allowence = 'yes';
          }
        });
      }); 

      setTimeout(() => {
        if (allowence === 'yes') {
          
          winApp = new BrowserWindow({ width: '100%', height: '100%' });

          //отправлаяем имя текущей авторизированой учетной записи в page-add.html
          // winApp.webContents.on('did-finish-load', () => {
          //   winApp.webContents.send('message', name);
          // });
          //другой вариант
          db.serialize(function () {
            db.run(`DELETE FROM current_user`);
            db.run(`INSERT INTO current_user(current_user_name)
                    VALUES (?)`, [name]);
          });

          winApp.loadFile('page-add.html');
          winApp.webContents.openDevTools();

          //сделаем окно во весь экран
          if (!winApp.isMaximized()) {
            winApp.maximize();          
          }

          // Вызывается, когда окно будет закрыто.
          winApp.on('closed', () => {
          // Разбирает объект окна, обычно вы можете хранить окна     
          // в массиве, если ваше приложение поддерживает несколько окон в это время,
          // тогда вы должны удалить соответствующий элемент.
          winApp = null;
          });

          //закрываем окнто аутентификации, потом сделать через промисы
          setTimeout( () => {
            let window = remote.getCurrentWindow();
            window.close();
          }, 1000);

        } else {
              let authMessage = `Данные введены неправильно`;
              document.getElementById('authMessage').textContent = authMessage;
              document.getElementById('authMessage').style.color = '#FF1C1C';
        }
        db.close((err) => {
          if (err) {
            return console.error(err.message);
          }
          console.log('Close the database connection.');
        });
      }, 1000);

  });
});


let index = require('electron').remote.getGlobal('userName');
console.log(index);



// let openBtn = document.getElementById('openNew');
// openBtn.addEventListener('click', () => {
//   winApp = new BrowserWindow({ width: '100%', height: '100%' });
//   winApp.loadFile('page-add.html');
//   winApp.webContents.openDevTools();

//   //сделаем окно во весь экран
//   if (!winApp.isMaximized()) {
//     winApp.maximize();          
//   }

//     // Вызывается, когда окно будет закрыто.
//     winApp.on('closed', () => {
//     // Разбирает объект окна, обычно вы можете хранить окна     
//     // в массиве, если ваше приложение поддерживает несколько окон в это время,
//     // тогда вы должны удалить соответствующий элемент.
//     winApp = null;
//     });


//     //закрываем окнто аутентификации
//     let window = remote.getCurrentWindow();
//     window.close();
// });




