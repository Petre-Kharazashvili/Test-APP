const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveTestToFile: (testData) => ipcRenderer.invoke('save-test-to-file', testData),
  loadTestFromFile: (filePath) => ipcRenderer.invoke('load-test-from-file', filePath),
  listTestFiles: () => ipcRenderer.invoke('list-test-files'), // Add this line
  saveStudentResultsToFile: (studentResults) => ipcRenderer.invoke('save-student-results-to-file', studentResults),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  onFileSelected: (callback) => ipcRenderer.on('file-selected', callback),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  onLoadTestFile: (callback) => ipcRenderer.on('load-test-file', callback),
  getTestFilePath: (file) => ipcRenderer.invoke('get-test-file-path', file),
  saveTestResults: (results) => ipcRenderer.invoke('save-test-results', results),
  loadAllTestResults: () => ipcRenderer.invoke('load-all-test-results'),
});