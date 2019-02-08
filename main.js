const { app, BrowserWindow } = require('electron');

// Храните глобальную ссылку на объект окна, если вы этого не сделаете, окно будет
// автоматически закрываться, когда объект JavaScript собирает мусор.
let winAuthentication;

function createWindow () {
  // Создаёт окно браузера.
  winAuthentication = new BrowserWindow({ width: 700, height: 650, maxWidth: 600, maxHeight: 500 });

  // и загрузит index.html приложение.
  winAuthentication.loadFile('authentication.html');

  // Открыть средства разработчика.
  // winAuthentication.webContents.openDevTools();

  // Вызывается, когда окно будет закрыто.
  winAuthentication.on('closed', () => {
    // Разбирает объект окна, обычно вы можете хранить окна     
    // в массиве, если ваше приложение поддерживает несколько окон в это время,
    // тогда вы должны удалить соответствующий элемент.
    winAuthentication = null;
  });

}

// Этот метод будет вызываться, когда Electron закончит 
// инициализацию и готов к созданию окон браузера.
// Некоторые интерфейсы API могут использоваться только после возникновения этого события.
app.on('ready', createWindow);

// Выйти, когда все окна будут закрыты.
app.on('window-all-closed', () => {
  // Оставаться активным до тех пор, пока пользователь не выйдет полностью с помощью Cmd + Q,
  // это обычное дело для приложений и их строки меню на macOS
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
   // На MacOS обычно пересоздают окно в приложении,
   // после того, как на иконку в доке нажали, и других открытых окон нету.
   if (win === null) {
    createWindow();
  }
});


