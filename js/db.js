import { openDB } from "idb";

let database;

async function initializeDB() {
    try {
        database = await openDB('guitarDB', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('guitarCollection')) {
                    const store = db.createObjectStore('guitarCollection', {
                        keyPath: 'model',
                        autoIncrement: true
                    });
                    store.createIndex('id', 'id');
                    console.log("Fire on!! working database!");
                }
            }
        });
        console.log("open guitar database.");
    } catch (e) {
        console.error("failed newba error creating the database:", e.message);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await initializeDB();

    const addGuitarButton = document.getElementById("addGuitar");
    const guitarInput = document.getElementById("guitarInput");
    const guitarList = document.getElementById("guitarList");

    if (addGuitarButton) {
        addGuitarButton.addEventListener("click", addGuitar);
    }

    if (guitarInput && guitarList) {
        loadGuitars();
    }
});

async function loadGuitars() {
    if (!database) {
        console.error("database not yet loaded sorry");
        return;
    }
    try { 
        const tx = database.transaction('guitarCollection', 'readonly');
        const store = tx.objectStore('guitarCollection');
        const guitars = await store.getAll();
        const guitarList = document.getElementById("guitarList");
        if (!guitarList) return;

        guitarList.innerHTML = "";

        if (guitars.length > 0) {
            guitars.forEach(guitar => {
                const listItem = document.createElement("li");
                listItem.textContent = guitar.model;

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "del";
                deleteButton.style.marginLeft = "10px";
                deleteButton.onclick = () => removeGuitar(guitar.id); 

                listItem.appendChild(deleteButton);
                guitarList.appendChild(listItem);
            });
        } else {
            console.log("no guitars in your collection :(");
        }
    } catch (error) {
        console.error("Error loading guitars:", error);
    }
}

async function addGuitar() {
    const guitarInput = document.getElementById("guitarInput");
    
    let foto = localStorage.getItem("image");


    let model = guitarInput.value.trim();
    

    if (!database) {
        console.error("database not loaded srry");
        return;
    }
    console.log(foto)
    try { 
        const tx = database.transaction('guitarCollection', 'readwrite');
        const store = tx.objectStore('guitarCollection');
        await store.add({ model, foto }); 
        await tx.done; 
        guitarInput.value = "";
        loadGuitars();
    } catch (error) {
        console.error('error adding ur guitar:', error);
    }
}

async function removeGuitar(id) {
    if (!database) {
        console.error("error adding ur guitar:");
        return;
    }

    try { 
        const tx = database.transaction('guitarCollection', 'readwrite');
        const store = tx.objectStore('guitarCollection');
        await store.delete(id);
        await tx.done; 
        console.log('your guitar removed successfully. why');
        loadGuitars();
    } catch (error) {
        console.error('error removing ur guitar:', error);
    }
}