if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            let reg = await navigator.serviceWorker.register('/sw.js', { type: "module" });
            console.log('service worker registered successfully congrats', reg);
        } catch (err) {
            console.log('failed to register the service worker bitch', err);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const cameraView = document.getElementById("camera-view");
    const cameraSensor = document.getElementById("camera-sensor");
    const cameraOutputContainer = document.getElementById("camera-output-container");
    const cameraButton = document.getElementById("cameraButton");
    const captureButton = document.getElementById("captureButton");
    const cameraContainer = document.getElementById("camera");
    const addGuitarButton = document.getElementById("addGuitar");
    const guitarInput = document.getElementById("guitarInput");
    const guitarList = document.getElementById("guitarList");

    let guitarCollection = JSON.parse(localStorage.getItem("guitarCollection")) || [];
    const cameraConfig = { video: { facingMode: "environment" }, audio: false };
    if (cameraContainer) {
        cameraContainer.style.display = "flex";
        cameraContainer.style.justifyContent = "center";
        cameraContainer.style.alignItems = "center";
        cameraContainer.style.marginTop = "35px";
    }

    function startCamera() {
        if (!cameraView) return;
        
        navigator.mediaDevices.getUserMedia(cameraConfig)
            .then((stream) => {
                cameraView.srcObject = stream;
                cameraView.style.display = "block";
            })
            .catch((error) => {
                console.error("your camera is bad", error);
                alert("pls allow camera access in your browser settings if you wanna use");
            });
    }

   
    function captureImage() {
        if (!cameraSensor || !cameraView || !cameraOutputContainer) return;

        cameraSensor.width = cameraView.videoWidth / 3;
        cameraSensor.height = cameraView.videoHeight / 3;
        cameraSensor.getContext("2d").drawImage(cameraView, 0, 0, cameraSensor.width, cameraSensor.height);
        
        const img = document.createElement("img");
        img.src = cameraSensor.toDataURL("image/webp");
        img.style.width = "100px";
        img.style.height = "75px";
        img.style.margin = "5px";
        img.style.border = "1px solid #000";

        cameraOutputContainer.appendChild(img);
    }

    function updateGuitarList() {
        if (!guitarList) return;
    
        guitarList.innerHTML = "";
        guitarCollection.forEach((guitar, index) => {
            const li = document.createElement("li");
    
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.classList.add("guitar-checkbox");
            checkbox.dataset.index = index;
    
            const label = document.createElement("span");
            label.textContent = guitar;
            label.style.marginLeft = "10px";
    
            li.appendChild(checkbox);
            li.appendChild(label);
            guitarList.appendChild(li);
        });
    }
    

    function removeSelectedGuitars() {
        const checkboxes = document.querySelectorAll(".guitar-checkbox:checked");
        const indicesToRemove = Array.from(checkboxes).map(checkbox => parseInt(checkbox.dataset.index));
    
       
        guitarCollection = guitarCollection.filter((_, index) => !indicesToRemove.includes(index));
    
        localStorage.setItem("guitarCollection", JSON.stringify(guitarCollection));
        updateGuitarList();
    }
    
    const deleteSelectedButton = document.createElement("button");
    deleteSelectedButton.textContent = "delete";
    deleteSelectedButton.classList.add("delete-button");
    deleteSelectedButton.onclick = removeSelectedGuitars;
    document.querySelector(".right-side").appendChild(deleteSelectedButton);
    
    function addGuitar() {
        if (!guitarInput) return;

        const guitar = guitarInput.value.trim();
        if (guitar) {
            guitarCollection.push(guitar);
            localStorage.setItem("guitarCollection", JSON.stringify(guitarCollection));
            updateGuitarList();
            guitarInput.value = "";
        }
    }

   
    function removeGuitar(index) {
        guitarCollection.splice(index, 1);
        localStorage.setItem("guitarCollection", JSON.stringify(guitarCollection));
        updateGuitarList();
    }

    
    if (addGuitarButton) addGuitarButton.addEventListener("click", addGuitar);
    if (cameraButton) cameraButton.addEventListener("click", startCamera);
    if (captureButton) captureButton.addEventListener("click", captureImage);

    updateGuitarList();
    startCamera();
});
