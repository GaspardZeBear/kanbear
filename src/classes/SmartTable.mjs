// SmartTable.js

class SmartTable {
    constructor(tableEl) {
        console.log("SmartTable constructor()")
        if (!tableEl || tableEl.tagName !== 'TABLE') {
            throw new Error('SmartTable requires a <table> element.');
        }
        this.table = tableEl;
        this.thead = this.table.querySelector('thead');
        this.tbody = this.table.querySelector('tbody');
        
        if (!this.thead || !this.tbody) {
            throw new Error('Table must contain both <thead> and <tbody> elements.');
        }

        this.headers = this.thead.querySelectorAll('th');
        this.filters = {}; // Holds the regex objects { columnIndex: RegExp }
        this.sortState = { index: null, direction: null };

        this.injectStyles();
        this.init();
    }

    /**
     * Injects component-specific CSS into the document head
     */
    injectStyles() {
        const styleId = 'smart-table-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .smart-table { border-collapse: collapse; width: 100%; font-family: sans-serif; }
            .smart-table th, .smart-table td { border: 1px solid #ddd; padding: 8px; text-align: left; position: relative; }
            .smart-table th { background-color: #f4f4f4; cursor: pointer; user-select: none; }
            .smart-table th:hover { background-color: #e2e2e2; }
            .smart-table th.sort-asc::after { content: " ▲"; font-size: 0.8em; color: #333; }
            .smart-table th.sort-desc::after { content: " ▼"; font-size: 0.8em; color: #333; }
            
            .st-filter-wrapper { margin-top: 6px; cursor: default; }
            .st-filter-input {
                width: 100%; 
                padding: 4px 6px; 
                box-sizing: border-box; 
                border: 1px solid #ccc; 
                border-radius: 3px; 
                font-size: 0.85em; 
                font-weight: normal;
            }
            .st-filter-input:focus { border-color: #007bff; outline: none; box-shadow: 0 0 0 2px rgba(0,123,255,0.2); }
            .st-filter-input.invalid { border-color: #dc3545; background-color: #fff0f0; }
        `;
        document.head.appendChild(style);
    }

    /**
     * Initializes headers with sort and filter functionalities
     */
    init() {
        console.log("SmartTable init()")
        this.headers.forEach((th, index) => {
            // Save original text and setup header layout
            const headerText = th.textContent.trim();
            th.innerHTML = `
                <div class="st-header-text">${headerText}</div>
                <div class="st-filter-wrapper">
                    <input type="text" class="st-filter-input" placeholder="Filter (regex)..." data-col="${index}">
                </div>
            `;

            // Click listener for sorting (ignoring clicks on the input)
            th.addEventListener('click', (e) => {
                if (e.target.classList.contains('st-filter-input')) return;
                this.handleSort(index);
            });

            // Input listener for regex filtering
            const input = th.querySelector('.st-filter-input');
            input.addEventListener('input', (e) => {
                e.stopPropagation(); // Prevent triggering sort
                this.handleFilter(index, e.target.value);
            });
        });
        
        this.table.classList.add('smart-table');
        console.log("SmartTable init() done")
    }

    /**
     * Handles column sorting
     */
    handleSort(index) {
        const rows = Array.from(this.tbody.querySelectorAll('tr'));
        
        // Determine sort direction
        let direction = 'asc';
        if (this.sortState.index === index && this.sortState.direction === 'asc') {
            direction = 'desc';
        }
        this.sortState = { index, direction };

        // Update UI classes
        this.headers.forEach(th => th.classList.remove('sort-asc', 'sort-desc'));
        this.headers[index].classList.add(`sort-${direction}`);

        // Sort the rows
        rows.sort((a, b) => {
            const aText = a.children[index].textContent.trim();
            const bText = b.children[index].textContent.trim();

            // Check if both are numbers
            const aNum = parseFloat(aText);
            const bNum = parseFloat(bText);
            const isNumeric = !isNaN(aNum) && !isNaN(bNum);

            if (isNumeric) {
                return direction === 'asc' ? aNum - bNum : bNum - aNum;
            } else {
                return direction === 'asc' 
                    ? aText.localeCompare(bText) 
                    : bText.localeCompare(aText);
            }
        });

        // Reappend sorted rows
        rows.forEach(row => this.tbody.appendChild(row));

        // Re-apply filters because row order changed
        this.applyFilters();
    }

    /**
     * Parses regex from input and triggers filtering
     */
    handleFilter(index, value) {
        const inputEl = this.headers[index].querySelector('.st-filter-input');
        
        if (value.trim() === '') {
            delete this.filters[index];
            inputEl.classList.remove('invalid');
        } else {
            try {
                // Create regex. 'i' for case-insensitivity.
                const regex = new RegExp(value, 'i');
                this.filters[index] = regex;
                inputEl.classList.remove('invalid');
            } catch (e) {
                // Invalid regex (e.g. user is still typing "[" )
                inputEl.classList.add('invalid');
                // Do not update the filter, keep the previous valid state
                return; 
            }
        }

        this.applyFilters();
    }

    /**
     * Iterates through all rows and hides those that don't match active filters
     */
    applyFilters() {
        const rows = this.tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            let isVisible = true;
            
            for (const colIndex in this.filters) {
                const regex = this.filters[colIndex];
                const cellText = row.children[colIndex].textContent.trim();
                
                if (!regex.test(cellText)) {
                    isVisible = false;
                    break; // No need to check other columns for this row
                }
            }
            
            row.style.display = isVisible ? '' : 'none';
        });
    }
}

export { SmartTable }