import { openDB } from "idb"; 

let database;

async function initializeDB() {
    try {
        database = await openDB('guitarDB', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('guitarCollection')) {
                    const store = db.createObjectStore('guitarCollection', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    store.createIndex('model', 'model', { unique: false });
                    console.log("Fire on!! working database!");
                }
            }
        });
        console.log("open guitar database.");
    } catch (e) {
        console.error("failed error creating the database:", e.message);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await initializeDB();

    const addGuitarButton = document.getElementById("addGuitar");
    if (addGuitarButton) {
        addGuitarButton.addEventListener("click", addGuitar);
    }

    loadGuitars();
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
                
                // Exibir imagem
                if (guitar.foto) {
                    const img = document.createElement("img");
                    img.src = guitar.foto;
                    img.style.width = "100px";
                    img.style.height = "75px";
                    img.style.marginRight = "10px";
                    listItem.appendChild(img);
                }

                listItem.appendChild(document.createTextNode(guitar.model));

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

    if (!model) {
        console.error("Guitar model cannot be empty.");
        return;
    }

    if (!database) {
        console.error("database not loaded srry");
        return;
    }

    try { 
        const tx = database.transaction('guitarCollection', 'readwrite');
        const store = tx.objectStore('guitarCollection');
        await store.add({ model, foto }); 
        await tx.done; 
        guitarInput.value = "";
        loadGuitars();
    } catch (error) {
        console.error('error adding guitar:', error);
    }
}

async function removeGuitar(id) {
    if (!database) {
        console.error("database not loaded.");
        return;
    }

    try { 
        const tx = database.transaction('guitarCollection', 'readwrite');
        const store = tx.objectStore('guitarCollection');
        await store.delete(id);
        await tx.done; 
        console.log('Guitar removed successfully.');
        loadGuitars();
    } catch (error) {
        console.error('error removing guitar:', error);
    }
}
