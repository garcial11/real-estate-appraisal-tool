// Function to update the cap rate and square foot value display values
function updateSliderValue(id, displayId) {
    const sliderValue = document.getElementById(id).value;
    document.getElementById(displayId).textContent = sliderValue;
}

// Function to dynamically generate property forms based on the number entered
function generatePropertyForms() {
    const numProperties = parseInt(document.getElementById("numProperties").value);
    const container = document.getElementById("propertyFormsContainer");
    const actionButton = document.getElementById("actionButton");

    container.innerHTML = ''; // Clear previous entries

    if (isNaN(numProperties) || numProperties < 1) {
        alert("Please enter a valid number of properties.");
        return;
    }

    actionButton.textContent = "Calculate Appraisal"; // Change button text

    // Generate input fields for each property
    for (let i = 1; i <= numProperties; i++) {
        const propertySection = document.createElement("div");
        propertySection.className = "property-section";
        propertySection.innerHTML = `
            <h3>Property ${i}</h3>
            
            <div class="bed-rent-row">
                <label for="description_${i}">Description:</label>
                <input type="text" id="description_${i}" placeholder="e.g., Single Family, 4-Plex" class="description-input">
            </div>

            <!-- Space between description and bed details -->
            <div style="margin-bottom: 10px;"></div>

            <!-- Bed Count and Market Rent Fields for Different Bed Types -->
            <div class="bed-rent-row">
                <label for="oneBedCount_${i}">1-Bed Units:</label>
                <input type="number" id="oneBedCount_${i}" min="0" placeholder="Count" class="bed-input">
                <input type="number" id="oneBedRent_${i}" min="0" placeholder="Market Rent" class="rent-input">
            </div>

            <div class="bed-rent-row">
                <label for="twoBedCount_${i}">2-Bed Units:</label>
                <input type="number" id="twoBedCount_${i}" min="0" placeholder="Count" class="bed-input">
                <input type="number" id="twoBedRent_${i}" min="0" placeholder="Market Rent" class="rent-input">
            </div>

            <div class="bed-rent-row">
                <label for="threeBedCount_${i}">3-Bed Units:</label>
                <input type="number" id="threeBedCount_${i}" min="0" placeholder="Count" class="bed-input">
                <input type="number" id="threeBedRent_${i}" min="0" placeholder="Market Rent" class="rent-input">
            </div>

            <div class="bed-rent-row">
                <label for="fourBedCount_${i}">4-Bed Units:</label>
                <input type="number" id="fourBedCount_${i}" min="0" placeholder="Count" class="bed-input">
                <input type="number" id="fourBedRent_${i}" min="0" placeholder="Market Rent" class="rent-input">
            </div>

            <!-- Space between bed details and cap rate -->
            <div style="margin-bottom: 10px;"></div>

            <div class="bed-rent-row">
                <label for="askingPrice_${i}">Asking Price:</label>
                <input type="number" id="askingPrice_${i}" placeholder="e.g., 315000" class="price-input">
            </div>

            <!-- Cap Rate Slider -->
            <label for="capRate_${i}">Cap Rate %: <span id="capRateValue_${i}">5</span>%</label>
            <input type="range" id="capRate_${i}" min="0" max="20" step="0.1" value="5" oninput="updateSliderValue('capRate_${i}', 'capRateValue_${i}')">

            <!-- Space between cap rate and square footage -->
            <div style="margin-bottom: 10px;"></div>

            <!-- Square Footage Field -->
            <div class="bed-rent-row">
                <label for="sqFt_${i}">Square Footage:</label>
                <input type="number" id="sqFt_${i}" min="0" placeholder="e.g., 1500" class="sqft-input">
            </div>

            <!-- Space between square footage and Sq Ft Value slider -->
            <div style="margin-bottom: 10px;"></div>

            <!-- Sq Ft Value of Similar Properties Slider -->
            <label for="sqFtValue_${i}">Sq Ft Value of Similar Properties: $<span id="sqFtValueDisplay_${i}">225</span></label>
            <input type="range" id="sqFtValue_${i}" min="150" max="300" step="1" value="225" oninput="updateSliderValue('sqFtValue_${i}', 'sqFtValueDisplay_${i}')">
        `;
        container.appendChild(propertySection);
    }
}

// Function to calculate appraisal values and generate a PDF report
function calculateAppraisal() {
    const numProperties = parseInt(document.getElementById("numProperties").value);
    if (isNaN(numProperties) || numProperties < 1) {
        alert("Please enter a valid number of properties.");
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(16);
    doc.text("Real Estate Appraisal Report", 10, 10);
    doc.setFontSize(12);

    let yOffset = 20; // Starting y position for property entries

    for (let i = 1; i <= numProperties; i++) {
        const description = document.getElementById(`description_${i}`).value;
        const askingPrice = parseFloat(document.getElementById(`askingPrice_${i}`).value);
        const capRate = parseFloat(document.getElementById(`capRate_${i}`).value) / 100;
        const sqFt = parseInt(document.getElementById(`sqFt_${i}`).value) || 0;
        const sqFtValue = parseFloat(document.getElementById(`sqFtValue_${i}`).value);

        // Calculate potential rent from all bed types
        const oneBedCount = parseInt(document.getElementById(`oneBedCount_${i}`).value) || 0;
        const oneBedRent = parseFloat(document.getElementById(`oneBedRent_${i}`).value) || 0;
        const twoBedCount = parseInt(document.getElementById(`twoBedCount_${i}`).value) || 0;
        const twoBedRent = parseFloat(document.getElementById(`twoBedRent_${i}`).value) || 0;
        const threeBedCount = parseInt(document.getElementById(`threeBedCount_${i}`).value) || 0;
        const threeBedRent = parseFloat(document.getElementById(`threeBedRent_${i}`).value) || 0;
        const fourBedCount = parseInt(document.getElementById(`fourBedCount_${i}`).value) || 0;
        const fourBedRent = parseFloat(document.getElementById(`fourBedRent_${i}`).value) || 0;

        const potentialRent = (oneBedCount * oneBedRent) + (twoBedCount * twoBedRent) +
                              (threeBedCount * threeBedRent) + (fourBedCount * fourBedRent);

        const estimatedExpenses = potentialRent * 0.4;
        const estimatedValue = (potentialRent - estimatedExpenses) / (capRate / 12);
        const valueDifference = estimatedValue - askingPrice;
        const valueCompMethod = sqFt * sqFtValue;

        const formattedRent = potentialRent.toLocaleString("en-US", { style: "currency", currency: "USD" });
        const formattedExpenses = estimatedExpenses.toLocaleString("en-US", { style: "currency", currency: "USD" });
        const formattedValue = estimatedValue.toLocaleString("en-US", { style: "currency", currency: "USD" });
        const formattedAskingPrice = askingPrice.toLocaleString("en-US", { style: "currency", currency: "USD" });
        const formattedCapRate = (capRate * 100).toFixed(1) + "%";
        const formattedDifference = valueDifference.toLocaleString("en-US", { style: "currency", currency: "USD" });
        const formattedValueComp = valueCompMethod.toLocaleString("en-US", { style: "currency", currency: "USD" });
        const formattedSqFtValue = sqFtValue.toLocaleString("en-US", { style: "currency", currency: "USD" });

        // Check if yOffset has exceeded the page height, and add a new page if necessary
        if (yOffset + 80 > pageHeight) { // 80 is approximate height per property section
            doc.addPage();
            yOffset = 20; // Reset y position for new page
        }

        // Property title with larger, bold font
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(`Property ${i}: ${description}`, 10, yOffset);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        yOffset += 10;

        // Property details
        yOffset += 5;
        doc.text(`1-Bed Units: ${oneBedCount} at ${oneBedRent.toLocaleString("en-US", { style: "currency", currency: "USD" })} each`, 10, yOffset);
        yOffset += 10;
        doc.text(`2-Bed Units: ${twoBedCount} at ${twoBedRent.toLocaleString("en-US", { style: "currency", currency: "USD" })} each`, 10, yOffset);
        yOffset += 10;
        doc.text(`3-Bed Units: ${threeBedCount} at ${threeBedRent.toLocaleString("en-US", { style: "currency", currency: "USD" })} each`, 10, yOffset);
        yOffset += 10;
        doc.text(`4-Bed Units: ${fourBedCount} at ${fourBedRent.toLocaleString("en-US", { style: "currency", currency: "USD" })} each`, 10, yOffset);
        yOffset += 10;

        yOffset += 5;
        doc.text(`Potential Rent (Monthly): ${formattedRent}`, 10, yOffset);
        yOffset += 10;
        doc.text(`Estimated Expenses: ${formattedExpenses}`, 10, yOffset);
        yOffset += 10;
        doc.setFont("helvetica", "bold");
        doc.text(`Estimated Potential Value when Stable: ${formattedValue}`, 10, yOffset);
        doc.setFont("helvetica", "normal");
        yOffset += 10;
        doc.text(`Asking Price: ${formattedAskingPrice}`, 10, yOffset);
        yOffset += 10;

        doc.setFont("helvetica", "bold");
        doc.text(`Difference (Estimated - Asking): ${formattedDifference}`, 10, yOffset);
        yOffset += 10;
        doc.text(`Value Comp. Method (Sq Ft * Sq Ft Value): ${formattedValueComp}`, 10, yOffset);
        yOffset += 10;
        doc.text(`Sq Ft Value of Similar Properties: ${formattedSqFtValue}`, 10, yOffset);
        doc.setFont("helvetica", "normal");

        yOffset += 10;
        doc.text(`Cap Rate: ${formattedCapRate}`, 10, yOffset);
        yOffset += 10;
        doc.text(`Square Footage: ${sqFt} sq. ft.`, 10, yOffset);

        yOffset += 20; // Space between properties
    }

    doc.save("Real_Estate_Appraisal_Report.pdf");
}

