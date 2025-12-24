const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const { writeFileSync, readdirSync, existsSync, mkdirSync, readFileSync } = require('fs');
const { join } = require('path');

let mainWindow;

// Handle file opening on macOS and Windows
if (process.platform === 'win32' || process.platform === 'darwin') {
  if (process.argv.length >= 2) {
    const filePath = process.argv[1];
    if (filePath && filePath.endsWith('.quiz')) {
      openTestFile(filePath);
    }
  }
}

// Create the main window
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 1000,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      devTools: true,
      contextIsolation: true,
      nodeIntegration: true,
    },
  });

  // Load the index.html file
  mainWindow.loadFile(join(__dirname, 'index.html'));

  // Open DevTools (optional for debugging)
  mainWindow.webContents.openDevTools();
};

// Handle file opening
function openTestFile(filePath) {
  if (!mainWindow) {
    createWindow();
  }

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('load-test-file', filePath);
  });
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling
app.whenReady().then(() => {
  createWindow();

  // Register the app as the default handler for .quiz files
  if (process.platform === 'win32' || process.platform === 'darwin') {
    app.setAsDefaultProtocolClient('quiz');
  }
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Re-create the window when the app is activated (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers for Database Operations
ipcMain.handle('save-test-to-file', (event, testData) => {
  const testsDir = join(__dirname, 'tests');

  // 1. Create the 'tests' directory if it doesn't exist
  if (!existsSync(testsDir)) {
    try {
      mkdirSync(testsDir, { recursive: true }); // 'recursive: true' creates parent folders if needed
      console.log('Created tests directory:', testsDir);
    } catch (error) {
      console.error('Error creating tests directory:', error);
      return { success: false, error: error.message };
    }
  }

  // 2. Generate a safe filename (replace slashes to avoid subfolder issues)
  const fileName = `${testData.title.replace(/[\/\\]/g, '_')}_test.quiz`; // Removes / and \ from title
  const filePath = join(testsDir, fileName);

  // 3. Save the file
  try {
    writeFileSync(filePath, JSON.stringify(testData, null, 2));
    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle loading test data from a file
ipcMain.handle('load-test-from-file', (event, filePath) => {
  try {
    const data = readFileSync(filePath, 'utf-8');
    const testData = JSON.parse(data);
    return { success: true, testData };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('list-test-files', () => {
  const testsDir = join(__dirname, 'tests');
  console.log('Looking for tests in:', testsDir);

  if (!existsSync(testsDir)) {
    console.error('Tests directory does not exist:', testsDir);
    return [];
  }

  const files = readdirSync(testsDir).filter((file) => file.endsWith('.quiz'));
  console.log('Test files found:', files);
  return files;
});

// Handle saving student results to a file
ipcMain.handle('save-student-results-to-file', (event, studentResults) => {
  const desktopPath = join(require('os').homedir(), 'Desktop');
  const fileName = `${studentResults.testTitle.replace(/ /g, '_')}_Results.json`;
  const filePath = join(desktopPath, fileName);

  try {
    writeFileSync(filePath, JSON.stringify(studentResults, null, 2));
    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Handle file open dialog
ipcMain.handle('open-file-dialog', async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Quiz Files', extensions: ['quiz'] }],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Handle opening a file in the default text editor
ipcMain.handle('open-file', (event, filePath) => {
  return shell.openPath(filePath);
});

ipcMain.handle('get-test-file-path', (event, file) => {
  const testsDir = join(__dirname, 'tests');
  return join(testsDir, file);
});

// Handle file opening via protocol (quiz://)
app.on('open-url', (event, url) => {
  event.preventDefault();
  const filePath = url.replace('quiz://', '');
  if (filePath.endsWith('.quiz')) {
    openTestFile(filePath);
  }
});

// Add to your existing main process (main.js)
ipcMain.handle('save-test-results', (event, results) => {
  const resultsDir = join(__dirname, 'test-results');
  if (!existsSync(resultsDir)) {
    mkdirSync(resultsDir, { recursive: true });
  }

  const fileName = `${results.testTitle.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
  const filePath = join(resultsDir, fileName);

  try {
    writeFileSync(filePath, JSON.stringify(results, null, 2));
    return { success: true, filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-all-test-results', async () => {
  const resultsDir = join(__dirname, 'test-results');
  if (!existsSync(resultsDir)) {
    return { success: true, results: [] };
  }

  try {
    const files = readdirSync(resultsDir).filter(file => file.endsWith('.json'));
    const results = files.map(file => {
      const data = readFileSync(join(resultsDir, file), 'utf-8');
      return JSON.parse(data);
    });
    return { success: true, results };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

