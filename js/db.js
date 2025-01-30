if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            let reg = await navigator.serviceWorker.register('/sw.js', { type: "module" });
            console.log('Service worker registered successfully', reg);
        } catch (err) {
            console.error('Failed to register the service worker', err);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const cameraView = document.getElementById("camera-view");
    const cameraSensor = document.getElementById("camera-sensor");
    const cameraOutputContainer = document.getElementById("camera-output-container");
    const cameraButton = document.getElementById("cameraButton");
    const captureButton = document.getElementById("captureButton");
    const addGuitarButton = document.getElementById("addGuitar");
    const guitarInput = document.getElementById("guitarInput");
    const guitarList = document.getElementById("guitarList");

    let guitarCollection = JSON.parse(localStorage.getItem("guitarCollection")) || [];
    const cameraConfig = { video: { facingMode: "environment" }, audio: false };

    function startCamera() {
        navigator.mediaDevices.getUserMedia(cameraConfig)
            .then((stream) => {
                cameraView.srcObject = stream;
            })
            .catch((error) => {
                console.error("Camera access error", error);
                alert("Please allow camera access in your browser settings.");
            });
    }

    function captureImage() {
        cameraSensor.width = cameraView.videoWidth / 3;
        cameraSensor.height = cameraView.videoHeight / 3;
        cameraSensor.getContext("2d").drawImage(cameraView, 0, 0, cameraSensor.width, cameraSensor.height);

        const img = document.createElement("img");
        img.src = cameraSensor.toDataURL("image/webp");
        img.classList.add("captured-image");

        cameraOutputContainer.appendChild(img);
    }

    function updateGuitarList() {
        guitarList.innerHTML = "";
        guitarCollection.forEach((guitar, index) => {
            const li = document.createElement("li");
            li.textContent = guitar;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.onclick = () => removeGuitar(index);

            li.appendChild(deleteButton);
            guitarList.appendChild(li);
        });
    }

    function addGuitar() {
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

    addGuitarButton.addEventListener("click", addGuitar);
    cameraButton.addEventListener("click", startCamera);
    captureButton.addEventListener("click", captureImage);

    updateGuitarList();
});