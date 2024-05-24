document.addEventListener("DOMContentLoaded", function () {
    const sellButton = document.getElementById("sellButton");
    const sellPage = document.getElementById("sellPage");
    const closeButton = document.querySelector(".close-button");

    sellButton.addEventListener("click", function () {
        sellPage.style.display = "block";
    });

    closeButton.addEventListener("click", function () {
        sellPage.style.display = "none";
    });

    window.addEventListener("click", function (event) {
        if (event.target === sellPage) {
            sellPage.style.display = "none";
        }
    });

    const displayData = (data) => {
        document.getElementById("inscriptionIdDisplay").innerText = data.data.inscriptionId;
        document.getElementById("heightDisplay").innerText = data.data.height;
        document.getElementById("contentTypeDisplay").innerText = data.data.contentType;
        document.getElementById("inscriptionNumberDisplay").innerText = data.data.inscriptionNumber;
        document.getElementById("addressDisplay").innerText = data.data.address;

        document.getElementById("inscriptionData").style.display = "block";

        // Calculate and display the total bytes of the inscription
        const totalBytes = calculateBytesOfInscription(data.data);
        document.getElementById("totalBytesDisplay").innerText = totalBytes + ' bytes';

        // Calculate and display the estimated fee if a fee rate is selected
        calculateAndDisplayFee(totalBytes);
    };

    const searchButton = document.getElementById("searchButton");
    searchButton.addEventListener("click", async function () {
        const inscriptionId = document.getElementById("inscriptionId").value;
        if (inscriptionId) {
            try {
                const response = await fetch(`https://open-api.unisat.io/v1/indexer/inscription/info/${inscriptionId}`, {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json',
                        'Authorization': 'Bearer c59bac93894b3c67296fbf4e656bda301c2bf09b9a296a8dd7f46667b08938de'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Inscription Data:", data);

                // Display the fetched data using the displayData function
                displayData(data);

            } catch (error) {
                console.error("Error fetching inscription data:", error);
                alert("Failed to fetch inscription data. Please try again.");
            }
        } else {
            alert("Please enter an Inscription ID");
        }
    });

    // Calculate the bytes of the inscription
    function getStringBytes(str) {
        return new TextEncoder().encode(str).length;
    }

    function calculateBytesOfInscription(inscription) {
        let totalBytes = 0;

        for (const key in inscription) {
            if (typeof inscription[key] === 'string') {
                totalBytes += getStringBytes(inscription[key]);
            } else if (Array.isArray(inscription[key])) {
                inscription[key].forEach(item => {
                    totalBytes += getStringBytes(item);
                });
            } else if (inscription[key] instanceof ArrayBuffer) {
                totalBytes += inscription[key].byteLength;
            }
        }

        return totalBytes;
    }

    // Initialize fee rate form
    const init = async () => {
        const response = await fetch('https://mempool.space/api/v1/fees/recommended');
        const feesRecommended = await response.json();

        // Get the form element
        const form = document.getElementById("feeRateForm");

        // Clear any existing content in the form
        form.innerHTML = '';

        // Create radio buttons for each fee rate
        for (const [key, value] of Object.entries(feesRecommended)) {
            const radioWrapper = document.createElement("div");

            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = "feeRate";
            radio.id = key;
            radio.value = value;

            const label = document.createElement("label");
            label.htmlFor = key;
            label.textContent = `${key}: ${value} sat/vB`;

            radioWrapper.appendChild(radio);
            radioWrapper.appendChild(label);
            form.appendChild(radioWrapper);

            // Add event listener to calculate and display fee on change
            radio.addEventListener("change", () => {
                const totalBytes = parseInt(document.getElementById("totalBytesDisplay").innerText);
                calculateAndDisplayFee(totalBytes);
            });
        }
    };

    // Calculate and display the estimated fee
    function calculateAndDisplayFee(totalBytes) {
        const selectedFeeRate = document.querySelector('input[name="feeRate"]:checked');
        if (selectedFeeRate) {
            const feeRate = parseFloat(selectedFeeRate.value);
            const estimatedFee = (totalBytes / 1024) * feeRate;
            document.getElementById("estimatedFeeDisplay").innerText = `Estimated Fee: ${estimatedFee.toFixed(2)} sat`;
        } else {
            document.getElementById("estimatedFeeDisplay").innerText = "Estimated Fee: N/A";
        }
    }

    init();
});
