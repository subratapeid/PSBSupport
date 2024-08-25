// showOverlay('--Loading--');
    
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
    //   document.addEventListener("DOMContentLoaded", function() {
    //   showOverlay('--Fetching Data--');
        fetch('https://script.google.com/macros/s/AKfycbxT6kTAbSuPP_elWn97FceD8542tjsyPb7ihOsTgNx_J-jApuOj-g2tn3p68fQLX5YEhw/exec?action=fetch')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            allData = data.data.sort((a, b) => moment(b.date, 'DD-MM-YYYY') - moment(a.date, 'DD-MM-YYYY'));
            // console.log(allData);

            filteredData = allData;
            displayedData = allData;
            renderTable('short');
        }
        })
        .catch(error => console.error('Error fetching data:', error));
      //  List Data fetch End
    
      // Table shorting funtionality start
        let currentSortColumn = 'formatted_date';
        let currentSortOrder = 'desc'; // Default to descending for date
    
        // Event listeners for sorting columns
        document.getElementById('header-agent_id').addEventListener('click', () => sortTable('agent_id'));
        document.getElementById('header-requested_by').addEventListener('click', () => sortTable('requested_by'));
        document.getElementById('header-requested_on').addEventListener('click', () => sortTable('requested_on'));
        document.getElementById('header-status').addEventListener('click', () => sortTable('status'));
        document.getElementById('header-updated_on').addEventListener('click', () => sortTable('updated_on'));
        document.getElementById('header-updated_by').addEventListener('click', () => sortTable('updated_by'));
    
        // Default sorting function
        function defaultSort() {
            displayedData.sort((a, b) => {
                const dateA = new Date(a.requested_on);
                const dateB = new Date(b.requested_on);
                
                // Compare by date in descending order (most recent first)
                if (dateA > dateB) return -1;
                if (dateA < dateB) return 1;
    
                // If dates are the same, compare by agent id (largest to smallest)
                // const agentIdA = parseInt(a.agent_id.replace(/[A-Za-z]/g, ''), 10);
                // const agentIdB = parseInt(b.agent_id.replace(/[A-Za-z]/g, ''), 10);
                const agentIdA = [a.agent_id].toString().toLowerCase();
                const agentIdB = [b.agent_id].toString().toLowerCase();
                
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
                    // valA = parseInt(a[column].replace(/[A-Za-z]/g, ''), 10);
                    // valB = parseInt(b[column].replace(/[A-Za-z]/g, ''), 10);

                valA = [a.agent_id].toString().toLowerCase();
                valB = [b.agent_id].toString().toLowerCase();
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
                // $('#exportData').prop('disabled', true);
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 16;
                // Assuming cell is a table cell element
                cell.innerHTML = `<p class="text-lg-center fw-bold pt-3" style="color: red;">No Data Found</p>`;
                row.appendChild(cell);
                tbody.appendChild(row);
            } else {
                // $('#exportData').prop('disabled', false);
                paginatedData.forEach((item, index) => {
                    // console.log(typeof item.bca_id)
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="checkbox-cell" style="padding: 0px 5px;">
                            <label class="checkbox-container">
                                <input type="checkbox" class="selectItem" data-id="${item.id}" value="${item.id}">
                                <span class="checkmark"></span>
                            </label>
                        </td>

                        <td>${start + index + 1}</td>
                        <td>${item.agent_id}</td>
                        <td>${item.requested_by}</td>
                        <td>${item.requested_on}</td>
                        <td> <span class="badge 
                            ${item.status === 'ResetDone' ? 'bg-success' :
                                item.status === 'Rejected' ? 'bg-danger' :
                                item.status === 'pending' ? 'bg-warning text-dark' :
                                'bg-secondary'}">
                            ${item.status === 'ResetDone' ? 'Reset Done' :
                                item.status === 'Rejected' ? 'Rejected' :
                                item.status === 'pending' ? 'Pending' :
                                'Unknown'}
                            </span></td>
                        <td>${item.updated_on}</td>
                        <td>${item.updated_by}</td>
                        <td>
                        <button class="btn btn-sm btn-primary changeStatusSingle" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#statusModal">Change Status</button>
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
        const scrollSpeed = 20;

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

                let selectedIds = [];

                    // Enable/Disable the Change Status Button
                    $('.selectItem').on('change', function() {
                        toggleChangeStatusBtn();
                    });
        
                    $('#selectAll').on('change', function() {
                        $('.selectItem').prop('checked', this.checked);
                        toggleChangeStatusBtn();
                    });
        
                    $('.selectItem').on('change', function() {
                        if ($('.selectItem:checked').length === $('.selectItem').length) {
                            $('#selectAll').prop('checked', true);
                        } else {
                            $('#selectAll').prop('checked', false);
                        }
                        toggleChangeStatusBtn();
                    });
        
                    function toggleChangeStatusBtn() {
                        $('#changeStatusBtn').prop('disabled', $('.selectItem:checked').length === 0);
                    }
        
                    // Show/hide remarks field based on selected status
                    $('#status').on('change', function() {
                        const selectedStatus = $(this).val();
                        if (selectedStatus === 'ResetDone') {
                            $('#remarksContainer').hide();
                            $('#remarks').prop('required', false);
                            $('#remarks').val('');
                        } else {
                            $('#remarksContainer').show();
                            $('#remarks').prop('required', true);
                        }
                    });
        
                    // Handle Change Status for Single Row
                    $('.changeStatusSingle').on('click', function() {
                        selectedIds = [$(this).data('id')];
                    });
        
                    // Handle Confirm Button Click
                    $('#confirmBtn').on('click', function() {
                        if (selectedIds.length === 0) {
                            selectedIds = $('.selectItem:checked').map(function() {
                                return this.value;
                            }).get();
                        }
        
                        const status = $('#status').val();
                        const remarks = $('#remarks').val();
        
                        if (status === '') {
                            alert('Please select a status.');
                            return;
                        }
        
                        if ($('#remarks').is(':required') && remarks.trim() === '') {
                            $('#remarksError').show();
                            return;
                        } else {
                            $('#remarksError').hide();
                        }
        
                        // Send GET request with selected data IDs, status, and remarks
                        const queryString = `?ids=${selectedIds.join(',')}&status=${status}&remarks=${encodeURIComponent(remarks)}&action=update`;
                        const url = `https://script.google.com/macros/s/AKfycbxT6kTAbSuPP_elWn97FceD8542tjsyPb7ihOsTgNx_J-jApuOj-g2tn3p68fQLX5YEhw/exec${queryString}`;

                        showOverlay('--Updating Status--');
                        fetch(url)
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                            toastr.success('Data Updated Successfully');
                            // Uncomment and modify the following lines if you want to update the table with the new data
                            // allData = data.data.sort((a, b) => moment(b.date, 'DD-MM-YYYY') - moment(a.date, 'DD-MM-YYYY'));
                            // console.log(allData);
                            // filteredData = allData;
                            // displayedData = allData;
                            // renderTable('short');
                            } else {
                            toastr.error('Error Updating Data');
                            }
                        })
                        .catch(error => {
                            console.error('Error fetching data:', error);
                            toastr.error('An error occurred while updating data.');
                        })
                        .finally(() => {
                            hideOverlay(); // Hide the overlay regardless of success or failure
                        });

        
                        console.log('GET request URL:', url); // replace this with an actual AJAX request
                        // Example AJAX request
                        /*
                        $.get(url, function(response) {
                            // Handle response
                            console.log('Response:', response);
                        });
                        */
                        // Reset selected IDs
                        selectedIds = [];
        
                        // Close the modal
                        $('#statusModal').modal('hide');
                    });
        
                    // Clear selected IDs when the modal is closed
                    $('#statusModal').on('hidden.bs.modal', function () {
                        selectedIds = [];
                        $('#status').val('');
                        $('#remarks').val('');
                        $('#remarksContainer').hide();
                        $('#remarksError').hide();
                    });
        
            }

        // Apply filter based on the selectedStatus
        document.getElementById('filterStatus').addEventListener('change', function() {
            let status = this.value;
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
    
    //     $('#exportData').on('click', function() {
    //       $('#exportData').prop('disabled', true);
    
    //   if (filtersApplied) {
    //     var status = $('#status').val();
    //     // console.log(selectedDateRange.start);
    //     var queryParams = [];
    //     if (status) queryParams.push('status=' + encodeURIComponent(status));
    
    //     var queryString = queryParams.length ? '?' + queryParams.join('&') : '';
    //   } else {
    //     console.log('Exporting data without filters');
    //     var queryString = '';
    //   }
        
    //   const url = `exportData.php${queryString}`;
    //     console.log("export button clicked");
    
    //     // Open the URL in a new tab
    //     const newTab = window.open(url, '_blank');
    
    // // Check if the new tab was blocked
    // if (!newTab) {
    //     alert('Please allow pop-ups for this website');
    //     return;
    // }
    
    // // Monitor the new tab to detect when it has been closed
    // const checkTabClosed = setInterval(() => {
    //     if (newTab.closed) {
    //         clearInterval(checkTabClosed);
    //         console.log('CSV Download started successfully!');
    //         $('#exportData').prop('disabled', false);
    //     }
    // }, 500);
    // });
    
        // Search funtionality on rendered table data
        // function searchTable() {
        //     const query = document.getElementById('searchInput').value.toLowerCase();
        //     const dataToSearch = filtersApplied ? filteredData : allData;
    
        //     displayedData = dataToSearch.filter(item => {
        //         return item.agent_id.toLowerCase().includes(query) ||
        //             item.requested_by.toLowerCase().includes(query) ||
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
    



 






      



