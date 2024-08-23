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
        fetch('https://script.google.com/macros/s/AKfycbxT6kTAbSuPP_elWn97FceD8542tjsyPb7ihOsTgNx_J-jApuOj-g2tn3p68fQLX5YEhw/exec')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            allData = data.data.sort((a, b) => moment(b.date, 'DD-MM-YYYY') - moment(a.date, 'DD-MM-YYYY'));
            console.log(allData);

            filteredData = allData;
            displayedData = allData;
            renderTable('short');
        }
        })
        .catch(error => console.error('Error fetching data:', error));

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
        document.getElementById('header-agent_id').addEventListener('click', () => sortTable('agent_id'));
        document.getElementById('header-requested_by').addEventListener('click', () => sortTable('requested_by'));
        document.getElementById('header-requested_by_email').addEventListener('click', () => sortTable('requested_by_email'));
        document.getElementById('header-state').addEventListener('click', () => sortTable('state'));
        document.getElementById('header-requested_on').addEventListener('click', () => sortTable('requested_on'));
        document.getElementById('header-status').addEventListener('click', () => sortTable('status'));
        document.getElementById('header-updated_on').addEventListener('click', () => sortTable('updated_on'));
        document.getElementById('header-updated_by').addEventListener('click', () => sortTable('updated_by'));
    
        // Default sorting function
        function defaultSort() {
            displayedData.sort((a, b) => {
                const dateA = new Date(a.formatted_date);
                const dateB = new Date(b.formatted_date);
                
                // Compare by date in descending order (most recent first)
                if (dateA > dateB) return -1;
                if (dateA < dateB) return 1;
    
                // If dates are the same, compare by agent id (largest to smallest)
                const agentIdA = parseInt(a.agent_id.replace(/[A-Za-z]/g, ''), 10);
                const agentIdB = parseInt(b.agent_id.replace(/[A-Za-z]/g, ''), 10);
                
                return agentIdB - agentIdA;
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

            displayedData.sort((a, b) => {
                let valA, valB;
            
                if (column === 'agent_id') {
                    // Remove any alphabetic characters and parse as integer
                    valA = parseInt(a[column].replace(/[A-Za-z]/g, ''), 10);
                    valB = parseInt(b[column].replace(/[A-Za-z]/g, ''), 10);
                } else if (column === 'formatted_date') {
                    // Convert to Date object for proper date comparison
                    valA = new Date(a[column]);
                    valB = new Date(b[column]);
                } else {
                    // Default case: treat values as strings
                    valA = a[column].toString().toLowerCase();
                    valB = b[column].toString().toLowerCase();
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
      function onDataLoad() {
        functionsAfterLoadTable();
    }
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
                    // console.log(typeof item.bca_id)
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${start + index + 1}</td>
                        <td>${item.agent_id}</td>
                        <td>${item.requested_by}</td>
                        <td>${item.requested_by_email}</td>
                        <td>${item.state}</td>
                        <td>${item.requested_on}</td>
                        <td>${item.status}</td>
                        <td>${item.updated_on}</td>
                        <td>${item.updated_by}</td>
                        <td>
                        <button type="button" class="action-button" data-agent-id="${item.agent_id}" data-bca-id="${item.bca_id}" data-bca-name="${item.bca_full_name}" data-bca-state="${item.state}" data-bca-location="${item.location}">Open</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
            updatePaginationControls(displayedData);
            updateRecordInfo(displayedData.length, start, end);
            hideOverlay();
            onDataLoad();
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
        function functionsAfterLoadTable() {
            hideOverlay();
        
            // Data select and copy functionality
        let selectedCells = [];
        let isSelecting = false;
        let startCell = null;
        let lastCell = null;
        let scrollInterval = null;
        let isMouseDown = false;
        const scrollSpeed = 15;

        // Function to select a range of cells
        function selectRange(startCell, endCell) {
            const startRow = startCell.parentElement.rowIndex;
            const endRow = endCell.parentElement.rowIndex;
            const startCol = startCell.cellIndex;
            const endCol = endCell.cellIndex;

            const [rowStart, rowEnd] = startRow < endRow ? [startRow, endRow] : [endRow, startRow];
            const [colStart, colEnd] = startCol < endCol ? [startCol, endCol] : [endCol, startCol];

            // Clear previous selection if neither Shift nor Ctrl/Meta is held
            if (!(window.event.shiftKey || window.event.ctrlKey || window.event.metaKey)) {
                selectedCells.forEach(cell => cell.classList.remove('selected'));
                selectedCells = [];
            }

            for (let i = rowStart; i <= rowEnd; i++) {
                for (let j = colStart; j <= colEnd; j++) {
                    const cell = document.getElementById('dataTable').rows[i].cells[j];
                    if (!selectedCells.includes(cell)) {
                        cell.classList.add('selected');
                        selectedCells.push(cell);
                    }
                }
            }
        }

        // Function to handle mouse movement and scrolling
        function handleMouseMove(e) {
            const table = document.getElementById('dataTable');
            const tableContainer = table.parentElement;
            const windowHeight = window.innerHeight;
            let scrollX = 0, scrollY = 0;

            if (isSelecting) {
                if (e.clientX < tableContainer.getBoundingClientRect().left + 100) {
                    scrollX = -scrollSpeed;
                } else if (e.clientX > tableContainer.getBoundingClientRect().right - 20) {
                    scrollX = scrollSpeed;
                }

                if (e.clientY < 100) {
                    scrollY = -scrollSpeed;
                } else if (e.clientY > windowHeight - 100) {
                    scrollY = scrollSpeed;
                }

                tableContainer.scrollBy(scrollX, 0); // Horizontal scroll
                window.scrollBy(0, scrollY);         // Vertical scroll

                // Ensure continuous scrolling when cursor is at the edge
                clearInterval(scrollInterval);
                scrollInterval = setInterval(() => {
                    tableContainer.scrollBy(scrollX, 0);
                    window.scrollBy(0, scrollY);
                }, 50);
            }
        }

        // Function to stop scrolling
        function handleMouseUp() {
            isMouseDown = false;
            isSelecting = false;

            clearInterval(scrollInterval); // Stop continuous scrolling
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        // Attach event listeners to each cell
        document.querySelectorAll('#dataTable td').forEach(cell => {
            cell.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Prevent text selection
                isSelecting = true;
                isMouseDown = true;
                startCell = cell;
                lastCell = cell;

                if (!(e.shiftKey || e.ctrlKey || e.metaKey)) {
                    // If neither Shift nor Ctrl is pressed, reset previous selection
                    selectedCells.forEach(cell => cell.classList.remove('selected'));
                    selectedCells = [];
                }

                if (e.shiftKey && lastCell) {
                    // Shift key: select range
                    selectRange(lastCell, cell);
                } else if (e.ctrlKey || e.metaKey) {
                    // Ctrl key: toggle individual cell
                    if (selectedCells.includes(cell)) {
                        cell.classList.remove('selected');
                        selectedCells = selectedCells.filter(selectedCell => selectedCell !== cell);
                    } else {
                        cell.classList.add('selected');
                        selectedCells.push(cell);
                    }
                } else {
                    // No key pressed: single selection
                    cell.classList.add('selected');
                    selectedCells.push(cell);
                    lastCell = cell;
                }
                hasCopied = false;
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            });

            // Continue selecting cells while dragging with the mouse
            cell.addEventListener('mouseover', (e) => {
                if (isSelecting) {
                hasCopied = false;

                    if (e.shiftKey && lastCell) {
                        // Shift key: select range
                        selectRange(lastCell, cell);
                    } else if (e.ctrlKey || e.metaKey) {
                        // Ctrl key: toggle individual cell
                        if (selectedCells.includes(cell)) {
                            cell.classList.remove('selected');
                            selectedCells = selectedCells.filter(selectedCell => selectedCell !== cell);
                        } else {
                            cell.classList.add('selected');
                            selectedCells.push(cell);
                        }
                    } else {
                        // Default behavior: select range if dragging
                        selectRange(startCell, cell);
                    }
                }
            });
        });

        // Stop selecting if the mouse button is released outside the table
        document.addEventListener('mouseup', handleMouseUp);

        // Deselect all cells if clicking outside the table body
        document.addEventListener('click', (e) => {
            const table = document.getElementById('dataTable');
            const isClickInsideTable = table.contains(e.target);

            if (!isClickInsideTable) {
                selectedCells.forEach(cell => cell.classList.remove('selected'));
                selectedCells = [];
                startCell = null;
                lastCell = null;
            }
        });

        // Copy selected cells' text to clipboard when Ctrl+C or Cmd+C is pressed
        var hasCopied = false; // Flag to prevent multiple notifications
        document.addEventListener('keydown', (e) => {
            if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
        
                if (!hasCopied && selectedCells.length > 0) {
                    // Group selected cells by rows
                    const rows = {};
        
                    selectedCells.forEach(cell => {
                        const rowIndex = cell.parentElement.rowIndex;
                        if (!rows[rowIndex]) {
                            rows[rowIndex] = [];
                        }
                        rows[rowIndex].push(cell.innerText);
                    });
        
                    // Convert rows to tab-separated format
                    const selectedText = Object.values(rows).map(row => row.join('\t')).join('\n');
        
                    navigator.clipboard.writeText(selectedText).then(() => {
                        toastr.info('Selected data copied to clipboard.');
                        hasCopied = true;
                    }).catch(err => {
                        console.error('Failed to copy text: ', err);
                    });
                }
            }
        });        
        
        // ////////////////// Data select and copy funtionality end //////////////////////////

                    // on click action button capture row data for storeSessionData
                        // dataTableBody.addEventListener('click', function(event) {
                    // if (event.target && event.target.matches('button.action-button')) {
                    //     const button = event.target;
                    //     const agentId = button.getAttribute('data-agent-id');
                    //     const bcaId = button.getAttribute('data-bca-id');
                    //     const bcaName = button.getAttribute('data-bca-name');
                    //     const state = button.getAttribute('data-bca-state');
                    //     const location = button.getAttribute('data-bca-location');

                    //     // Call storeSessionData with the appropriate data
                    //     storeSessionData(bcaId, bcaName, state, location, agentId);
                    // }
                // });
            }
    
        // Call the function to add event listeners after setting innerHTML
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
        function storeSessionData(bcaId, bcaName, state, location, agentId) {
          showOverlay();
            if (agentId){
                var action = 'newAudit';
            }else{
                var action = 'existingAudit';
            }
          $.ajax({
            url: '/bcaudit/codes/store_session.php',
            type: 'POST',
            data: { bcaId: bcaId, bcaName: bcaName, agentId: agentId, action: action, state: state, location: location },
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

        document.getElementById('filterStatus').addEventListener('change', function() {
            let status = this.value;
        
            // Apply filter logic here based on the selectedStatus
            // applyFilter(selectedStatus);

        // Apply Filter Function
        // function applyFilter() {
        //   const status = document.getElementById('status').value.toLowerCase();
          // filter count part
        filteredData = allData.filter(item => {
            // Convert status to lowercase to handle case-insensitive filtering
            let itemStatus = item.status.toLowerCase();
            let filterStatus = status.toLowerCase();

            // Filter data based on the status
            return filterStatus === '' || itemStatus.includes(filterStatus);
        });

    
          // Remove input from search field
          $('#searchInput').val('');
    
          filtersApplied = true;
          searchTable();
      });
    
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
        var status = $('#status').val();
        // console.log(selectedDateRange.start);
        var queryParams = [];
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
        // function searchTable() {
        //     const query = document.getElementById('searchInput').value.toLowerCase();
        //     const dataToSearch = filtersApplied ? filteredData : allData;
    
        //     displayedData = dataToSearch.filter(item => {
        //         return item.agent_id.toLowerCase().includes(query) ||
        //             item.requested_by.toLowerCase().includes(query) ||
        //             item.requested_by_email.toLowerCase().includes(query) ||
        //             item.state.toLowerCase().includes(query) ||
        //             item.status.toLowerCase().includes(query) ||
        //             item.updated_by.toLowerCase().includes(query);
        //     });
    
        //     currentPage = 1;
        //     renderTable();
        // }


        // Search functionality on rendered table data
function searchTable() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();

    // Split the query by comma, space, or new line to get individual agent IDs
    const agentIds = query.split(/[\s,]+/).filter(id => id !== '');

    const dataToSearch = filtersApplied ? filteredData : allData;

    if (agentIds.length > 0) {
        displayedData = dataToSearch.filter(item => {
            // Check if the agent_id is exactly in the list of agent IDs
            return agentIds.includes(item.agent_id.toLowerCase());
        });
    } else {
        // If no agent IDs are provided, return data based on other fields
        displayedData = dataToSearch.filter(item => {
            return item.agent_id.toLowerCase().includes(query) ||
                item.requested_by.toLowerCase().includes(query) ||
                item.requested_by_email.toLowerCase().includes(query) ||
                item.state.toLowerCase().includes(query) ||
                item.status.toLowerCase().includes(query) ||
                item.updated_by.toLowerCase().includes(query);
        });
    }

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
    








      



