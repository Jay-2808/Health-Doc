let isProcessing = false;

// Function to simulate a click on an element
function simulateClick(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.click();
    } else {
        console.error(`Element with ID "${elementId}" not found`);
    }
}

// Function to process the image and determine skin conditions
function processImage(file) {
    const fileName = file.name.toLowerCase();
    let results = [];
    
    // Simulated detection based on filename
    // Helper function to generate random confidence value within a range
    function getRandomConfidence(min, max) {
        return (Math.random() * (max - min) + min).toFixed(1) + '%';
    }

    if (fileName.startsWith('m')) {
        // Melanoma case
        results = [
            { disease: "Melanoma (MEL)", confidence: getRandomConfidence(85, 95), severity: "high" },
            { disease: "Benign Keratosis (BK)", confidence: getRandomConfidence(2, 8), severity: "low" },
            { disease: "Basal Cell Carcinoma (BCC)", confidence: getRandomConfidence(1, 6), severity: "medium" }
        ];
    } else if (fileName.startsWith('a')) {
        // Actinic Keratosis case
        results = [
            { disease: "Actinic Keratosis (AK)", confidence: getRandomConfidence(80, 92), severity: "medium" },
            { disease: "Squamous Cell Carcinoma (SCC)", confidence: getRandomConfidence(4, 10), severity: "high" },
            { disease: "Seborrheic Keratosis (SK)", confidence: getRandomConfidence(3, 8), severity: "low" }
        ];
    } else if (fileName.startsWith('p')) {
        // Psoriasis case
        results = [
            { disease: "Psoriasis", confidence: getRandomConfidence(87, 95), severity: "medium" },
            { disease: "Eczema", confidence: getRandomConfidence(3, 9), severity: "medium" },
            { disease: "Seborrheic Dermatitis", confidence: getRandomConfidence(1, 5), severity: "low" }
        ];
    } else if (fileName.startsWith('ac')) {
        // Acne case
        results = [
            { disease: "Acne Vulgaris", confidence: getRandomConfidence(90, 97), severity: "low" },
            { disease: "Rosacea", confidence: getRandomConfidence(2, 6), severity: "low" },
            { disease: "Folliculitis", confidence: getRandomConfidence(1, 4), severity: "low" }
        ];
    } else if (fileName.startsWith('e')) {
        // Eczema case
        results = [
            { disease: "Eczema", confidence: getRandomConfidence(85, 94), severity: "medium" },
            { disease: "Contact Dermatitis", confidence: getRandomConfidence(4, 10), severity: "medium" },
            { disease: "Psoriasis", confidence: getRandomConfidence(1, 6), severity: "medium" }
        ];
    } else {
        // No disease detected
        results = [
            { disease: "No disease detected", confidence: getRandomConfidence(95, 99), severity: "none" },
            { disease: "Benign Keratosis (BK)", confidence: getRandomConfidence(0.5, 3), severity: "low" },
            { disease: "Vascular Lesion (VASC)", confidence: getRandomConfidence(0.1, 2), severity: "low" }
        ];
    }
    
    // Display the results with a fade-in animation
    displayResults(results);
    
    // Reset processing flag
    isProcessing = false;
}

// Update the displayResults function to handle severity
function displayResults(results) {
    const predictionList = document.getElementById('prediction-list');
    predictionList.innerHTML = '';
    
    results.forEach((result, index) => {
        const li = document.createElement('li');
        li.textContent = `${result.disease} - ${result.confidence}`;
        li.className = `severity-${result.severity}`;
        li.style.opacity = '0';
        li.style.transform = 'translateY(10px)';
        li.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        predictionList.appendChild(li);
        
        // Staggered animation
        setTimeout(() => {
            li.style.opacity = '1';
            li.style.transform = 'translateY(0)';
        }, 100 * index);
    });
    
    // Add styles for different severity levels
    if (!document.getElementById('severity-styles')) {
        const style = document.createElement('style');
        style.id = 'severity-styles';
        style.textContent = `
            .severity-high {
                color: #ff3157;
                font-weight: bold;
                animation: pulse 2s infinite;
            }
            .severity-medium {
                color: #ff9800;
                font-weight: bold;
            }
            .severity-low {
                color: #2196F3;
            }
            .severity-none {
                color: #4CAF50;
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Apply warning class if primary condition is high severity
    if (results[0].severity === "high") {
        predictionList.classList.add('warning-result');
    } else {
        predictionList.classList.remove('warning-result');
    }
}

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Set up the image selector event listener
    const imageSelector = document.getElementById('image');
    if (imageSelector) {
        imageSelector.addEventListener('change', function(e) {
            if (isProcessing) {
                return;
            }
            
            isProcessing = true;
            const file = e.target.files[0];
            if (file) {
                // Display the selected image
                const selectedImage = document.getElementById('selected-image');
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    selectedImage.src = e.target.result;
                    // Process the image after a short delay to allow UI update
                    setTimeout(function() {
                        processImage(file);
                    }, 500);
                };
                
                reader.readAsDataURL(file);
            } else {
                isProcessing = false;
            }
        });
    } else {
        console.error('Image selector element not found');
    }
    
    // Connect the image-selector with the hidden input field
    const hiddenImageSelector = document.getElementById('image-selector');
    if (hiddenImageSelector) {
        hiddenImageSelector.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Transfer the file to the main image input
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                document.getElementById('image').files = dataTransfer.files;
                
                // Trigger the change event on the main image input
                const event = new Event('change', { bubbles: true });
                document.getElementById('image').dispatchEvent(event);
            }
        });
    }
});
