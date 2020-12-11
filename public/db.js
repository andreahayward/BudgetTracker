let db;
//new db request
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

// starts new request
request.onsuccess = function(event) {
    db = event.target.result;
  
    if (navigator.onLine) {
      checkDatabase();
    }
  };

  request.onerror = function(event) {
    console.log("We've encountered an error " + event.target.errorCode);
  };

  function saveRecord(record) {
    // create transaction on the pending db with readwrite access
    const transaction = db.transaction(["pending"], "readwrite");
  
    // access your pending object store
    const store = transaction.objectStore("pending");
  
    // add record
    store.add(record);
  }

  function checkDatabase() {
    // opens transaction
    const transaction = db.transaction(["pending"], "readwrite");
    // accesses pending object store
    const store = transaction.objectStore("pending");
    // gets records from store and set to a variable
    const getAll = store.getAll();
  
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
        .then(response => response.json())
        .then(() => {
          // if successful, open a transaction on your pending db
          const transaction = db.transaction(["pending"], "readwrite");
  
          // access your pending object store
          const store = transaction.objectStore("pending");
  
          // clear all items in your store
          store.clear();
        });
      }
    };
  }
  
  // listen for app coming back online
  window.addEventListener("online", checkDatabase);