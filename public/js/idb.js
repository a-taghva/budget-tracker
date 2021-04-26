let db;

const request = indexedDB.open('budget_tracker', 1);


request.onupgradeneeded = e => {
  const db = e.target.result;

  console.log('onupgradeneeded');
  db.createObjectStore('budget_db', { autoIncrement: true });
};

request.onsuccess = e => {
  console.log('onsuccess');
  db = e.target.result;
  console.log()

  if (navigator.online) {
    // upload data
  }
};

request.onerror = e => console.log(e.target.errorCode);

function saveRecord(record) {
  // open a new transaction with read and write permission
  const transaction = db.transaction(['budget_db'], 'readwrite');

  const budgetObjectStore = transaction.objectStore('budget_db');

  console.log(record);
  budgetObjectStore.add(record);
}  

function uploadTransactions() {
  // open transaction
  const transaction = db.transaction(["budget_db"], 'readwrite');

  const budgetObjectStore = transaction.objectStore("budget_db");

  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch('api/transaction', {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*', 
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }

          // open more transaction
          const transaction = db.transaction(["budget_db"], 'readwrite');
          const budgetObjectStore = transaction.objectStore('budget_db');
          budgetObjectStore.clear();

          alert('all transactions have been submitted!');
        })
        .catch(console.log);
    }
  }
}

window.addEventListener('online', uploadTransactions);