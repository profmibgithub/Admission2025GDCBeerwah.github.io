// GDC Beerwah Admission Portal - Main JavaScript

// Global variables
let studentsData = [];
let currentPage = 'dashboard';
let filteredStudents = [];
let currentSort = { column: null, direction: 'asc' };
let currentPagination = { page: 1, size: 25 };
let searchTimeout = null;
let charts = {};
let showAllMinors = false;
let isAdminLoggedIn = false;
let currentStudentForEdit = null;

// Chart.js configuration
const chartColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    showLoadingScreen(true);
    loadData();
    setupEventListeners();
    updateNavigation();
});

// Load data from the provided JSON asset
async function loadData() {
    try {
        console.log('Loading data...');
        
        const response = await fetch('./admission_data.json');
        
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        
        const data = await response.json();
        console.log('Data loaded:', data);
        
        // Process the student data
        if (data.students && Array.isArray(data.students)) {
            studentsData = data.students.map(student => ({
                registrationNumber: formatRegistrationNumber(student['Registration Number']),
                classRollNo: student['Class Roll No.'],
                studentName: student['Student Name'] || student[' '] || 'Unknown',
                fatherName: student['Father Name'],
                motherName: student['Mother Name'],
                majorCourse: student['Major Course'],
                minorCourse: student['Minor Course'],
                mdSem1: student['Multi Disciplinary Semester 1'],
                mdSem2: student['Multi Disciplinary Semester 2'],
                skillDevCourse: student['Skill Development Course'],
                valueAdded1: student['Value Added Course 1'],
                valueAdded2: student['Value Added Course 2'],
                abilityEnh1: student['Ability Enhancement Course 1'],
                abilityEnh2: student['Ability Enhancement Course 2']
            }));
        } else {
            // Generate sample data if not available
            studentsData = generateSampleData();
        }
        
        console.log('Processed students data:', studentsData.length, 'students');
        
        // Initialize the application
        filteredStudents = [...studentsData];
        await initializeApplication();
        
        console.log('Application initialized successfully');
        
    } catch (error) {
        console.error('Error loading data:', error);
        // Generate sample data as fallback
        studentsData = generateSampleData();
        filteredStudents = [...studentsData];
        await initializeApplication();
        showToast('Using sample data due to loading error', 'warning');
    }
}

// Initialize the complete application
async function initializeApplication() {
    try {
        console.log('Initializing application components...');
        
        initializeDashboard();
        initializePages();
        
        // Small delay to ensure everything is rendered
        setTimeout(() => {
            showLoadingScreen(false);
            console.log('Loading screen hidden');
            showToast('Application loaded successfully', 'success');
        }, 500);
        
    } catch (error) {
        console.error('Error initializing application:', error);
        showLoadingScreen(false);
        showToast('Application loaded with some issues', 'warning');
    }
}

// Generate sample data if needed
function generateSampleData() {
    console.log('Generating sample data...');
    
    const majors = [
        "KU: BACHELORS (HONOURS) WITH COMPUTER APPLICATIONS AS MAJOR",
        "KU: BACHELORS (HONOURS) WITH ZOOLOGY AS MAJOR",
        "KU: BACHELORS (HONOURS) WITH POLITICAL SCIENCE AS MAJOR",
        "KU: BACHELORS (HONOURS) WITH EDUCATION AS MAJOR",
        "KU: BACHELORS (HONOURS) WITH BOTANY AS MAJOR",
        "KU: BACHELORS (HONOURS) WITH SOCIAL WORK AS MAJOR",
        "KU: BACHELORS (HONOURS) WITH HISTORY AS MAJOR",
        "KU: BACHELORS (HONOURS) WITH BIO-TECHNOLOGY AS MAJOR",
        "KU: BACHELORS (HONOURS) WITH CHEMISTRY AS MAJOR",
        "KU: BACHELORS (HONOURS) WITH ECONOMICS AS MAJOR",
        "KU: BACHELORS (HONOURS) WITH ARABIC LITERATURE AS MAJOR"
    ];
    
    const minors = ["APPLIED COMPUTING", "EDUCATION", "WATER MANAGEMENT", "SOCIAL WORK", "BOTANY", "POLITICAL SCIENCE", "ZOOLOGY", "URDU LITERATURE", "HISTORY", "BIOTECHNOLOGY", "ENGLISH LITERATURE", "ENVIRONMENTAL SCIENCE", "CHEMISTRY", "INTRODUCTION TO COMPUTERS", "ECONOMICS", "PHYSICS", "COMPUTER APPLICATIONS"];
    
    const skills = ["PROGRAMMING WITH C (BASIC)", "EARLY CHILDHOOD CARE & EDUCATION", "BIOLOGY, BREEDING, AND REARING OF ORNAMENTAL FISH", "INTRODUCTION TO MUSHROOM SCIENCE", "INTERNET BASICS AND HTML", "PERSONAL SELLING AND SALESMANSHIP", "PHARMACEUTICS & PHARMACEUTICAL CHEMISTRY", "PHY122S-RENEWABLE ENERGY & ENERGY HARVESTING"];
    
    const sampleData = [];
    
    // Create sample data based on the provided statistics
    const majorCounts = {
        "KU: BACHELORS (HONOURS) WITH COMPUTER APPLICATIONS AS MAJOR": 70,
        "KU: BACHELORS (HONOURS) WITH ZOOLOGY AS MAJOR": 63,
        "KU: BACHELORS (HONOURS) WITH POLITICAL SCIENCE AS MAJOR": 51,
        "KU: BACHELORS (HONOURS) WITH EDUCATION AS MAJOR": 19,
        "KU: BACHELORS (HONOURS) WITH BOTANY AS MAJOR": 16,
        "KU: BACHELORS (HONOURS) WITH SOCIAL WORK AS MAJOR": 15,
        "KU: BACHELORS (HONOURS) WITH HISTORY AS MAJOR": 14,
        "KU: BACHELORS (HONOURS) WITH BIO-TECHNOLOGY AS MAJOR": 12,
        "KU: BACHELORS (HONOURS) WITH CHEMISTRY AS MAJOR": 11,
        "KU: BACHELORS (HONOURS) WITH ECONOMICS AS MAJOR": 10,
        "KU: BACHELORS (HONOURS) WITH ARABIC LITERATURE AS MAJOR": 8
    };
    
    let studentId = 1;
    
    Object.entries(majorCounts).forEach(([major, count]) => {
        for (let i = 0; i < count; i++) {
            sampleData.push({
                registrationNumber: `53330003${String(6398 + studentId).padStart(4, '0')}`,
                classRollNo: 25000 + studentId,
                studentName: `Student ${studentId}`,
                fatherName: `Father ${studentId}`,
                motherName: `Mother ${studentId}`,
                majorCourse: major,
                minorCourse: minors[Math.floor(Math.random() * minors.length)],
                mdSem1: "ECONOMICS",
                mdSem2: "MATHEMATICS/APPLIED MATHEMATICS",
                skillDevCourse: skills[Math.floor(Math.random() * skills.length)],
                valueAdded1: "ENVIRONMENTAL SCIENCE / EDUCATION",
                valueAdded2: "HEALTH AND WELLNESS",
                abilityEnh1: "COMMUNICATION SKILLS",
                abilityEnh2: "ENGLISH LANGUAGE"
            });
            studentId++;
        }
    });
    
    console.log('Generated', sampleData.length, 'sample students');
    return sampleData;
}

// Format registration number to handle scientific notation
function formatRegistrationNumber(regNum) {
    if (!regNum) return 'Unknown';
    
    // Handle scientific notation
    if (typeof regNum === 'number') {
        return regNum.toString().replace(/e\+?/, '');
    }
    
    // Handle string representation
    if (typeof regNum === 'string') {
        // Remove any scientific notation
        if (regNum.includes('e') || regNum.includes('E')) {
            return parseFloat(regNum).toString();
        }
        return regNum;
    }
    
    return regNum.toString();
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Search inputs with debouncing
    const searchInputs = ['search-name', 'search-registration', 'search-roll', 'major-search', 'admin-search'];
    searchInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', debounce(handleSearch, 250));
        }
    });
    
    // Filter selects
    const filterSelects = ['filter-major', 'filter-minor', 'filter-skill'];
    filterSelects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.addEventListener('change', handleSearch);
        }
    });
    
    // Table sorting
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('sortable') || e.target.closest('.sortable')) {
            const th = e.target.closest('.sortable');
            const column = th.dataset.column;
            handleSort(column);
        }
    });
    
    // Pagination
    const pageSize = document.getElementById('page-size');
    if (pageSize) {
        pageSize.addEventListener('change', function() {
            currentPagination.size = parseInt(this.value);
            currentPagination.page = 1;
            renderStudentsTable();
        });
    }
    
    // Admin login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Hash change for URL routing
    window.addEventListener('hashchange', handleHashChange);
    
    // Handle URL parameters on load
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('major')) {
        currentPage = 'majors';
        setTimeout(() => selectMajor(decodeURIComponent(urlParams.get('major'))), 1000);
    }
}

// Debounce function for search inputs
function debounce(func, wait) {
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(searchTimeout);
            func(...args);
        };
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(later, wait);
    };
}

// Navigation handling
function handleNavigation(e) {
    e.preventDefault();
    const page = e.target.getAttribute('onclick')?.match(/showPage\('(.+)'\)/)?.[1];
    if (page) {
        showPage(page);
    }
}

// Show specific page
window.showPage = function(page) {
    console.log('Showing page:', page);
    
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(p => {
        p.classList.add('d-none');
    });
    
    // Show selected page
    const selectedPage = document.getElementById(`${page}-page`);
    if (selectedPage) {
        selectedPage.classList.remove('d-none');
        selectedPage.classList.add('fade-in');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeNav = document.getElementById(`nav-${page}`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
    
    currentPage = page;
    
    // Initialize page-specific content
    switch (page) {
        case 'dashboard':
            initializeDashboard();
            break;
        case 'majors':
            initializeMajorsPage();
            break;
        case 'students':
            initializeStudentsPage();
            break;
        case 'admin':
            initializeAdminPage();
            break;
        case 'about':
            initializeAboutPage();
            break;
    }
}

// Initialize dashboard
function initializeDashboard() {
    console.log('Initializing dashboard...');
    
    if (studentsData.length === 0) {
        console.log('No student data available');
        return;
    }
    
    const stats = calculateStatistics();
    console.log('Statistics calculated:', stats);
    
    // Update summary cards
    const totalStudentsEl = document.getElementById('total-students');
    const uniqueMajorsEl = document.getElementById('unique-majors');
    const uniqueMinorsEl = document.getElementById('unique-minors');
    const uniqueSkillsEl = document.getElementById('unique-skills');
    
    if (totalStudentsEl) totalStudentsEl.textContent = stats.totalStudents;
    if (uniqueMajorsEl) uniqueMajorsEl.textContent = stats.uniqueMajors;
    if (uniqueMinorsEl) uniqueMinorsEl.textContent = stats.uniqueMinors;
    if (uniqueSkillsEl) uniqueSkillsEl.textContent = stats.uniqueSkills;
    
    // Render charts
    renderDashboardCharts(stats);
    
    // Render top lists
    renderTopLists(stats);
    
    console.log('Dashboard initialized successfully');
}

// Calculate statistics from data
function calculateStatistics() {
    const majorCounts = {};
    const minorCounts = {};
    const skillCounts = {};
    
    studentsData.forEach(student => {
        // Count majors
        if (student.majorCourse) {
            majorCounts[student.majorCourse] = (majorCounts[student.majorCourse] || 0) + 1;
        }
        
        // Count minors
        if (student.minorCourse) {
            minorCounts[student.minorCourse] = (minorCounts[student.minorCourse] || 0) + 1;
        }
        
        // Count skills
        if (student.skillDevCourse) {
            skillCounts[student.skillDevCourse] = (skillCounts[student.skillDevCourse] || 0) + 1;
        }
    });
    
    return {
        totalStudents: studentsData.length,
        uniqueMajors: Object.keys(majorCounts).length,
        uniqueMinors: Object.keys(minorCounts).length,
        uniqueSkills: Object.keys(skillCounts).length,
        majorCounts,
        minorCounts,
        skillCounts
    };
}

// Render dashboard charts
function renderDashboardCharts(stats) {
    console.log('Rendering dashboard charts...');
    
    // Destroy existing charts
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    charts = {};
    
    try {
        // Major Course Bar Chart
        const majorCtx = document.getElementById('majorChart');
        if (majorCtx) {
            const majorData = Object.entries(stats.majorCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10);
            
            charts.majorChart = new Chart(majorCtx, {
                type: 'bar',
                data: {
                    labels: majorData.map(([major]) => major.replace('KU: BACHELORS (HONOURS) WITH ', '').replace(' AS MAJOR', '')),
                    datasets: [{
                        label: 'Students',
                        data: majorData.map(([, count]) => count),
                        backgroundColor: chartColors.slice(0, majorData.length)
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }
        
        // Minor Course Horizontal Bar Chart
        const minorCtx = document.getElementById('minorChart');
        if (minorCtx) {
            const minorData = Object.entries(stats.minorCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, showAllMinors ? undefined : 10);
            
            charts.minorChart = new Chart(minorCtx, {
                type: 'bar',
                data: {
                    labels: minorData.map(([minor]) => minor),
                    datasets: [{
                        label: 'Students',
                        data: minorData.map(([, count]) => count),
                        backgroundColor: chartColors.slice(0, minorData.length)
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: { beginAtZero: true }
                    }
                }
            });
        }
        
        // Skill Development Donut Chart
        const skillCtx = document.getElementById('skillChart');
        if (skillCtx) {
            const skillData = Object.entries(stats.skillCounts)
                .sort(([,a], [,b]) => b - a);
            
            charts.skillChart = new Chart(skillCtx, {
                type: 'doughnut',
                data: {
                    labels: skillData.map(([skill]) => skill),
                    datasets: [{
                        data: skillData.map(([, count]) => count),
                        backgroundColor: chartColors.slice(0, skillData.length)
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { 
                            position: 'bottom',
                            labels: {
                                boxWidth: 12,
                                padding: 15,
                                usePointStyle: true
                            }
                        }
                    }
                }
            });
        }
        
        console.log('Charts rendered successfully');
        
    } catch (error) {
        console.error('Error rendering charts:', error);
    }
}

// Toggle minor chart display
window.toggleMinorChart = function() {
    showAllMinors = !showAllMinors;
    const btn = document.getElementById('toggle-minor-btn');
    if (btn) {
        btn.textContent = showAllMinors ? 'Show Top 10' : 'Show All';
    }
    
    const stats = calculateStatistics();
    renderDashboardCharts(stats);
}

// Render top lists
function renderTopLists(stats) {
    // Top majors
    const topMajors = Object.entries(stats.majorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    const topMajorsList = document.getElementById('top-majors-list');
    if (topMajorsList) {
        topMajorsList.innerHTML = topMajors.map(([major, count]) => `
            <div class="top-list-item cursor-pointer" onclick="showMajorDetails('${major.replace(/'/g, "\\'")}')">
                <span class="top-list-name text-truncate-2">${major.replace('KU: BACHELORS (HONOURS) WITH ', '').replace(' AS MAJOR', '')}</span>
                <span class="top-list-count">${count}</span>
            </div>
        `).join('');
    }
    
    // Top minors
    const topMinors = Object.entries(stats.minorCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    const topMinorsList = document.getElementById('top-minors-list');
    if (topMinorsList) {
        topMinorsList.innerHTML = topMinors.map(([minor, count]) => `
            <div class="top-list-item">
                <span class="top-list-name">${minor}</span>
                <span class="top-list-count">${count}</span>
            </div>
        `).join('');
    }
}

// Show major details
window.showMajorDetails = function(major) {
    showPage('majors');
    setTimeout(() => selectMajor(major), 100);
}

// Initialize majors page
function initializeMajorsPage() {
    if (studentsData.length === 0) return;
    
    const stats = calculateStatistics();
    renderMajorsList(stats.majorCounts);
}

// Render majors list
function renderMajorsList(majorCounts) {
    const majorsList = document.getElementById('majors-list');
    if (!majorsList) return;
    
    const majors = Object.entries(majorCounts)
        .sort(([a], [b]) => a.localeCompare(b));
    
    majorsList.innerHTML = majors.map(([major, count]) => `
        <a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" 
           onclick="selectMajor('${major.replace(/'/g, "\\'")}')">
            <span class="text-truncate me-2">${major.replace('KU: BACHELORS (HONOURS) WITH ', '').replace(' AS MAJOR', '')}</span>
            <span class="badge rounded-pill">${count}</span>
        </a>
    `).join('');
}

// Select major and show details
window.selectMajor = function(major) {
    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('major', encodeURIComponent(major));
    window.history.pushState({}, '', url);
    
    // Update active selection
    document.querySelectorAll('#majors-list .list-group-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeItem = Array.from(document.querySelectorAll('#majors-list .list-group-item'))
        .find(item => item.getAttribute('onclick')?.includes(major.replace(/'/g, "\\'")));
    
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    // Show major details
    renderMajorDetails(major);
}

// Render major details
function renderMajorDetails(major) {
    const majorStudents = studentsData.filter(s => s.majorCourse === major);
    
    // Update title
    const title = document.getElementById('selected-major-title');
    if (title) {
        title.textContent = major.replace('KU: BACHELORS (HONOURS) WITH ', '').replace(' AS MAJOR', '');
    }
    
    // Calculate major statistics
    const minorCounts = {};
    const skillCounts = {};
    
    majorStudents.forEach(student => {
        if (student.minorCourse) {
            minorCounts[student.minorCourse] = (minorCounts[student.minorCourse] || 0) + 1;
        }
        if (student.skillDevCourse) {
            skillCounts[student.skillDevCourse] = (skillCounts[student.skillDevCourse] || 0) + 1;
        }
    });
    
    const mostCommonMinor = Object.entries(minorCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
    const mostCommonSkill = Object.entries(skillCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
    
    // Render major details
    const detailsContainer = document.getElementById('major-details');
    if (detailsContainer) {
        detailsContainer.innerHTML = `
            <div class="major-summary">
                <div class="row text-center">
                    <div class="col-md-4 summary-item">
                        <div class="summary-number">${majorStudents.length}</div>
                        <div class="summary-label">Total Students</div>
                    </div>
                    <div class="col-md-4 summary-item">
                        <div class="summary-number">${Object.keys(minorCounts).length}</div>
                        <div class="summary-label">Minor Options</div>
                    </div>
                    <div class="col-md-4 summary-item">
                        <div class="summary-number">${Object.keys(skillCounts).length}</div>
                        <div class="summary-label">Skill Courses</div>
                    </div>
                </div>
            </div>
            
            <ul class="nav nav-tabs" role="tablist">
                <li class="nav-item">
                    <a class="nav-link active" data-bs-toggle="tab" href="#students-tab">Students</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" data-bs-toggle="tab" href="#breakdown-tab">Breakdown</a>
                </li>
            </ul>
            
            <div class="tab-content mt-3">
                <div class="tab-pane fade show active" id="students-tab">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead class="table-light">
                                <tr>
                                    <th>Roll No.</th>
                                    <th>Registration No.</th>
                                    <th>Name</th>
                                    <th>Father Name</th>
                                    <th>Mother Name</th>
                                    <th>Minor Course</th>
                                    <th>Skill Course</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${majorStudents.map(student => `
                                    <tr>
                                        <td><strong>${student.classRollNo}</strong></td>
                                        <td><code>${student.registrationNumber}</code></td>
                                        <td>${student.studentName}</td>
                                        <td>${student.fatherName}</td>
                                        <td>${student.motherName}</td>
                                        <td><span class="badge bg-secondary">${student.minorCourse}</span></td>
                                        <td><small class="text-muted">${student.skillDevCourse}</small></td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary" onclick="showStudentDetails('${student.registrationNumber}')">
                                                <i class="bi bi-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="tab-pane fade" id="breakdown-tab">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="mb-0">Distribution by Minor Course</h6>
                                </div>
                                <div class="card-body">
                                    ${Object.entries(minorCounts)
                                        .sort(([,a], [,b]) => b - a)
                                        .map(([minor, count]) => `
                                            <div class="d-flex justify-content-between mb-2">
                                                <span>${minor}</span>
                                                <strong>${count}</strong>
                                            </div>
                                        `).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="mb-0">Distribution by Skill Course</h6>
                                </div>
                                <div class="card-body">
                                    ${Object.entries(skillCounts)
                                        .sort(([,a], [,b]) => b - a)
                                        .map(([skill, count]) => `
                                            <div class="d-flex justify-content-between mb-2">
                                                <span class="text-truncate me-2">${skill}</span>
                                                <strong>${count}</strong>
                                            </div>
                                        `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize students page
function initializeStudentsPage() {
    if (studentsData.length === 0) return;
    
    populateFilterOptions();
    handleSearch();
}

// Populate filter options
function populateFilterOptions() {
    const stats = calculateStatistics();
    
    // Major filter
    const majorFilter = document.getElementById('filter-major');
    if (majorFilter) {
        majorFilter.innerHTML = Object.keys(stats.majorCounts)
            .sort()
            .map(major => `<option value="${major}">${major.replace('KU: BACHELORS (HONOURS) WITH ', '').replace(' AS MAJOR', '')}</option>`)
            .join('');
    }
    
    // Minor filter
    const minorFilter = document.getElementById('filter-minor');
    if (minorFilter) {
        minorFilter.innerHTML = Object.keys(stats.minorCounts)
            .sort()
            .map(minor => `<option value="${minor}">${minor}</option>`)
            .join('');
    }
    
    // Skill filter
    const skillFilter = document.getElementById('filter-skill');
    if (skillFilter) {
        skillFilter.innerHTML = Object.keys(stats.skillCounts)
            .sort()
            .map(skill => `<option value="${skill}">${skill}</option>`)
            .join('');
    }
}

// Handle search and filtering
function handleSearch() {
    const nameQuery = document.getElementById('search-name')?.value.toLowerCase().trim() || '';
    const regQuery = document.getElementById('search-registration')?.value.trim() || '';
    const rollQuery = document.getElementById('search-roll')?.value.trim() || '';
    
    const majorFilter = Array.from(document.getElementById('filter-major')?.selectedOptions || []).map(o => o.value);
    const minorFilter = Array.from(document.getElementById('filter-minor')?.selectedOptions || []).map(o => o.value);
    const skillFilter = Array.from(document.getElementById('filter-skill')?.selectedOptions || []).map(o => o.value);
    
    filteredStudents = studentsData.filter(student => {
        // Text search
        const nameMatch = !nameQuery || student.studentName.toLowerCase().includes(nameQuery);
        const regMatch = !regQuery || student.registrationNumber.includes(regQuery) || student.registrationNumber.startsWith(regQuery);
        const rollMatch = !rollQuery || student.classRollNo.toString().includes(rollQuery) || student.classRollNo.toString().startsWith(rollQuery);
        
        // Filter matches
        const majorMatch = majorFilter.length === 0 || majorFilter.includes(student.majorCourse);
        const minorMatch = minorFilter.length === 0 || minorFilter.includes(student.minorCourse);
        const skillMatch = skillFilter.length === 0 || skillFilter.includes(student.skillDevCourse);
        
        return nameMatch && regMatch && rollMatch && majorMatch && minorMatch && skillMatch;
    });
    
    currentPagination.page = 1;
    renderStudentsTable();
}

// Handle table sorting
function handleSort(column) {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    
    filteredStudents.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        // Handle numeric sorting for roll numbers
        if (column === 'classRollNo') {
            aVal = parseInt(aVal);
            bVal = parseInt(bVal);
        }
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (aVal < bVal) return currentSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return currentSort.direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    // Update sort indicators
    document.querySelectorAll('.sortable i').forEach(i => {
        i.className = 'bi bi-chevron-expand';
    });
    
    const activeHeader = document.querySelector(`[data-column="${column}"] i`);
    if (activeHeader) {
        activeHeader.className = currentSort.direction === 'asc' ? 'bi bi-chevron-up' : 'bi bi-chevron-down';
        activeHeader.parentElement.classList.add('sorted');
    }
    
    renderStudentsTable();
}

// Render students table
function renderStudentsTable() {
    const tbody = document.getElementById('students-table-body');
    const resultsCount = document.getElementById('results-count');
    
    if (!tbody) return;
    
    // Update results count
    if (resultsCount) {
        resultsCount.textContent = `${filteredStudents.length} students found`;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredStudents.length / currentPagination.size);
    const startIndex = (currentPagination.page - 1) * currentPagination.size;
    const endIndex = Math.min(startIndex + currentPagination.size, filteredStudents.length);
    const pageStudents = filteredStudents.slice(startIndex, endIndex);
    
    // Render table rows
    tbody.innerHTML = pageStudents.map(student => `
        <tr>
            <td><strong>${student.classRollNo}</strong></td>
            <td><code class="user-select-all">${student.registrationNumber}</code></td>
            <td>${student.studentName}</td>
            <td class="text-truncate" style="max-width: 150px;">${student.majorCourse.replace('KU: BACHELORS (HONOURS) WITH ', '').replace(' AS MAJOR', '')}</td>
            <td><span class="badge bg-secondary">${student.minorCourse}</span></td>
            <td class="text-truncate" style="max-width: 200px;" title="${student.skillDevCourse}">${student.skillDevCourse}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="showStudentDetails('${student.registrationNumber}')" title="View Details">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Render pagination
    renderPagination(totalPages);
}

// Render pagination
function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPagination.page > 1) {
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${currentPagination.page - 1})">Previous</a></li>`;
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPagination.page - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<li class="page-item ${i === currentPagination.page ? 'active' : ''}">
            <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
        </li>`;
    }
    
    // Next button
    if (currentPagination.page < totalPages) {
        paginationHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${currentPagination.page + 1})">Next</a></li>`;
    }
    
    pagination.innerHTML = paginationHTML;
}

// Change page
window.changePage = function(page) {
    currentPagination.page = page;
    renderStudentsTable();
}

// Show student details modal
window.showStudentDetails = function(registrationNumber) {
    const student = studentsData.find(s => s.registrationNumber === registrationNumber);
    if (!student) return;
    
    const modalBody = document.getElementById('student-modal-body');
    if (!modalBody) return;
    
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="highlight-field">
                    <div class="student-detail-item">
                        <div class="student-detail-label">Registration Number</div>
                        <div class="student-detail-value user-select-all">${student.registrationNumber}</div>
                    </div>
                </div>
                
                <div class="highlight-field">
                    <div class="student-detail-item">
                        <div class="student-detail-label">Class Roll Number</div>
                        <div class="student-detail-value">${student.classRollNo}</div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="highlight-field">
                    <div class="student-detail-item">
                        <div class="student-detail-label">Major Course</div>
                        <div class="student-detail-value">${student.majorCourse}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="row mt-3">
            <div class="col-md-4">
                <div class="student-detail-item">
                    <div class="student-detail-label">Student Name</div>
                    <div class="student-detail-value">${student.studentName}</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="student-detail-item">
                    <div class="student-detail-label">Father's Name</div>
                    <div class="student-detail-value">${student.fatherName}</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="student-detail-item">
                    <div class="student-detail-label">Mother's Name</div>
                    <div class="student-detail-value">${student.motherName}</div>
                </div>
            </div>
        </div>
        
        <div class="row mt-3">
            <div class="col-md-6">
                <div class="student-detail-item">
                    <div class="student-detail-label">Minor Course</div>
                    <div class="student-detail-value">${student.minorCourse}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="student-detail-item">
                    <div class="student-detail-label">Skill Development Course</div>
                    <div class="student-detail-value">${student.skillDevCourse}</div>
                </div>
            </div>
        </div>
        
        <div class="row mt-3">
            <div class="col-md-6">
                <div class="student-detail-item">
                    <div class="student-detail-label">Multi Disciplinary Semester 1</div>
                    <div class="student-detail-value">${student.mdSem1}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="student-detail-item">
                    <div class="student-detail-label">Multi Disciplinary Semester 2</div>
                    <div class="student-detail-value">${student.mdSem2}</div>
                </div>
            </div>
        </div>
        
        <div class="row mt-3">
            <div class="col-md-6">
                <div class="student-detail-item">
                    <div class="student-detail-label">Value Added Course 1</div>
                    <div class="student-detail-value">${student.valueAdded1}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="student-detail-item">
                    <div class="student-detail-label">Value Added Course 2</div>
                    <div class="student-detail-value">${student.valueAdded2}</div>
                </div>
            </div>
        </div>
        
        <div class="row mt-3">
            <div class="col-md-6">
                <div class="student-detail-item">
                    <div class="student-detail-label">Ability Enhancement Course 1</div>
                    <div class="student-detail-value">${student.abilityEnh1}</div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="student-detail-item">
                    <div class="student-detail-label">Ability Enhancement Course 2</div>
                    <div class="student-detail-value">${student.abilityEnh2}</div>
                </div>
            </div>
        </div>
    `;
    
    // Store current student for printing/PDF
    currentStudentForEdit = student;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('studentModal'));
    modal.show();
}

// Print student details
window.printStudentDetails = function() {
    if (currentStudentForEdit) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>Student Details - ${currentStudentForEdit.studentName}</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .highlight-field { background: #f8f9fa; padding: 15px; border: 2px solid #007bff; border-radius: 8px; margin: 10px 0; }
                    .student-detail-label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
                    .student-detail-value { font-size: 14px; margin-top: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="text-center mb-4">
                        <h2>Government Degree College Beerwah</h2>
                        <h4>Student Details - Batch 2025</h4>
                    </div>
                    ${document.getElementById('student-modal-body').innerHTML}
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

// Download student PDF
window.downloadStudentPDF = function() {
    if (!currentStudentForEdit) return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const student = currentStudentForEdit;
    
    // Header
    doc.setFontSize(20);
    doc.text('Government Degree College Beerwah', 105, 30, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Student Details - Batch 2025', 105, 45, { align: 'center' });
    
    // Student details
    let y = 70;
    const lineHeight = 15;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    
    // Highlighted fields
    doc.setFillColor(59, 130, 246);
    doc.rect(20, y - 5, 170, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(`Registration Number: ${student.registrationNumber}`, 25, y + 5);
    doc.text(`Roll Number: ${student.classRollNo}`, 25, y + 15);
    
    y += 35;
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, y - 5, 170, 15, 'F');
    doc.text(`Major Course: ${student.majorCourse}`, 25, y + 5);
    
    y += 25;
    doc.setFont(undefined, 'normal');
    
    const fields = [
        ['Student Name', student.studentName],
        ['Father\'s Name', student.fatherName],
        ['Mother\'s Name', student.motherName],
        ['Minor Course', student.minorCourse],
        ['Skill Development Course', student.skillDevCourse],
        ['Multi Disciplinary Semester 1', student.mdSem1],
        ['Multi Disciplinary Semester 2', student.mdSem2],
        ['Value Added Course 1', student.valueAdded1],
        ['Value Added Course 2', student.valueAdded2],
        ['Ability Enhancement Course 1', student.abilityEnh1],
        ['Ability Enhancement Course 2', student.abilityEnh2]
    ];
    
    fields.forEach(([label, value]) => {
        doc.setFont(undefined, 'bold');
        doc.text(`${label}:`, 25, y);
        doc.setFont(undefined, 'normal');
        doc.text(value || 'N/A', 25, y + 8);
        y += lineHeight;
    });
    
    doc.save(`${student.studentName}_${student.registrationNumber}_details.pdf`);
}

// Export functions
window.exportStudents = function(format) {
    if (format === 'csv') {
        exportToCSV(filteredStudents, 'students_export.csv');
    } else if (format === 'pdf') {
        exportToPDF(filteredStudents, 'students_export.pdf');
    }
}

function exportToCSV(data, filename) {
    const headers = [
        'Registration Number', 'Class Roll No.', 'Student Name', 'Father Name', 'Mother Name',
        'Major Course', 'Minor Course', 'Multi Disciplinary Semester 1', 'Multi Disciplinary Semester 2',
        'Skill Development Course', 'Value Added Course 1', 'Value Added Course 2',
        'Ability Enhancement Course 1', 'Ability Enhancement Course 2'
    ];
    
    const csvContent = [
        headers.join(','),
        ...data.map(student => [
            `"${student.registrationNumber}"`,
            student.classRollNo,
            `"${student.studentName}"`,
            `"${student.fatherName}"`,
            `"${student.motherName}"`,
            `"${student.majorCourse}"`,
            `"${student.minorCourse}"`,
            `"${student.mdSem1}"`,
            `"${student.mdSem2}"`,
            `"${student.skillDevCourse}"`,
            `"${student.valueAdded1}"`,
            `"${student.valueAdded2}"`,
            `"${student.abilityEnh1}"`,
            `"${student.abilityEnh2}"`
        ].join(','))
    ].join('\n');
    
    downloadFile(csvContent, filename, 'text/csv');
}

function exportToPDF(data, filename) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.text('Government Degree College Beerwah', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('Student List Export - Batch 2025', 105, 30, { align: 'center' });
    doc.text(`Total Students: ${data.length}`, 105, 40, { align: 'center' });
    
    // Table
    const columns = ['Roll No.', 'Registration No.', 'Name', 'Major', 'Minor'];
    const rows = data.map(student => [
        student.classRollNo,
        student.registrationNumber,
        student.studentName,
        student.majorCourse.replace('KU: BACHELORS (HONOURS) WITH ', '').replace(' AS MAJOR', ''),
        student.minorCourse
    ]);
    
    doc.autoTable({
        head: [columns],
        body: rows,
        startY: 50,
        styles: { fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 35 },
            2: { cellWidth: 40 },
            3: { cellWidth: 50 },
            4: { cellWidth: 35 }
        }
    });
    
    doc.save(filename);
}

window.exportChartData = function(type) {
    const stats = calculateStatistics();
    let data, filename;
    
    switch (type) {
        case 'majors':
            data = Object.entries(stats.majorCounts).map(([major, count]) => ({
                'Major Course': major,
                'Student Count': count
            }));
            filename = 'majors_distribution.csv';
            break;
        case 'minors':
            data = Object.entries(stats.minorCounts).map(([minor, count]) => ({
                'Minor Course': minor,
                'Student Count': count
            }));
            filename = 'minors_distribution.csv';
            break;
        case 'skills':
            data = Object.entries(stats.skillCounts).map(([skill, count]) => ({
                'Skill Development Course': skill,
                'Student Count': count
            }));
            filename = 'skills_distribution.csv';
            break;
    }
    
    if (data) {
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');
        
        downloadFile(csvContent, filename, 'text/csv');
    }
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`${filename} downloaded successfully`, 'success');
}

// Admin functions
function initializeAdminPage() {
    if (isAdminLoggedIn) {
        document.getElementById('admin-login').classList.add('d-none');
        document.getElementById('admin-dashboard').classList.remove('d-none');
    } else {
        document.getElementById('admin-login').classList.remove('d-none');
        document.getElementById('admin-dashboard').classList.add('d-none');
    }
}

function handleAdminLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    // Hash the password and compare
    hashPassword(password).then(hashedPassword => {
        const correctHash = 'ca4e6c3421aebe565955f201e37b48afca2f053e7adeb63db813312aa7ca1694';
        
        if (username === 'profmib' && hashedPassword === correctHash) {
            isAdminLoggedIn = true;
            initializeAdminPage();
            showToast('Login successful', 'success');
        } else {
            showToast('Invalid credentials', 'error');
        }
    });
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hash));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

window.adminLogout = function() {
    isAdminLoggedIn = false;
    document.getElementById('admin-username').value = '';
    document.getElementById('admin-password').value = '';
    document.getElementById('admin-search').value = '';
    document.getElementById('admin-edit-form').classList.add('d-none');
    initializeAdminPage();
    showToast('Logged out successfully', 'success');
}

window.adminSearchStudent = function() {
    if (!isAdminLoggedIn) return;
    
    const query = document.getElementById('admin-search').value.trim();
    if (!query) return;
    
    const student = studentsData.find(s => 
        s.registrationNumber.includes(query) || 
        s.classRollNo.toString().includes(query)
    );
    
    if (student) {
        showAdminEditForm(student);
    } else {
        showToast('Student not found', 'error');
    }
}

function showAdminEditForm(student) {
    currentStudentForEdit = student;
    
    const form = document.getElementById('student-edit-form');
    form.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">Registration Number</label>
                    <input type="text" class="form-control" value="${student.registrationNumber}" readonly>
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">Class Roll No.</label>
                    <input type="text" class="form-control" value="${student.classRollNo}" readonly>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-12">
                <div class="mb-3">
                    <label class="form-label">Student Name</label>
                    <input type="text" class="form-control" value="${student.studentName}" readonly>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">Major Course</label>
                    <select class="form-select" id="edit-major">
                        ${getUniqueValues('majorCourse').map(major => 
                            `<option value="${major}" ${major === student.majorCourse ? 'selected' : ''}>${major}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">Minor Course</label>
                    <select class="form-select" id="edit-minor">
                        ${getUniqueValues('minorCourse').map(minor => 
                            `<option value="${minor}" ${minor === student.minorCourse ? 'selected' : ''}>${minor}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-12">
                <div class="mb-3">
                    <label class="form-label">Skill Development Course</label>
                    <select class="form-select" id="edit-skill">
                        ${getUniqueValues('skillDevCourse').map(skill => 
                            `<option value="${skill}" ${skill === student.skillDevCourse ? 'selected' : ''}>${skill}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
        </div>
        
        <div class="d-flex gap-2">
            <button type="button" class="btn btn-primary" onclick="saveStudentChanges()">
                <i class="bi bi-save me-1"></i>Save Changes
            </button>
            <button type="button" class="btn btn-secondary" onclick="cancelEdit()">
                Cancel
            </button>
        </div>
    `;
    
    document.getElementById('admin-edit-form').classList.remove('d-none');
}

function getUniqueValues(field) {
    return [...new Set(studentsData.map(s => s[field]))].filter(v => v).sort();
}

window.saveStudentChanges = function() {
    if (!currentStudentForEdit) return;
    
    const majorCourse = document.getElementById('edit-major').value;
    const minorCourse = document.getElementById('edit-minor').value;
    const skillDevCourse = document.getElementById('edit-skill').value;
    
    // Find and update the student
    const studentIndex = studentsData.findIndex(s => s.registrationNumber === currentStudentForEdit.registrationNumber);
    if (studentIndex !== -1) {
        studentsData[studentIndex].majorCourse = majorCourse;
        studentsData[studentIndex].minorCourse = minorCourse;
        studentsData[studentIndex].skillDevCourse = skillDevCourse;
        
        // Update filtered students if necessary
        const filteredIndex = filteredStudents.findIndex(s => s.registrationNumber === currentStudentForEdit.registrationNumber);
        if (filteredIndex !== -1) {
            filteredStudents[filteredIndex].majorCourse = majorCourse;
            filteredStudents[filteredIndex].minorCourse = minorCourse;
            filteredStudents[filteredIndex].skillDevCourse = skillDevCourse;
        }
        
        // Refresh all displays
        if (currentPage === 'dashboard') {
            initializeDashboard();
        } else if (currentPage === 'students') {
            handleSearch();
        } else if (currentPage === 'majors') {
            initializeMajorsPage();
        }
        
        showToast('Student information updated successfully', 'success');
        cancelEdit();
    }
}

window.cancelEdit = function() {
    document.getElementById('admin-edit-form').classList.add('d-none');
    document.getElementById('admin-search').value = '';
    currentStudentForEdit = null;
}

window.showAllStudentsForAdmin = function() {
    showPage('students');
}

window.exportAllData = function() {
    exportToCSV(studentsData, 'all_students_export.csv');
}

// Initialize about page
function initializeAboutPage() {
    if (studentsData.length === 0) return;
    
    const stats = calculateStatistics();
    
    document.getElementById('about-total-students').textContent = stats.totalStudents;
    document.getElementById('about-total-majors').textContent = stats.uniqueMajors;
    document.getElementById('about-total-minors').textContent = stats.uniqueMinors;
    document.getElementById('about-total-skills').textContent = stats.uniqueSkills;
}

// Utility functions
function initializePages() {
    showPage('dashboard');
}

function updateNavigation() {
    // Set active navigation based on current page
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeNav = document.getElementById(`nav-${currentPage}`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
}

function showLoadingScreen(show) {
    console.log('Loading screen:', show ? 'show' : 'hide');
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = show ? 'flex' : 'none';
    }
}

function showFileUploadFallback() {
    showToast('Failed to load data automatically. Please use the file upload feature if needed.', 'error');
}

function showToast(message, type = 'info') {
    console.log('Toast:', type, message);
    const toast = document.getElementById('toast');
    const toastBody = document.getElementById('toast-body');
    
    if (toast && toastBody) {
        toastBody.textContent = message;
        toast.className = `toast ${type}`;
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
}

function handleHashChange() {
    // Handle URL hash changes if needed
    const hash = window.location.hash.substring(1);
    if (hash && ['dashboard', 'majors', 'students', 'admin', 'about'].includes(hash)) {
        showPage(hash);
    }
}

// Make sure functions are available globally
window.showPage = showPage;
window.toggleMinorChart = toggleMinorChart;
window.showMajorDetails = showMajorDetails;
window.selectMajor = selectMajor;
window.changePage = changePage;
window.showStudentDetails = showStudentDetails;
window.printStudentDetails = printStudentDetails;
window.downloadStudentPDF = downloadStudentPDF;
window.exportStudents = exportStudents;
window.exportChartData = exportChartData;
window.adminLogout = adminLogout;
window.adminSearchStudent = adminSearchStudent;
window.saveStudentChanges = saveStudentChanges;
window.cancelEdit = cancelEdit;
window.showAllStudentsForAdmin = showAllStudentsForAdmin;
window.exportAllData = exportAllData;
