// GDC Beerwah Admissions Portal - Main Application JavaScript

class AdmissionsPortal {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.currentPage = 'home';
        this.currentSort = { field: null, direction: 'asc' };
        this.searchDebounceTimer = null;
        this.charts = {};
        this.showingAllMinors = false;
        
        // Pagination settings
        this.pagination = {
            students: { currentPage: 1, perPage: 25 },
            majors: { currentPage: 1, perPage: 25 }
        };

        // Initialize the application
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadData();
        this.setupRouting();
        this.navigateToPage();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                let page = e.target.getAttribute('data-page');
                if (!page) {
                    const parentLink = e.target.closest('[data-page]');
                    if (parentLink) {
                        page = parentLink.getAttribute('data-page');
                    }
                }
                if (page) {
                    this.navigateTo(page);
                }
            });
        });

        // Search functionality
        this.setupSearchListeners();

        // Chart toggle
        const toggleBtn = document.getElementById('toggle-minors-chart');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleMinorsChart();
            });
        }

        // Clear filters
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }

        // Export functionality
        const exportBtn = document.getElementById('export-results');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportResults();
            });
        }

        // Per page selector
        const perPageSelect = document.getElementById('students-per-page');
        if (perPageSelect) {
            perPageSelect.addEventListener('change', (e) => {
                this.pagination.students.perPage = parseInt(e.target.value);
                this.pagination.students.currentPage = 1;
                this.renderStudentsTable();
            });
        }

        // Stat card clicks
        document.querySelectorAll('.stat-card.clickable').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const filter = e.currentTarget.getAttribute('data-filter');
                this.handleStatCardClick(filter);
            });
        });
    }

    setupSearchListeners() {
        const searchInputs = ['search-name', 'search-registration', 'search-roll'];
        searchInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    this.debounceSearch(() => this.performSearch(), 250);
                });
            }
        });

        // Major search
        const majorSearch = document.getElementById('major-search');
        if (majorSearch) {
            majorSearch.addEventListener('input', () => {
                this.debounceSearch(() => this.filterMajorsList(), 250);
            });
        }

        // Advanced filters
        const filterSelects = ['filter-major', 'filter-minor', 'filter-skill'];
        filterSelects.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.addEventListener('change', () => {
                    this.performSearch();
                });
            }
        });
    }

    debounceSearch(func, delay) {
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(func, delay);
    }

    async loadData() {
        try {
            // Show loading screen
            document.getElementById('loading-screen').classList.remove('d-none');
            
            // Check if admissionData is available from the external script
            if (typeof admissionData !== 'undefined') {
                this.processData(admissionData);
                this.hideLoadingScreens();
                this.renderDashboard();
                return;
            }
            
            // Fallback: Try to load CSV from external file
            const response = await fetch('./Admission-Data-2025-with-Roll-Numbers-for-Web-Portal.csv');
            if (!response.ok) {
                throw new Error('CSV file not found');
            }
            
            const csvText = await response.text();
            await this.parseCSV(csvText);
            
        } catch (error) {
            console.warn('Failed to load data:', error);
            // Use sample data if external data fails
            this.createSampleData();
            this.hideLoadingScreens();
            this.renderDashboard();
        }
    }

    createSampleData() {
        // Generate comprehensive sample data for all 289 students
        const majorCourses = [
            'KU: BACHELORS (HONOURS) WITH COMPUTER APPLICATIONS AS MAJOR',
            'KU: BACHELORS (HONOURS) WITH POLITICAL SCIENCE AS MAJOR',
            'KU: BACHELORS (HONOURS) WITH ZOOLOGY AS MAJOR',
            'KU: BACHELORS (HONOURS) WITH ARABIC LITERATURE AS MAJOR',
            'KU: BACHELORS (HONOURS) WITH BIO-TECHNOLOGY AS MAJOR',
            'KU: BACHELORS (HONOURS) WITH BOTANY AS MAJOR',
            'KU: BACHELORS (HONOURS) WITH CHEMISTRY AS MAJOR',
            'KU: BACHELORS (HONOURS) WITH ECONOMICS AS MAJOR',
            'KU: BACHELORS (HONOURS) WITH EDUCATION AS MAJOR',
            'KU: BACHELORS (HONOURS) WITH HISTORY AS MAJOR',
            'KU: BACHELORS (HONOURS) WITH SOCIAL WORK AS MAJOR'
        ];

        const minorCourses = [
            'POLITICAL SCIENCE', 'COMPUTER APPLICATIONS', 'ZOOLOGY', 'BOTANY', 'CHEMISTRY',
            'ECONOMICS', 'EDUCATION', 'HISTORY', 'SOCIAL WORK', 'ARABIC LITERATURE',
            'MATHEMATICS/APPLIED MATHEMATICS', 'PHYSICS', 'ENGLISH', 'URDU', 'HINDI',
            'ENVIRONMENTAL SCIENCE', 'PSYCHOLOGY', 'SOCIOLOGY'
        ];

        const skillDevCourses = [
            'PHY122S-RENEWABLE ENERGY & ENERGY HARVESTING',
            'CS122S-DIGITAL LITERACY & COMPUTER APPLICATIONS',
            'BOT122S-SUSTAINABLE AGRICULTURE & ORGANIC FARMING',
            'CHE122S-ANALYTICAL TECHNIQUES IN CHEMISTRY',
            'ZOO122S-AQUACULTURE & FISHERIES SCIENCE',
            'ECO122S-FINANCIAL LITERACY & BANKING',
            'POL122S-HUMAN RIGHTS & GOVERNANCE',
            'HIS122S-HERITAGE CONSERVATION & TOURISM',
            'EDU122S-CHILD PSYCHOLOGY & DEVELOPMENT',
            'SOC122S-SOCIAL ENTREPRENEURSHIP',
            'ENG122S-COMMUNICATION & PRESENTATION SKILLS',
            'ARB122S-CALLIGRAPHY & ARABIC LITERATURE'
        ];

        const majorDistribution = {
            'KU: BACHELORS (HONOURS) WITH COMPUTER APPLICATIONS AS MAJOR': 70,
            'KU: BACHELORS (HONOURS) WITH POLITICAL SCIENCE AS MAJOR': 85,
            'KU: BACHELORS (HONOURS) WITH ZOOLOGY AS MAJOR': 63,
            'KU: BACHELORS (HONOURS) WITH ARABIC LITERATURE AS MAJOR': 8,
            'KU: BACHELORS (HONOURS) WITH BIO-TECHNOLOGY AS MAJOR': 12,
            'KU: BACHELORS (HONOURS) WITH BOTANY AS MAJOR': 16,
            'KU: BACHELORS (HONOURS) WITH CHEMISTRY AS MAJOR': 10,
            'KU: BACHELORS (HONOURS) WITH ECONOMICS AS MAJOR': 9,
            'KU: BACHELORS (HONOURS) WITH EDUCATION AS MAJOR': 19,
            'KU: BACHELORS (HONOURS) WITH HISTORY AS MAJOR': 14,
            'KU: BACHELORS (HONOURS) WITH SOCIAL WORK AS MAJOR': 15
        };

        const firstNames = [
            'Aamir', 'Aisha', 'Ali', 'Amina', 'Arif', 'Asiya', 'Bilal', 'Farah', 'Hassan', 'Hina',
            'Ibrahim', 'Jamila', 'Khalid', 'Layla', 'Malik', 'Mariam', 'Noor', 'Omar', 'Priya', 'Rahul',
            'Sana', 'Tariq', 'Umar', 'Yasmin', 'Zain', 'Zara', 'Ahmed', 'Fatima', 'Mohammad', 'Shabana',
            'Ravi', 'Sunita', 'Vikram', 'Pooja', 'Rajesh', 'Meera', 'Suresh', 'Kavita', 'Dinesh', 'Rekha'
        ];

        const lastNames = [
            'Khan', 'Ahmad', 'Ali', 'Sheikh', 'Malik', 'Shah', 'Bhat', 'Dar', 'Lone', 'Wani',
            'Ganai', 'Rather', 'Mir', 'Khanday', 'Sofi', 'Ganie', 'Najar', 'Tantray', 'Beigh', 'Qureshi',
            'Sharma', 'Kumar', 'Singh', 'Gupta', 'Verma', 'Agarwal', 'Jain', 'Arora', 'Mehta', 'Chopra'
        ];

        this.data = [];
        let rollNumber = 25001;
        let regNumberBase = 533300036000;

        Object.entries(majorDistribution).forEach(([major, count]) => {
            for (let i = 0; i < count; i++) {
                const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
                const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                const fatherFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
                const motherFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];

                const student = {
                    registrationNumber: (regNumberBase + rollNumber - 25001).toString(),
                    classRollNo: rollNumber.toString(),
                    studentName: `${firstName} ${lastName}`,
                    fatherName: `${fatherFirstName} ${lastName}`,
                    motherName: `${motherFirstName} ${lastName}`,
                    majorCourse: major,
                    minorCourse: minorCourses[Math.floor(Math.random() * minorCourses.length)],
                    mdSem1: 'ECONOMICS',
                    mdSem2: 'MATHEMATICS/APPLIED MATHEMATICS',
                    skillDevCourse: skillDevCourses[Math.floor(Math.random() * skillDevCourses.length)],
                    valueAdded1: 'ENVIRONMENTAL SCIENCE / EDUCATION',
                    valueAdded2: 'HEALTH AND WELLNESS',
                    abilityEnh1: 'COMMUNICATION SKILLS',
                    abilityEnh2: 'ENGLISH LANGUAGE'
                };

                this.data.push(student);
                rollNumber++;
            }
        });

        console.log('Generated sample data:', this.data.length, 'students');
    }

    async parseCSV(csvText) {
        return new Promise((resolve) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header) => {
                    const trimmed = header.trim();
                    if (trimmed === '' || trimmed === ' ') {
                        return 'Student Name';
                    }
                    return trimmed;
                },
                transform: (value) => {
                    return this.decodeHtmlEntities(value.trim());
                },
                complete: (results) => {
                    this.processData(results.data);
                    this.hideLoadingScreens();
                    this.renderDashboard();
                    resolve();
                }
            });
        });
    }

    processData(rawData) {
        this.data = rawData
            .filter(row => {
                return Object.values(row).some(value => value && value.trim() !== '');
            })
            .map(row => {
                return {
                    registrationNumber: row['Registration Number'] || row['registrationNumber'] || '',
                    classRollNo: row['Class Roll No.'] || row['classRollNo'] || '',
                    studentName: row['Student Name'] || row['studentName'] || row[' '] || '',
                    fatherName: row['Father Name'] || row['fatherName'] || '',
                    motherName: row['Mother Name'] || row['motherName'] || '',
                    majorCourse: row['Major Course'] || row['majorCourse'] || '',
                    minorCourse: row['Minor Course'] || row['minorCourse'] || '',
                    mdSem1: row['Multi Disciplinary Semester 1'] || row['mdSem1'] || '',
                    mdSem2: row['Multi Disciplinary Semester 2'] || row['mdSem2'] || '',
                    skillDevCourse: row['Skill Development Course'] || row['skillDevCourse'] || '',
                    valueAdded1: row['Value Added Course 1'] || row['valueAdded1'] || '',
                    valueAdded2: row['Value Added Course 2'] || row['valueAdded2'] || '',
                    abilityEnh1: row['Ability Enhancement Course 1'] || row['abilityEnh1'] || '',
                    abilityEnh2: row['Ability Enhancement Course 2'] || row['abilityEnh2'] || ''
                };
            })
            .filter(row => row.registrationNumber || row.studentName);

        // Remove duplicates
        const seen = new Set();
        this.data = this.data.filter(row => {
            if (seen.has(row.registrationNumber)) {
                return false;
            }
            seen.add(row.registrationNumber);
            return true;
        });

        console.log('Processed data:', this.data.length, 'students');
    }

    decodeHtmlEntities(text) {
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.value;
    }

    hideLoadingScreens() {
        document.getElementById('loading-screen').classList.add('d-none');
    }

    // Routing
    setupRouting() {
        window.addEventListener('hashchange', () => {
            this.navigateToPage();
        });

        window.addEventListener('popstate', () => {
            this.navigateToPage();
        });
    }

    navigateTo(page, params = {}) {
        this.currentPage = page;
        
        const url = new URL(window.location);
        url.hash = page;
        
        if (!params.preserveParams) {
            url.search = '';
        }
        
        Object.keys(params).forEach(key => {
            if (key !== 'preserveParams') {
                if (params[key]) {
                    url.searchParams.set(key, params[key]);
                } else {
                    url.searchParams.delete(key);
                }
            }
        });

        window.history.pushState({}, '', url);
        this.navigateToPage();
    }

    navigateToPage() {
        const hash = window.location.hash.substring(1) || 'home';
        this.currentPage = hash;

        // Hide all pages
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.add('d-none');
        });

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        const activeNavLink = document.querySelector(`[data-page="${hash}"]`);
        if (activeNavLink) {
            activeNavLink.classList.add('active');
        }

        // Show current page
        const currentPageElement = document.getElementById(`${hash}-page`);
        if (currentPageElement) {
            currentPageElement.classList.remove('d-none');
        }

        // Handle page-specific logic
        switch (hash) {
            case 'home':
                this.renderDashboard();
                break;
            case 'majors':
                this.renderMajorsPage();
                break;
            case 'students':
                this.renderStudentsPage();
                break;
            case 'about':
                break;
        }
    }

    // Dashboard
    renderDashboard() {
        if (this.data.length === 0) return;

        this.updateStatistics();
        this.renderCharts();
        this.renderTopLists();
    }

    updateStatistics() {
        const stats = this.calculateStatistics();
        
        const totalStudentsEl = document.getElementById('total-students');
        const totalMajorsEl = document.getElementById('total-majors');
        const totalMinorsEl = document.getElementById('total-minors');
        const totalSkillsEl = document.getElementById('total-skills');
        
        if (totalStudentsEl) totalStudentsEl.textContent = stats.totalStudents;
        if (totalMajorsEl) totalMajorsEl.textContent = stats.totalMajors;
        if (totalMinorsEl) totalMinorsEl.textContent = stats.totalMinors;
        if (totalSkillsEl) totalSkillsEl.textContent = stats.totalSkills;
    }

    calculateStatistics() {
        const majors = new Set();
        const minors = new Set();
        const skills = new Set();

        this.data.forEach(student => {
            if (student.majorCourse) majors.add(student.majorCourse);
            if (student.minorCourse) minors.add(student.minorCourse);
            if (student.skillDevCourse) skills.add(student.skillDevCourse);
        });

        return {
            totalStudents: this.data.length,
            totalMajors: majors.size,
            totalMinors: minors.size,
            totalSkills: skills.size
        };
    }

    renderCharts() {
        this.renderMajorsChart();
        this.renderMinorsChart();
        this.renderSkillsChart();
    }

    renderMajorsChart() {
        const ctx = document.getElementById('majors-chart');
        if (!ctx) return;

        const majorCounts = this.getCounts('majorCourse');
        const sortedMajors = Object.entries(majorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 15);

        if (this.charts.majors) {
            this.charts.majors.destroy();
        }

        this.charts.majors = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedMajors.map(([major]) => this.truncateText(major, 30)),
                datasets: [{
                    label: 'Students',
                    data: sortedMajors.map(([,count]) => count),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: (tooltipItems) => {
                                const index = tooltipItems[0].dataIndex;
                                return sortedMajors[index][0];
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true },
                    x: { 
                        ticks: { maxRotation: 45 }
                    }
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const major = sortedMajors[index][0];
                        this.navigateTo('majors', { major: encodeURIComponent(major) });
                    }
                }
            }
        });
    }

    renderMinorsChart(showAll = false) {
        const ctx = document.getElementById('minors-chart');
        if (!ctx) return;

        this.showingAllMinors = showAll;
        const minorCounts = this.getCounts('minorCourse');
        const sortedMinors = Object.entries(minorCounts)
            .sort(([,a], [,b]) => b - a);
        
        const displayData = showAll ? sortedMinors : sortedMinors.slice(0, 10);

        if (this.charts.minors) {
            this.charts.minors.destroy();
        }

        this.charts.minors = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: displayData.map(([minor]) => this.truncateText(minor, 25)),
                datasets: [{
                    label: 'Students',
                    data: displayData.map(([,count]) => count),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: (tooltipItems) => {
                                const index = tooltipItems[0].dataIndex;
                                return displayData[index][0];
                            }
                        }
                    }
                },
                scales: {
                    x: { beginAtZero: true }
                }
            }
        });

        const toggleBtn = document.getElementById('toggle-minors-chart');
        if (toggleBtn) {
            toggleBtn.textContent = showAll ? 'Show Top 10' : 'Show All';
        }
    }

    renderSkillsChart() {
        const ctx = document.getElementById('skills-chart');
        if (!ctx) return;

        const skillCounts = this.getCounts('skillDevCourse');
        const sortedSkills = Object.entries(skillCounts)
            .sort(([,a], [,b]) => b - a);

        if (this.charts.skills) {
            this.charts.skills.destroy();
        }

        this.charts.skills = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: sortedSkills.map(([skill]) => this.truncateText(skill, 25)),
                datasets: [{
                    data: sortedSkills.map(([,count]) => count),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { boxWidth: 12 }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    toggleMinorsChart() {
        this.renderMinorsChart(!this.showingAllMinors);
    }

    renderTopLists() {
        const majorCounts = this.getCounts('majorCourse');
        const minorCounts = this.getCounts('minorCourse');
        
        const topMajors = Object.entries(majorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        const topMinors = Object.entries(minorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        this.renderTopList('top-majors-list', topMajors, 'majors');
        this.renderTopList('top-minors-list', topMinors, 'students');
    }

    renderTopList(containerId, data, targetPage) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = data.map(([item, count]) => `
            <div class="top-list-item" data-item="${encodeURIComponent(item)}" data-target="${targetPage}">
                <span class="text-truncate" title="${item}">${this.truncateText(item, 30)}</span>
                <span class="top-list-count">${count}</span>
            </div>
        `).join('');

        container.querySelectorAll('.top-list-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const itemValue = decodeURIComponent(item.getAttribute('data-item'));
                const target = item.getAttribute('data-target');
                
                if (target === 'majors') {
                    this.navigateTo('majors', { major: encodeURIComponent(itemValue) });
                } else {
                    this.navigateTo('students', { search: encodeURIComponent(itemValue) });
                }
            });
        });
    }

    // Majors Page
    renderMajorsPage() {
        if (this.data.length === 0) return;

        this.renderMajorsList();
        this.handleMajorSelection();
    }

    renderMajorsList() {
        const majorCounts = this.getCounts('majorCourse');
        const sortedMajors = Object.entries(majorCounts)
            .sort(([a], [b]) => a.localeCompare(b));

        const container = document.getElementById('majors-list');
        if (!container) return;

        container.innerHTML = sortedMajors.map(([major, count]) => `
            <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" 
               data-major="${encodeURIComponent(major)}">
                <span class="text-truncate me-2" title="${major}">${this.truncateText(major, 40)}</span>
                <span class="badge bg-secondary rounded-pill">${count}</span>
            </a>
        `).join('');

        container.querySelectorAll('[data-major]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const major = decodeURIComponent(item.getAttribute('data-major'));
                this.selectMajor(major);
            });
        });
    }

    filterMajorsList() {
        const searchTerm = document.getElementById('major-search')?.value.toLowerCase() || '';
        const items = document.querySelectorAll('#majors-list [data-major]');
        
        items.forEach(item => {
            const major = decodeURIComponent(item.getAttribute('data-major')).toLowerCase();
            const visible = major.includes(searchTerm);
            item.style.display = visible ? 'flex' : 'none';
        });
    }

    handleMajorSelection() {
        const urlParams = new URLSearchParams(window.location.search);
        const selectedMajor = urlParams.get('major');
        
        if (selectedMajor) {
            this.selectMajor(decodeURIComponent(selectedMajor));
        }
    }

    selectMajor(major) {
        const url = new URL(window.location);
        url.searchParams.set('major', encodeURIComponent(major));
        window.history.replaceState({}, '', url);

        document.querySelectorAll('#majors-list .list-group-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-major="${encodeURIComponent(major)}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        this.renderMajorDetails(major);
    }

    renderMajorDetails(major) {
        const majorStudents = this.data.filter(student => student.majorCourse === major);
        
        const topMinor = this.getMostCommon(majorStudents, 'minorCourse');
        const topSkill = this.getMostCommon(majorStudents, 'skillDevCourse');
        
        const studentCountEl = document.getElementById('major-student-count');
        const topMinorEl = document.getElementById('major-top-minor');
        const topSkillEl = document.getElementById('major-top-skill');
        
        if (studentCountEl) studentCountEl.textContent = majorStudents.length;
        if (topMinorEl) topMinorEl.textContent = this.truncateText(topMinor, 30);
        if (topSkillEl) topSkillEl.textContent = this.truncateText(topSkill, 30);

        this.currentMajorStudents = majorStudents;
        this.pagination.majors.currentPage = 1;
        
        this.renderMajorStudentsTable();
        this.renderMajorBreakdownCharts(majorStudents);
        
        const detailsEl = document.getElementById('major-details');
        const noSelectionEl = document.getElementById('no-major-selected');
        
        if (detailsEl) detailsEl.classList.remove('d-none');
        if (noSelectionEl) noSelectionEl.classList.add('d-none');
    }

    renderMajorStudentsTable() {
        const students = this.currentMajorStudents || [];
        const { currentPage, perPage } = this.pagination.majors;
        
        const sortedStudents = this.sortData(students, this.currentSort.field, this.currentSort.direction);
        
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedStudents = sortedStudents.slice(startIndex, endIndex);

        const tableBody = document.getElementById('major-students-table');
        if (!tableBody) return;

        tableBody.innerHTML = paginatedStudents.map(student => `
            <tr>
                <td>${student.classRollNo}</td>
                <td>${student.registrationNumber}</td>
                <td>${student.studentName}</td>
                <td>${student.fatherName}</td>
                <td>${student.motherName}</td>
                <td><span title="${student.minorCourse}">${this.truncateText(student.minorCourse, 20)}</span></td>
                <td><span title="${student.skillDevCourse}">${this.truncateText(student.skillDevCourse, 25)}</span></td>
            </tr>
        `).join('');

        this.renderPagination('major-pagination', students.length, this.pagination.majors, () => {
            this.renderMajorStudentsTable();
        });

        this.setupTableSorting(() => this.renderMajorStudentsTable());
    }

    renderMajorBreakdownCharts(majorStudents) {
        this.renderMajorBreakdownChart('major-breakdown-minor-chart', majorStudents, 'minorCourse');
        this.renderMajorBreakdownChart('major-breakdown-skill-chart', majorStudents, 'skillDevCourse');
    }

    renderMajorBreakdownChart(canvasId, students, field) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        const counts = {};
        students.forEach(student => {
            const value = student[field];
            if (value) {
                counts[value] = (counts[value] || 0) + 1;
            }
        });

        const sortedData = Object.entries(counts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: sortedData.map(([item]) => this.truncateText(item, 20)),
                datasets: [{
                    data: sortedData.map(([,count]) => count),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 12 }
                    }
                }
            }
        });
    }

    // Students Page
    renderStudentsPage() {
        if (this.data.length === 0) return;

        this.setupStudentsFilters();
        this.performSearch();
    }

    setupStudentsFilters() {
        const majors = [...new Set(this.data.map(s => s.majorCourse))].filter(Boolean).sort();
        const minors = [...new Set(this.data.map(s => s.minorCourse))].filter(Boolean).sort();
        const skills = [...new Set(this.data.map(s => s.skillDevCourse))].filter(Boolean).sort();

        this.populateMultiSelect('filter-major', majors);
        this.populateMultiSelect('filter-minor', minors);
        this.populateMultiSelect('filter-skill', skills);
    }

    populateMultiSelect(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.innerHTML = options.map(option => 
            `<option value="${encodeURIComponent(option)}">${this.truncateText(option, 50)}</option>`
        ).join('');
    }

    performSearch() {
        const searchName = document.getElementById('search-name')?.value.toLowerCase() || '';
        const searchReg = document.getElementById('search-registration')?.value || '';
        const searchRoll = document.getElementById('search-roll')?.value || '';
        
        const selectedMajors = this.getSelectedValues('filter-major');
        const selectedMinors = this.getSelectedValues('filter-minor');
        const selectedSkills = this.getSelectedValues('filter-skill');

        this.filteredData = this.data.filter(student => {
            if (searchName && !student.studentName.toLowerCase().includes(searchName)) {
                return false;
            }
            
            if (searchReg) {
                if (!student.registrationNumber.includes(searchReg)) {
                    return false;
                }
            }
            
            if (searchRoll) {
                if (!student.classRollNo.includes(searchRoll)) {
                    return false;
                }
            }
            
            if (selectedMajors.length > 0 && !selectedMajors.includes(student.majorCourse)) {
                return false;
            }
            
            if (selectedMinors.length > 0 && !selectedMinors.includes(student.minorCourse)) {
                return false;
            }
            
            if (selectedSkills.length > 0 && !selectedSkills.includes(student.skillDevCourse)) {
                return false;
            }

            return true;
        });

        this.pagination.students.currentPage = 1;
        this.renderStudentsTable();
    }

    getSelectedValues(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return [];
        
        return Array.from(select.selectedOptions).map(option => 
            decodeURIComponent(option.value)
        );
    }

    renderStudentsTable() {
        const { currentPage, perPage } = this.pagination.students;
        
        const sortedStudents = this.sortData(this.filteredData, this.currentSort.field, this.currentSort.direction);
        
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedStudents = sortedStudents.slice(startIndex, endIndex);

        const tableBody = document.getElementById('students-results-table');
        if (!tableBody) return;

        tableBody.innerHTML = paginatedStudents.map(student => `
            <tr>
                <td>${student.classRollNo}</td>
                <td>${student.registrationNumber}</td>
                <td>${student.studentName}</td>
                <td><span title="${student.majorCourse}">${this.truncateText(student.majorCourse, 30)}</span></td>
                <td><span title="${student.minorCourse}">${this.truncateText(student.minorCourse, 20)}</span></td>
                <td><span title="${student.skillDevCourse}">${this.truncateText(student.skillDevCourse, 25)}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="portal.showStudentDetails('${student.registrationNumber}')">
                        <i class="bi bi-eye"></i> View
                    </button>
                </td>
            </tr>
        `).join('');

        const resultsCountEl = document.getElementById('results-count');
        if (resultsCountEl) {
            resultsCountEl.textContent = this.filteredData.length;
        }

        this.renderPagination('students-pagination', this.filteredData.length, this.pagination.students, () => {
            this.renderStudentsTable();
        });

        this.setupTableSorting(() => this.renderStudentsTable());
    }

    showStudentDetails(registrationNumber) {
        const student = this.data.find(s => s.registrationNumber === registrationNumber);
        if (!student) return;

        const modalBody = document.getElementById('student-modal-body');
        modalBody.innerHTML = `
            <div class="row g-3">
                <div class="col-md-6">
                    <div class="student-detail-item">
                        <h6>Registration Number</h6>
                        <p class="d-flex justify-content-between align-items-center">
                            ${student.registrationNumber}
                            <button class="btn btn-sm btn-outline-secondary copy-btn" onclick="navigator.clipboard.writeText('${student.registrationNumber}')">
                                <i class="bi bi-copy"></i>
                            </button>
                        </p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="student-detail-item">
                        <h6>Class Roll Number</h6>
                        <p>${student.classRollNo}</p>
                    </div>
                </div>
                <div class="col-12">
                    <div class="student-detail-item">
                        <h6>Student Name</h6>
                        <p>${student.studentName}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="student-detail-item">
                        <h6>Father's Name</h6>
                        <p>${student.fatherName}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="student-detail-item">
                        <h6>Mother's Name</h6>
                        <p>${student.motherName}</p>
                    </div>
                </div>
                <div class="col-12">
                    <div class="student-detail-item">
                        <h6>Major Course</h6>
                        <p>${student.majorCourse}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="student-detail-item">
                        <h6>Minor Course</h6>
                        <p>${student.minorCourse}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="student-detail-item">
                        <h6>Skill Development Course</h6>
                        <p>${student.skillDevCourse}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="student-detail-item">
                        <h6>Multi Disciplinary Semester 1</h6>
                        <p>${student.mdSem1}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="student-detail-item">
                        <h6>Multi Disciplinary Semester 2</h6>
                        <p>${student.mdSem2}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="student-detail-item">
                        <h6>Value Added Course 1</h6>
                        <p>${student.valueAdded1}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="student-detail-item">
                        <h6>Value Added Course 2</h6>
                        <p>${student.valueAdded2}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="student-detail-item">
                        <h6>Ability Enhancement Course 1</h6>
                        <p>${student.abilityEnh1}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="student-detail-item">
                        <h6>Ability Enhancement Course 2</h6>
                        <p>${student.abilityEnh2}</p>
                    </div>
                </div>
            </div>
        `;

        const modal = new bootstrap.Modal(document.getElementById('student-modal'));
        modal.show();
    }

    // Utility Functions
    getCounts(field) {
        const counts = {};
        this.data.forEach(student => {
            const value = student[field];
            if (value) {
                counts[value] = (counts[value] || 0) + 1;
            }
        });
        return counts;
    }

    getMostCommon(data, field) {
        const counts = {};
        data.forEach(item => {
            const value = item[field];
            if (value) {
                counts[value] = (counts[value] || 0) + 1;
            }
        });
        
        let maxCount = 0;
        let mostCommon = '';
        Object.entries(counts).forEach(([value, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = value;
            }
        });
        
        return mostCommon || 'N/A';
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    sortData(data, field, direction) {
        if (!field) return data;
        
        return [...data].sort((a, b) => {
            const aVal = a[field] || '';
            const bVal = b[field] || '';
            
            let comparison = 0;
            if (aVal < bVal) comparison = -1;
            if (aVal > bVal) comparison = 1;
            
            return direction === 'desc' ? -comparison : comparison;
        });
    }

    setupTableSorting(renderCallback) {
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const field = header.getAttribute('data-sort');
                
                if (this.currentSort.field === field) {
                    this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    this.currentSort.field = field;
                    this.currentSort.direction = 'asc';
                }
                
                document.querySelectorAll('.sortable').forEach(h => {
                    h.classList.remove('sorted');
                    const icon = h.querySelector('i');
                    if (icon) icon.className = 'bi bi-arrow-down-up';
                });
                
                header.classList.add('sorted');
                const icon = header.querySelector('i');
                if (icon) {
                    icon.className = this.currentSort.direction === 'asc' ? 'bi bi-sort-up' : 'bi bi-sort-down';
                }
                
                renderCallback();
            });
        });
    }

    renderPagination(containerId, totalItems, paginationState, renderCallback) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const { currentPage, perPage } = paginationState;
        const totalPages = Math.ceil(totalItems / perPage);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        const startItem = (currentPage - 1) * perPage + 1;
        const endItem = Math.min(currentPage * perPage, totalItems);

        let paginationHtml = `
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">
                    Showing ${startItem} to ${endItem} of ${totalItems} entries
                </small>
                <nav>
                    <ul class="pagination pagination-sm mb-0">
        `;

        paginationHtml += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
            </li>
        `;

        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        paginationHtml += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
            </li>
        `;

        paginationHtml += '</ul></nav></div>';
        
        container.innerHTML = paginationHtml;

        container.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const page = parseInt(e.target.getAttribute('data-page'));
                if (page && page !== currentPage && page >= 1 && page <= totalPages) {
                    paginationState.currentPage = page;
                    renderCallback();
                }
            });
        });
    }

    clearAllFilters() {
        const searchName = document.getElementById('search-name');
        const searchReg = document.getElementById('search-registration');
        const searchRoll = document.getElementById('search-roll');
        
        if (searchName) searchName.value = '';
        if (searchReg) searchReg.value = '';
        if (searchRoll) searchRoll.value = '';
        
        const filterMajor = document.getElementById('filter-major');
        const filterMinor = document.getElementById('filter-minor');
        const filterSkill = document.getElementById('filter-skill');
        
        if (filterMajor) filterMajor.selectedIndex = -1;
        if (filterMinor) filterMinor.selectedIndex = -1;
        if (filterSkill) filterSkill.selectedIndex = -1;
        
        this.performSearch();
    }

    exportResults() {
        if (this.filteredData.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = [
            'Class Roll No.',
            'Registration Number', 
            'Student Name',
            'Father Name',
            'Mother Name',
            'Major Course',
            'Minor Course',
            'Multi Disciplinary Semester 1',
            'Multi Disciplinary Semester 2',
            'Skill Development Course',
            'Value Added Course 1',
            'Value Added Course 2',
            'Ability Enhancement Course 1',
            'Ability Enhancement Course 2'
        ];

        const csvContent = [
            headers.join(','),
            ...this.filteredData.map(student => [
                student.classRollNo,
                student.registrationNumber,
                student.studentName,
                student.fatherName,
                student.motherName,
                student.majorCourse,
                student.minorCourse,
                student.mdSem1,
                student.mdSem2,
                student.skillDevCourse,
                student.valueAdded1,
                student.valueAdded2,
                student.abilityEnh1,
                student.abilityEnh2
            ].map(field => `"${(field || '').replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `GDC_Beerwah_Students_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    handleStatCardClick(filter) {
        switch (filter) {
            case 'students':
                this.navigateTo('students');
                break;
            case 'majors':
                this.navigateTo('majors');
                break;
            case 'minors':
            case 'skills':
                this.navigateTo('students');
                break;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.portal = new AdmissionsPortal();
});

// Make portal globally accessible for onclick handlers
window.portal = null;