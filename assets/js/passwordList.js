showOverlay('--Loading--');
    
      const filterBtn = document.getElementById('filterButton');
      const filterModal = document.getElementById('filterModal');
      let allData = [];
      let filteredData = [];
      let displayedData = [];
      let currentPage = 1;
      let entriesPerPage = 15;
      let filtersApplied = false;
      let selectedDateRange = {
                start: '',
                end: ''
            };
    
    // Fetch All Audit List From Backend
      document.addEventListener("DOMContentLoaded", function() {
      showOverlay('--Fetching Data--');
    
        // fetch('https://script.google.com/macros/s/AKfycbxT6kTAbSuPP_elWn97FceD8542tjsyPb7ihOsTgNx_J-jApuOj-g2tn3p68fQLX5YEhw/exec',{
        //     method: 'GET',
        //     headers: {
        //         'X-Requested-With': 'XMLHttpRequest'
        //     }
        //   })
        //   .then(response => response.json())
        //     .then(data => {
        //       allData = data.sort((a, b) => moment(b.date, 'DD-MM-YYYY') - moment(a.date, 'DD-MM-YYYY'));
        //       filteredData = allData;
        //       displayedData = allData;
        //       renderTable('short');
        //       populateDropdowns(allData);
        //       // console.log(allData);
        //     })

        fetch('https://script.google.com/macros/s/AKfycbxT6kTAbSuPP_elWn97FceD8542tjsyPb7ihOsTgNx_J-jApuOj-g2tn3p68fQLX5YEhw/exec')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const allData = data.data;
            console.log(allData);
        }
        })
        .catch(error => console.error('Error fetching data:', error));

        // Dummy data for testing
        // Dummy data for testing the table
        const dummyData = [
            {
                audit_number: 'AUD-001',
                bca_id: 'BCA123',
                bca_full_name: 'Rajesh Kumar',
                bca_contact_no: '9876543210',
                bca_bank: 'State Bank of India',
                state: 'Maharashtra',
                location: 'Mumbai',
                status: 'Completed',
                formatted_date: '15-08-2023',
                user_full_name: 'Anita Sharma'
            },
            {
                audit_number: 'AUD-002',
                bca_id: 'BCA456',
                bca_full_name: 'Sneha Patil',
                bca_contact_no: '9876543220',
                bca_bank: 'ICICI Bank',
                state: 'Karnataka',
                location: 'Bangalore',
                status: 'In Progress',
                formatted_date: '10-08-2023',
                user_full_name: 'Vikram Singh'
            },
            {
                audit_number: 'AUD-003',
                bca_id: 'BCA789',
                bca_full_name: 'Amitabh Thakur',
                bca_contact_no: '9876543230',
                bca_bank: 'HDFC Bank',
                state: 'Delhi',
                location: 'New Delhi',
                status: 'Pending',
                formatted_date: '20-08-2023',
                user_full_name: 'Priya Nair'
            },
            {
                audit_number: 'AUD-004',
                bca_id: 'BCA012',
                bca_full_name: 'Priya Gupta',
                bca_contact_no: '9876543240',
                bca_bank: 'Axis Bank',
                state: 'Gujarat',
                location: 'Ahmedabad',
                status: 'Completed',
                formatted_date: '05-08-2023',
                user_full_name: 'Sunil Mehra'
            },
            {
                audit_number: 'AUD-005',
                bca_id: 'BCA345',
                bca_full_name: 'Vikas Verma',
                bca_contact_no: '9876543250',
                bca_bank: 'Punjab National Bank',
                state: 'Tamil Nadu',
                location: 'Chennai',
                status: 'In Progress',
                formatted_date: '12-08-2023',
                user_full_name: 'Rashmi Desai'
            }
        ];

        // Example of using this dummy data in your table rendering
        allData = dummyData.sort((a, b) => moment(b.formatted_date, 'DD-MM-YYYY') - moment(a.formatted_date, 'DD-MM-YYYY'));
        filteredData = allData;
        displayedData = allData;

        // Call the functions as usual with the dummy data
        renderTable('short');
        populateDropdowns(allData);

    
        // Date picker funtionality start
        $('#dateRange').daterangepicker({
            singleDatePicker: false,
            showDropdowns: true,
            autoUpdateInput: false,
            locale: {
                format: 'DD-MM-YYYY',
                cancelLabel: 'Clear',
                applyLabel: 'Ok'
            },
            opens: 'left',
            linkedCalendars: false,
            startDate: moment(),
            endDate: moment()
        }, function(start, end) {
            $('#dateRange').val(start.format('DD-MM-YYYY') + ' - ' + end.format('DD-MM-YYYY'));
            selectedDateRange = {
                start: start.format('YYYY-MM-DD'),
                end: end.format('YYYY-MM-DD')
            };
        });
    
        function resetDatePicker(picker) {
            $('#dateRange').val('');
            selectedDateRange = {
                start: '',
                end: ''
            };
            picker.setStartDate(moment());
            picker.setEndDate(moment());
            picker.updateView();
    
            const currentMonth = moment().month();
            const currentYear = moment().year();
    
            const monthSelect = picker.container.find('.monthselect');
            const yearSelect = picker.container.find('.yearselect');
    
            monthSelect.val(currentMonth).change();
            yearSelect.val(currentYear).change();
    
            picker.hide();
        }
    
        $('#dateRange').on('cancel.daterangepicker', function(ev, picker) {
            resetDatePicker(picker);
        });
    
        $('#dateRange').on('apply.daterangepicker', function(ev, picker) {
            if ($(this).val() === '') {
                $(this).val(picker.startDate.format('DD-MM-YYYY') + ' - ' + picker.endDate.format('DD-MM-YYYY'));
                selectedDateRange = {
                    start: picker.startDate.format('YYYY-MM-DD'),
                    end: picker.endDate.format('YYYY-MM-DD')
                };
            }
        });
        // Date picker funtionality End
        // Reset filter form data start
        $('#resetFilterForm').on('click', function() {
            var picker = $('#dateRange').data('daterangepicker');
            resetDatePicker(picker);
            document.getElementById('filterForm').reset();
        });
        // Reset filter form data End
    
      });
      // Audit List Data fetch End
    
      // Table shorting funtionality start
        let currentSortColumn = 'formatted_date';
        let currentSortOrder = 'desc'; // Default to descending for date
    
        // Event listeners for sorting columns
        document.getElementById('header-audit_number').addEventListener('click', () => sortTable('audit_number'));
        document.getElementById('header-bca_id').addEventListener('click', () => sortTable('bca_id'));
        document.getElementById('header-bca_full_name').addEventListener('click', () => sortTable('bca_full_name'));
        document.getElementById('header-bca_bank').addEventListener('click', () => sortTable('bca_bank'));
        document.getElementById('header-mobile_no').addEventListener('click', () => sortTable('mobile_no'));
        document.getElementById('header-state').addEventListener('click', () => sortTable('state'));
        document.getElementById('header-location').addEventListener('click', () => sortTable('location'));
        document.getElementById('header-status').addEventListener('click', () => sortTable('status'));
        document.getElementById('header-formatted_date').addEventListener('click', () => sortTable('formatted_date'));
        document.getElementById('header-created_by').addEventListener('click', () => sortTable('created_by'));
    
        // Default sorting function
        function defaultSort() {
            displayedData.sort((a, b) => {
                const dateA = new Date(a.formatted_date);
                const dateB = new Date(b.formatted_date);
                
                // Compare by date in descending order (most recent first)
                if (dateA > dateB) return -1;
                if (dateA < dateB) return 1;
    
                // If dates are the same, compare by audit number (largest to smallest)
                const auditNumberA = parseInt(a.audit_number.replace('AUD', ''), 10);
                const auditNumberB = parseInt(b.audit_number.replace('AUD', ''), 10);
                
                return auditNumberB - auditNumberA;
            });
        }
    
        // Sort the table based on the clicked column
        function sortTable(column) {
            // Toggle sort order if the same column is clicked
            if (currentSortColumn === column) {
                currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortOrder = 'asc';
            }
            currentSortColumn = column;
    
            // Sort the data based on the current column and order
            displayedData.sort((a, b) => {
                let valA, valB;
                if (column === 'audit_number') {
                    valA = parseInt(a[column].replace('AUD', ''), 10);
                    valB = parseInt(b[column].replace('AUD', ''), 10);
                } else if (column === 'formatted_date') {
                    valA = new Date(a[column]);
                    valB = new Date(b[column]);
                } else {
                    valA = a[column];
                    valB = b[column];
                }
                if (currentSortOrder === 'asc') {
                    return valA > valB ? 1 : -1;
                } else {
                    return valA < valB ? 1 : -1;
                }
            });
    
            // Render the table with sorted data
            renderTable();
            updateTableHeaders();
        }
      // Table shorting funtionality start
    
        // Render the table
        function renderTable(isDefault) {
            const tbody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
            tbody.innerHTML = '';
    
            if (isDefault =='short'){
                defaultSort();
                defaultShortCount = 1;
            }
    
            const start = (currentPage - 1) * entriesPerPage;
            const end = start + entriesPerPage;
            const paginatedData = displayedData.slice(start, end);
    
            if (paginatedData.length === 0) {
                $('#exportData').prop('disabled', true);
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 16;
                // Assuming cell is a table cell element
                cell.innerHTML = `<p class="text-lg-center fw-bold pt-3" style="color: red;">No Data Found</p>`;
                row.appendChild(cell);
                tbody.appendChild(row);
            } else {
                $('#exportData').prop('disabled', false);
                paginatedData.forEach((item, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${start + index + 1}</td>
                        <td>${item.audit_number}</td>
                        <td>${item.bca_id}</td>
                        <td>${item.bca_full_name}</td>
                        <td>${item.bca_contact_no}</td>
                        <td>${item.bca_bank}</td>
                        <td>${item.state}</td>
                        <td>${item.location}</td>
                        <td>${item.status}</td>
                        <td>${item.formatted_date}</td>
                        <td>${item.user_full_name}</td>
                        <td>
                        <button type="button" class="action-button" data-audit-number="${item.audit_number}" data-bca-id="${item.bca_id}" data-bca-name="${item.bca_full_name}" data-bca-state="${item.state}" data-bca-location="${item.location}">Open</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
            updatePaginationControls(displayedData);
            updateRecordInfo(displayedData.length, start, end);
            hideOverlay();
        }
    
        // Update the table headers to show sorting icons
        function updateTableHeaders() {
            const headers = document.querySelectorAll('.sortable');
            // console.log(headers);
    
            headers.forEach(header => {
                header.classList.remove('sort-asc', 'sort-desc');
            });
    
            const currentHeader = document.getElementById(`header-${currentSortColumn}`);
            // console.log(currentHeader);
            if (currentHeader) {
                currentHeader.classList.add(currentSortOrder === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        }
    
        // Function to add event listeners after the table has been rendered
        function addEventListeners() {
                hideOverlay();
                // on click action button capture row data for storeSessionData
                dataTableBody.addEventListener('click', function(event) {
                    if (event.target && event.target.matches('button.action-button')) {
                        const button = event.target;
                        const auditNumber = button.getAttribute('data-audit-number');
                        const bcaId = button.getAttribute('data-bca-id');
                        const bcaName = button.getAttribute('data-bca-name');
                        const state = button.getAttribute('data-bca-state');
                        const location = button.getAttribute('data-bca-location');
    
                        // Call storeSessionData with the appropriate data
                        storeSessionData(bcaId, bcaName, state, location, auditNumber);
                    }
                });
            }
    
        // Call the function to add event listeners after setting innerHTML
        addEventListeners();
        // Function to fetch BCA name on BCA ID input change
        $('#bcaId').on('input', function() {
          var bcaId = $(this).val().trim();
          if (bcaId.length >= 3) { // Only proceed if BCA ID is 6 characters long
            fetchBcaName(bcaId);
          } else {
            $('#bcaName').val('').prop('disabled', true);
            $('#proceedBtn').prop('disabled', true);
            displayErrorMessage('Please enter a valid 3-digit BCA ID.');
          }
        });
    
        // Function to fetch BCA name via AJAX
    function fetchBcaName(bcaId) {
      $.ajax({
        url: '/bcaudit/codes/fetchData/validate_bca_for_new_audit.php',
        method: 'GET',
        data: { bca_id: bcaId },
        dataType: 'json',
        success: function(response) {
          if (response.success) {
            // console.log(response);
            var bcaName = response.data['bca_name'];
            var state = response.data['state'];
            var location = response.data['location'];
            document.getElementById('errorMessageArea').style.display = 'none';
            $('#bcaName').val(bcaName);
            $('#proceedBtn').prop('disabled', false);
    
            // Enable proceed button click handler to store session data
            $('#proceedBtn').off('click').on('click', function() {
              storeSessionData(bcaId, bcaName, state, location);
            });
          } else {
            $('#bcaName').val(response.message);
            $('#proceedBtn').prop('disabled', true);
            displayErrorMessage(response.message);
          }
        },
        error: function() {
          $('#bcaName').val('Error fetching name').prop('disabled', true);
          $('#proceedBtn').prop('disabled', true);
          displayErrorMessage('Error fetching BCA name. Please try again.');
        }
      });
    }
        // Function to store session data
        function storeSessionData(bcaId, bcaName, state, location, auditNumber) {
          showOverlay();
            if (auditNumber){
                var action = 'newAudit';
            }else{
                var action = 'existingAudit';
            }
          $.ajax({
            url: '/bcaudit/codes/store_session.php',
            type: 'POST',
            data: { bcaId: bcaId, bcaName: bcaName, auditNumber: auditNumber, action: action, state: state, location: location },
            success: function(response) {
              hideOverlay();
              var result = JSON.parse(response);
              if (result.success) {
                // console.log('Session data stored successfully');
                window.location.href = '/bcaudit/progress.php';
              } else {
                console.log('Error: ' + result.message);
                alert('Error: ' + result.message);
              }
            },
            error: function() {
            hideOverlay();
            alert('Error: Unable to send request');
              console.log('AJAX request failed');
            }
          });
        }
        // Function to store session data End
    
        //  Populate dropdown into filter modal field from fetched data
        function populateDropdowns(data) {
            const stateDropdown = document.getElementById('state');
            // const districtDropdown = document.getElementById('district');
            const locationDropdown = document.getElementById('location');
            const bankDropdown = document.getElementById('bank');
            const createdByDropdown = document.getElementById('createdBy');
            const statusDropdown = document.getElementById('status');
    
            const states = [...new Set(data.map(item => item.state))];
            // const districts = [...new Set(data.map(item => item.district))];
            const locations = [...new Set(data.map(item => item.location))];
            const banks = [...new Set(data.map(item => item.bca_bank))];
            const users = [...new Set(data.map(item => item.user_full_name))];
            const statuses = [...new Set(data.map(item => item.status))];
    
            populateDropdown(stateDropdown, states);
            // populateDropdown(districtDropdown, districts);
            populateDropdown(locationDropdown, locations);
            populateDropdown(bankDropdown, banks);
            populateDropdown(createdByDropdown, users);
            populateDropdown(statusDropdown, statuses);
        }
    
        function populateDropdown(dropdown, options) {
            const selectedValue = dropdown.value;
            dropdown.innerHTML = '<option class="defaultSelect" value="">Select</option>';
            options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.textContent = option;
                dropdown.appendChild(opt);
            });
            dropdown.value = selectedValue;
        }
        //  Populate dropdown into filter modal field from fetched data End
    
        // Apply Filter Function
        function applyFilters() {
          const state = document.getElementById('state').value.toLowerCase();
          const location = document.getElementById('location').value.toLowerCase();
          const bank = document.getElementById('bank').value.toLowerCase();
          const createdBy = document.getElementById('createdBy').value.toLowerCase();
          const status = document.getElementById('status').value.toLowerCase();
          
          const dateRange = selectedDateRange || {
              start: moment().format('YYYY-MM-DD'),
              end: moment().format('YYYY-MM-DD')
          };
    
          // filter count part
          let filterCount = 0;
          if (state !== '') filterCount++;
          if (location !== '') filterCount++;
          if (bank !== '') filterCount++;
          if (createdBy !== '') filterCount++;
          if (status !== '') filterCount++;
          if (dateRange.start !== '') filterCount++;
          // console.log(dateRange.start);
          // date filter part
          filteredData = allData.filter(item => {
              const itemDate = moment(item.created_date, 'DD-MM-YYYY');
              const dateInRange = selectedDateRange ?
                  itemDate.isBetween(dateRange.start, dateRange.end, null, '[]') :
                  true;
    
              // filter data asper valid input
              return dateInRange &&
                  (state === '' || item.state.toLowerCase().includes(state)) &&
                  (location === '' || item.location.toLowerCase().includes(location)) &&
                  (bank === '' || item.bca_bank.toLowerCase().includes(bank)) &&
                  (createdBy === '' || item.user_full_name.toLowerCase().includes(createdBy)) &&
                  (status === '' || item.status.toLowerCase().includes(status));
          });
    
          // Remove input from search field
          $('#searchInput').val('');
    
          filtersApplied = true;
          searchTable();
    
          // Display the filter count
          document.getElementById('filterCount').textContent = filterCount;
      }
    
        // clearFilters currently Not in use
        function clearFilters() {
            document.getElementById('filter-form').reset();
            selectedDateRange = {
                start: moment().subtract(7, 'days').format('DD-MM-YYYY'),
                end: moment().format('DD-MM-YYYY')
            };
            $('#dateRange').val(`${selectedDateRange.start} - ${selectedDateRange.end}`);
    
            filteredData = allData;
            filtersApplied = false;
            searchTable();
        }
    
        $('#exportData').on('click', function() {
          $('#exportData').prop('disabled', true);
    
      if (filtersApplied) {
        var startDate = selectedDateRange.start || '';
        var endDate = selectedDateRange.end || '';
        var state = $('#state').val();
        var location = $('#location').val();
        var createdBy = $('#createdBy').val();
        var bank = $('#bank').val();
        var status = $('#status').val();
        // console.log(selectedDateRange.start);
        var queryParams = [];
    
        if (startDate) queryParams.push('start_date=' + encodeURIComponent(startDate));
        if (endDate) queryParams.push('end_date=' + encodeURIComponent(endDate));
        if (state) queryParams.push('state=' + encodeURIComponent(state));
        if (location) queryParams.push('location=' + encodeURIComponent(location));
        if (createdBy) queryParams.push('created_by=' + encodeURIComponent(createdBy));
        if (bank) queryParams.push('bank=' + encodeURIComponent(bank));
        if (status) queryParams.push('status=' + encodeURIComponent(status));
    
        var queryString = queryParams.length ? '?' + queryParams.join('&') : '';
      } else {
        console.log('Exporting data without filters');
        var queryString = '';
      }
        
      const url = `codes/download_audit_list_csv.php${queryString}`;
        console.log("export button clicked");
    
        // Open the URL in a new tab
        const newTab = window.open(url, '_blank');
    
    // Check if the new tab was blocked
    if (!newTab) {
        alert('Please allow pop-ups for this website');
        return;
    }
    
    // Monitor the new tab to detect when it has been closed
    const checkTabClosed = setInterval(() => {
        if (newTab.closed) {
            clearInterval(checkTabClosed);
            console.log('CSV Download started successfully!');
            $('#exportData').prop('disabled', false);
        }
    }, 500);
    });
    
        // Search funtionality on rendered table data
        function searchTable() {
            const query = document.getElementById('searchInput').value.toLowerCase();
            const dataToSearch = filtersApplied ? filteredData : allData;
    
            displayedData = dataToSearch.filter(item => {
                return item.audit_number.toLowerCase().includes(query) ||
                    item.bca_id.toLowerCase().includes(query) ||
                    item.bca_full_name.toLowerCase().includes(query) ||
                    item.bca_contact_no.toLowerCase().includes(query) ||
                    item.bca_bank.toLowerCase().includes(query) ||
                    item.state.toLowerCase().includes(query) ||
                    item.location.toLowerCase().includes(query);
            });
    
            currentPage = 1;
            renderTable();
        }
        // data showing in table selection funtionality
        function changeEntriesPerPage() {
            entriesPerPage = parseInt(document.getElementById("entriesPerPage").value);
            currentPage = 1;
            renderTable();
        }
        // update pagination depened on redered table data
        function updatePaginationControls(renderedData) {
            const totalEntries = renderedData.length;
            const totalPages = Math.ceil(totalEntries / entriesPerPage);
    
            if (totalPages < 1) {
                paginationControls.innerHTML = '';
                return;
            }
    
            let paginationHtml = '';
    
            if (currentPage > 1) {
                paginationHtml += `<a href="#" class="prev" data-page="${currentPage - 1}">Previous</a>`;
            }
    
            for (let i = 1; i <= 2; i++) {
                if (i <= totalPages) {
                    paginationHtml += `<a href="#" class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</a>`;
                }
            }
    
            if (currentPage > 4) {
                paginationHtml += `<span>...</span>`;
            }
    
            let startPage = Math.max(3, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);
            for (let i = startPage; i <= endPage; i++) {
                if (i > 2 && i < totalPages) {
                    paginationHtml += `<a href="#" class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</a>`;
                }
            }
    
            if (currentPage < totalPages - 2) {
                paginationHtml += `<span>...</span>`;
            }
    
            if (totalPages > 2) {
                paginationHtml += `<a href="#" class="${totalPages === currentPage ? 'active' : ''}" data-page="${totalPages}">${totalPages}</a>`;
            }
    
            if (currentPage < totalPages) {
                paginationHtml += `<a href="#" class="next" data-page="${currentPage + 1}">Next</a>`;
            }
    
            paginationControls.innerHTML = paginationHtml;
    
            document.querySelectorAll("#paginationControls a").forEach(a => {
                a.addEventListener("click", function(event) {
                    event.preventDefault();
                    currentPage = parseInt(this.getAttribute("data-page"));
                    renderTable();
                });
            });
        }
        // update pagination depened on redered table data End
    
        // update data showing information of the rendered table
        function updateRecordInfo(totalEntries, start, end) {
            document.getElementById('recordInfo').innerHTML = `Showing ${Math.min(start + 1, totalEntries)} to ${Math.min(end, totalEntries)} of ${totalEntries} entries`;
        }
    
      // Open filter modal popup and populate dropdown data
      // filterModal.addEventListener('shown.bs.modal', function(event) {
      //     // console.log('Modal is fully visible');
      //     populateDropdowns(allData);
      // });
    