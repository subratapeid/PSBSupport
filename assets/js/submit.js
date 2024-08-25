let fieldCount = 1;

document.getElementById('addFieldBtn').addEventListener('click', function () {
    fieldCount++;
    const newField = `
        <div class="mb-3 input-group">
            <span class="input-group-text">${fieldCount}</span>
            <input type="text" class="form-control" name="agentId[]" placeholder="Enter Agent ID" oninput="sanitizeInput(this)">
            <button class="btn btn-outline-danger" type="button" onclick="removeField(this)">
                <i class="fas fa-trash-alt"></i>
            </button>
            <div class="invalid-feedback"></div>
        </div>
    `;
    document.getElementById('inputFields').insertAdjacentHTML('beforeend', newField);
});

function removeField(button) {
    const fieldGroup = button.parentElement;
    fieldGroup.remove();
    updateSerialNumbers();
}

function updateSerialNumbers() {
    const fieldGroups = document.querySelectorAll('#inputFields .input-group');
    fieldCount = 0;
    fieldGroups.forEach((group, index) => {
        fieldCount = index + 1;
        group.querySelector('.input-group-text').textContent = fieldCount;
    });
}

function sanitizeInput(input) {
    // Convert to uppercase and remove non-alphanumeric characters
    const sanitizedValue = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    input.value = sanitizedValue;
}

function validateInputs(agentIds) {
    const trimmedAgentIds = agentIds.map(id => id.trim());
    const uniqueAgentIds = new Set(trimmedAgentIds);
    const duplicates = trimmedAgentIds.filter((id, index) => trimmedAgentIds.indexOf(id) !== index && id !== '');

    // Reset previous errors
    document.querySelectorAll('#inputFields .input-group').forEach((group, index) => {
        group.classList.remove('invalid');
        const feedback = group.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.textContent = '';
        }
        const inputField = group.querySelector('input[name="agentId[]"]');
        if (inputField) {
            inputField.classList.remove('is-invalid');
        }
    });

    let isValid = true;
    const inputGroups = document.querySelectorAll('#inputFields .input-group');

    // Check for empty and space-only IDs
    trimmedAgentIds.forEach((id, index) => {
        const inputGroup = inputGroups[index];
        const inputField = inputGroup.querySelector('input[name="agentId[]"]');
        
        if (id === '') {
            isValid = false;
            inputGroup.classList.add('invalid');
            inputField.classList.add('is-invalid');
            inputGroup.querySelector('.invalid-feedback').textContent = 'Agent ID cannot be empty.';
        } else if (/^\s*$/.test(id)) {
            isValid = false;
            inputGroup.classList.add('invalid');
            inputField.classList.add('is-invalid');
            inputGroup.querySelector('.invalid-feedback').textContent = 'Agent ID cannot be only spaces. Please remove spaces.';
        }
    });

    // Check for duplicates
    if (duplicates.length > 0) {
        isValid = false;
        trimmedAgentIds.forEach((id, index) => {
            if (duplicates.includes(id) && id !== '') {
                const inputGroup = inputGroups[index];
                inputGroup.classList.add('invalid');
                inputGroup.querySelector('.invalid-feedback').textContent = 'Duplicate Agent ID detected.';
            }
        });
    }

    // Ensure at least one ID is entered
    if (trimmedAgentIds.every(id => id === '')) {
        isValid = false;
        const firstGroup = document.querySelector('#inputFields .input-group');
        if (firstGroup) {
            firstGroup.classList.add('invalid');
            firstGroup.querySelector('.invalid-feedback').textContent = 'Please enter at least one Agent ID.';
        }
    }

    return isValid;
}
    function disableSubmitBtn(){
    // Show spinner and change button text
    document.getElementById('spinner').style.display = 'inline-block';
    document.getElementById('buttonText').textContent = 'Submitting';
    document.getElementById('submitBtn').disabled = true;
    }
    function enableSubmitBtn(){
        // Hide spinner and revert button text
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('buttonText').textContent = 'Submit';
        document.getElementById('submitBtn').disabled = false;
    }
document.getElementById('agentForm').addEventListener('submit', function (event) {
    event.preventDefault();
    disableSubmitBtn();
    const agentIds = [];
    const inputs = document.querySelectorAll('input[name="agentId[]"]');
    inputs.forEach(input => {
        const trimmedValue = input.value.trim();
        if (trimmedValue) {
            agentIds.push(trimmedValue);
        }
    });

    if (!validateInputs(agentIds)) {
        enableSubmitBtn();
        return; // Stop form submission if validation fails
    }
    
    const sessionId = localStorage.getItem('sessionToken');
    const userRole = localStorage.getItem('userRole');
    const queryString = `?agentIds=${agentIds.join(',')}&userRole=${userRole}&sessionId=${sessionId}`;
    const url = `https://script.google.com/macros/s/AKfycbyq40LSn3KfthD0q4_V2jgNhgJTnhh2UNTv9p1ISuLc0b-z70CFN0Z7ojx_WDxesKZ6Gw/exec${queryString}`;
    console.log(url);
    
    fetch(url, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            toastr.success('Request Submitted Successfully');
            document.getElementById('agentForm').reset();
            document.getElementById('inputFields').innerHTML = `
                <div class="mb-3 input-group">
                    <span class="input-group-text">1</span>
                    <input type="text" class="form-control" name="agentId[]" placeholder="Enter Agent ID" oninput="sanitizeInput(this)">
                    <button class="btn btn-outline-danger" type="button" onclick="removeField(this)">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <div class="invalid-feedback"></div>
                </div>
            `;
            fieldCount = 1;
        } else {
            console.log(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to submit the form.');
    })

    .finally(() => {
        enableSubmitBtn();
    });
});

