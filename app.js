// College Admission Portal JavaScript - Uses local admission_data.json

// Global variables
let admissionData = {};
let allStudents = [];
let currentProgram = '';
let isDataLoaded = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    loadRealData();
});

// Load real student data from the provided JSON file
async function loadRealData() {
    try {
        console.log('Loading real student data...');
        
        // Show loading modal briefly
        const loadingModal = document.getElementById('loadingModal');
        if (loadingModal) {
            const modal = new bootstrap.Modal(loadingModal);
            modal.show();
            
            setTimeout(() => {
                modal.hide();
            }, 1500);
        }
        
        // Load the complete student data from local file (must be served over HTTP)
        const response = await fetch('admission_data.json', { cache: 'no-store' });
        const data = await response.json();
        
        // Set the admission data
        admissionData = data || {};
        allStudents = Array.isArray(data.students) ? data.students : [];
        
        // Build program summary map from actual students
        admissionData.programs = buildProgramsFromStudents(allStudents);
        isDataLoaded = true;
        
        console.log('Loaded', allStudents.length, 'real students');
        
        // Initialize the application with real data
        initializeApp();
        renderCharts();
        
    } catch (error) {
        console.error('Error loading real data:', error);
        showErrorMessage('Failed to load admission_data.json. Please open the site via a local web server (file:// fetch is blocked by browsers).');
    }
}

// Build program summary from students (counts and names)
function buildProgramsFromStudents(students) {
    const programs = {};
    students.forEach(s => {
        const clean = s.clean_program?.trim();
        if (!clean) return;
        if (!programs[clean]) {
            programs[clean] = {
                program_name: s.program_name || clean,
                clean_name: clean,
                student_count: 0
            };
        }
        programs[clean].student_count += 1;
    });
    return programs;
}

// Helper functions for generating realistic course assignments
function getMinorForProgram(program) {
    const minors = {
        "COMPUTER APPLICATIONS": "APPLIED COMPUTING",
        "ZOOLOGY": "BOTANY", 
        "POLITICAL SCIENCE": "HISTORY",
        "EDUCATION": "PSYCHOLOGY",
        "SOCIAL WORK": "EDUCATION",
        "HISTORY": "POLITICAL SCIENCE",
        "BIO-TECHNOLOGY": "CHEMISTRY",
        "ARABIC LITERATURE": "URDU LITERATURE",
        "CHEMISTRY": "PHYSICS",
        "BOTANY": "ZOOLOGY",
        "ACCOUNTING & TAXATION (COMMERCE)": "Principles of Management",
        "ECONOMICS": "POLITICAL SCIENCE"
    };
    return minors[program] || "General Studies";
}

function getMultiSem1() {
    const options = ["ECONOMICS", "ENGLISH LITERATURE", "HISTORY", "POLITICAL SCIENCE", "KASHMIRI LITERATURE"];
    return options[Math.floor(Math.random() * options.length)];
}

function getMultiSem2() {
    const options = ["INTRODUCTION TO COMPUTERS", "SOCIAL WORK", "URDU LITERATURE", "WATER MANAGEMENT", "ENVIRONMENTAL SCIENCE"];
    return options[Math.floor(Math.random() * options.length)];
}

function getSkillEnhancement(program) {
    const skills = {
        "COMPUTER APPLICATIONS": "PROGRAMMING WITH C (BASIC)",
        "ZOOLOGY": "BIOLOGY, BREEDING, AND REARING OF ORNAMENTAL FISH",
        "POLITICAL SCIENCE": "GENDER SENSITIZATION",
        "EDUCATION": "EARLY CHILDHOOD CARE & EDUCATION",
        "SOCIAL WORK": "EARLY CHILDHOOD CARE & EDUCATION",
        "HISTORY": "GENDER SENSITIZATION",
        "BIO-TECHNOLOGY": "INTRODUCTION TO MUSHROOM SCIENCE",
        "ARABIC LITERATURE": "EARLY CHILDHOOD CARE & EDUCATION",
        "CHEMISTRY": "PHARMACEUTICS & PHARMACEUTICAL CHEMISTRY",
        "BOTANY": "INTRODUCTION TO MUSHROOM SCIENCE",
        "ACCOUNTING & TAXATION (COMMERCE)": "PERSONAL SELLING AND SALESMANSHIP",
        "ECONOMICS": "INTERNET BASICS AND HTML"
    };
    return skills[program] || "EARLY CHILDHOOD CARE & EDUCATION";
}

// Initialize the application with loaded data
function initializeApp() {
    console.log('Initializing app with', allStudents.length, 'students');
    
    // Update statistics based on actual data
    updateStatistics();
    
    // Initialize the home page
    initializeHomePage();
    setupEventListeners();
    animateStats();
    showSection('home');
    
    // Enable search functionality
    setupSearchFunctionality();
    
    console.log('App initialization complete');
}

// Render charts using Chart.js
function renderCharts() {
    if (!window.Chart || !isDataLoaded) return;
    try {
        renderProgramBarChart();
        renderMinorPieChart();
        renderMultiBarChart();
    } catch (e) {
        console.error('Error rendering charts', e);
    }
}

function renderProgramBarChart() {
    const el = document.getElementById('programBarChart');
    if (!el || !admissionData.programs) return;
    const labels = Object.keys(admissionData.programs);
    const data = labels.map(l => admissionData.programs[l].student_count);
    const bg = labels.map((_, i) => chartColor(i, 0.8));
    const border = labels.map((_, i) => chartColor(i, 1));
    new Chart(el, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Students',
                data,
                backgroundColor: bg,
                borderColor: border,
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 } },
                y: { beginAtZero: true, title: { display: true, text: 'Students' } }
            },
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} students` } }
            }
        }
    });
}

function renderMinorPieChart() {
    const el = document.getElementById('minorPieChart');
    if (!el) return;
    const counts = {};
    allStudents.forEach(s => {
        const m = (s.minor || 'N/A').trim();
        counts[m] = (counts[m] || 0) + 1;
    });
    // Top 6 minors + Other
    const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    const top = entries.slice(0,6);
    const otherCount = entries.slice(6).reduce((sum, [,c])=>sum+c, 0);
    const labels = top.map(([k])=>k).concat(otherCount ? ['Other'] : []);
    const data = top.map(([,v])=>v).concat(otherCount ? [otherCount] : []);
    const colors = labels.map((_, i) => chartColor(i, 0.9));
    new Chart(el, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed} students` } }
            },
            cutout: '55%'
        }
    });
}

function renderMultiBarChart() {
    const el = document.getElementById('multiBarChart');
    if (!el) return;
    const counts = {};
    allStudents.forEach(s => {
        const m1 = (s.multi_sem1 || '').trim();
        const m2 = (s.multi_sem2 || '').trim();
        if (m1) counts[m1] = (counts[m1] || 0) + 1;
        if (m2) counts[m2] = (counts[m2] || 0) + 1;
    });
    const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,12);
    const labels = entries.map(([k])=>k);
    const data = entries.map(([,v])=>v);
    const bg = labels.map((_, i) => chartColor(i, 0.8));
    new Chart(el, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Selections', data, backgroundColor: bg }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Selections' } } },
            plugins: { legend: { display: false } }
        }
    });
}

// Palette helper
function chartColor(i, alpha = 1) {
    const palette = [
        'rgba(54, 162, 235, ALPHA)',
        'rgba(255, 99, 132, ALPHA)',
        'rgba(255, 206, 86, ALPHA)',
        'rgba(75, 192, 192, ALPHA)',
        'rgba(153, 102, 255, ALPHA)',
        'rgba(255, 159, 64, ALPHA)',
        'rgba(40, 167, 69, ALPHA)',
        'rgba(23, 162, 184, ALPHA)'
    ];
    return palette[i % palette.length].replace('ALPHA', alpha.toString());
}

// Update statistics based on loaded data
function updateStatistics() {
    // Update hero badges
    const studentsBadge = document.getElementById('totalStudentsCount');
    if (studentsBadge) studentsBadge.textContent = `${allStudents.length} Students`;

    const programsBadge = document.getElementById('totalProgramsCount');
    const programsCount = admissionData.programs ? Object.keys(admissionData.programs).length : (admissionData.total_programs || 0);
    if (programsBadge) programsBadge.textContent = `${programsCount} Programs`;

    // Update About facts
    const factsStudents = document.getElementById('factsTotalStudents');
    if (factsStudents) factsStudents.textContent = `${allStudents.length} (Real Data)`;
    const factsPrograms = document.getElementById('factsTotalPrograms');
    if (factsPrograms) factsPrograms.textContent = `${programsCount} Bachelor's Programs`;
}

// Initialize home page with loaded data
function initializeHomePage() {
    createProgramCards();
    setupSampleStudentCards();
    setupSearchFunctionality();
    updateProgramMenuCounts();
}

// Update program counts in navbar/footer links based on loaded data
function updateProgramMenuCounts() {
    if (!admissionData.programs) return;
    const links = document.querySelectorAll('a[onclick^="showProgram("]');
    links.forEach(link => {
        const onclick = link.getAttribute('onclick');
        const matches = onclick && onclick.match(/showProgram\('([^']+)'\)/);
        if (matches && matches[1]) {
            const name = matches[1];
            const program = admissionData.programs[name];
            if (program) {
                link.textContent = `${name} (${program.student_count})`;
            }
        }
    });
}

// Setup sample student cards to be clickable
function setupSampleStudentCards() {
    const sampleCards = document.querySelectorAll('.sample-student-card');
    sampleCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            // Extract registration number from the card content
            const regNumberElement = card.querySelector('small');
            if (regNumberElement) {
                const regText = regNumberElement.textContent;
                const regNumber = regText.replace('Reg: ', '').trim();
                showStudentDetails(regNumber);
            }
        });
    });
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Quick search functionality
    const quickSearchInput = document.getElementById('quickSearch');
    if (quickSearchInput) {
        quickSearchInput.addEventListener('input', handleQuickSearchInput);
        quickSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performQuickSearch();
                e.preventDefault();
            }
        });
    }

    // Global search functionality
    const globalSearchInput = document.getElementById('globalSearch');
    if (globalSearchInput) {
        globalSearchInput.addEventListener('input', handleGlobalSearchInput);
        globalSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performGlobalSearch();
                e.preventDefault();
            }
        });
    }

    // Program search functionality
    const programSearchInput = document.getElementById('programSearch');
    if (programSearchInput) {
        programSearchInput.addEventListener('input', handleProgramSearch);
    }

    // Sort functionality
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }

    // Navigation links
    setupNavigationListeners();
    
    // Dropdown menu items
    setupDropdownListeners();
    
    console.log('Event listeners setup complete');
}

// Setup navigation listeners
function setupNavigationListeners() {
    // Main navigation menu links
    document.addEventListener('click', function(e) {
        // Handle navigation clicks
        if (e.target.matches('.nav-link:not(.dropdown-toggle)') || e.target.matches('.navbar-brand')) {
            e.preventDefault();
            const href = e.target.getAttribute('href');
            if (href && href.startsWith('#')) {
                const sectionId = href.substring(1);
                showSection(sectionId);
            }
        }
        
        // Handle footer links
        if (e.target.matches('.footer-links a')) {
            const href = e.target.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const sectionId = href.substring(1);
                if (sectionId !== 'programs') {
                    showSection(sectionId);
                }
            }
        }
    });
}

// Setup dropdown listeners
function setupDropdownListeners() {
    // Handle dropdown menu items
    document.addEventListener('click', function(e) {
        if (e.target.matches('.dropdown-item')) {
            e.preventDefault();
            const onclick = e.target.getAttribute('onclick');
            if (onclick && onclick.includes('showProgram')) {
                // Extract program name from onclick attribute
                const matches = onclick.match(/showProgram\('([^']+)'\)/);
                if (matches && matches[1]) {
                    showProgram(matches[1]);
                }
            }
        }
    });
}

// Show specific section
function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.classList.add('fade-in');
        
        // Update navbar active state
        updateNavbarActive(sectionId);
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Initialize section-specific functionality
        if (sectionId === 'search') {
            setTimeout(() => {
                const searchInput = document.getElementById('globalSearch');
                if (searchInput) {
                    searchInput.focus();
                }
            }, 100);
        }
    } else {
        console.error('Section not found:', sectionId);
    }
}

// Update navbar active state
function updateNavbarActive(sectionId) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
}

// Show specific program
function showProgram(programName) {
    console.log('Showing program:', programName);
    
    if (!isDataLoaded) {
        showErrorMessage('Data is still loading. Please try again in a moment.');
        return;
    }

    currentProgram = programName;
    showSection('programs');
    
    // Update breadcrumb and title
    const breadcrumb = document.getElementById('programBreadcrumb');
    const title = document.getElementById('programTitle');
    
    if (breadcrumb) breadcrumb.textContent = programName;
    if (title) title.textContent = `${programName} - Students List`;

    // Display students for this program
    displayProgramStudents(programName);
}

// Display students for a specific program
function displayProgramStudents(programName) {
    const programStudents = allStudents.filter(student => 
        student.clean_program === programName
    );

    const tableContainer = document.getElementById('studentsTable');
    if (!tableContainer) return;

    if (programStudents.length === 0) {
        tableContainer.innerHTML = `
            <div class="alert alert-info text-center">
                <i class="fas fa-info-circle me-2"></i>
                No students found for ${programName}
            </div>
        `;
        return;
    }

    const tableHTML = `
        <table class="table table-striped table-hover">
            <thead>
                <tr>
                    <th>S.No</th>
                    <th>Student Name</th>
                    <th>Registration Number</th>
                    <th>Father's Name</th>
                    <th>Mother's Name</th>
                    <th>Minor Subject</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${programStudents.map((student, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td class="student-name">${student.student_name}</td>
                        <td class="reg-number">${student.registration_number}</td>
                        <td>${student.father_name}</td>
                        <td>${student.mother_name}</td>
                        <td class="course-info">${student.minor || 'N/A'}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" onclick="showStudentDetails('${student.registration_number}')">
                                <i class="fas fa-eye me-1"></i>View Details
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="mt-3">
            <small class="text-muted">
                <i class="fas fa-users me-1"></i>
                Showing ${programStudents.length} students in ${programName}
            </small>
        </div>
    `;

    tableContainer.innerHTML = tableHTML;
}

// Create program cards for home page
function createProgramCards() {
    if (!admissionData.programs) return;

    const container = document.getElementById('programCards');
    if (!container) return;

    const programs = Object.values(admissionData.programs);
    programs.sort((a, b) => b.student_count - a.student_count);

    const cardsHTML = programs.map(program => `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-3">
            <div class="program-card" onclick="showProgram('${program.clean_name}')">
                <h6>${program.clean_name}</h6>
                <div class="student-count">${program.student_count}</div>
                <small class="text-muted">Students Enrolled</small>
            </div>
        </div>
    `).join('');

    container.innerHTML = cardsHTML;
}

// Quick search functionality
function handleQuickSearchInput() {
    const input = document.getElementById('quickSearch');
    if (!input) return;
    
    const query = input.value.trim().toLowerCase();
    
    if (query.length < 2) {
        hideSuggestions('quickSearch');
        return;
    }

    showSearchSuggestions(query, input);
}

// Global search functionality
function handleGlobalSearchInput() {
    const input = document.getElementById('globalSearch');
    if (!input) return;
    
    const query = input.value.trim().toLowerCase();
    
    if (query.length < 2) {
        hideSuggestions('globalSearch');
        return;
    }

    showSearchSuggestions(query, input);
}

// Show search suggestions
function showSearchSuggestions(query, inputElement) {
    if (!isDataLoaded) return;

    const suggestions = allStudents.filter(student => 
        student.student_name.toLowerCase().includes(query) ||
        student.registration_number.toLowerCase().includes(query)
    ).slice(0, 5);

    let suggestionsContainer = inputElement.parentElement.querySelector('.suggestions-list');
    
    if (!suggestionsContainer) {
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'suggestions-list';
        inputElement.parentElement.style.position = 'relative';
        inputElement.parentElement.appendChild(suggestionsContainer);
    }

    if (suggestions.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    const suggestionsHTML = suggestions.map(student => `
        <div class="suggestion-item" onclick="selectSuggestion('${student.registration_number}', '${inputElement.id}')">
            <strong>${student.student_name}</strong><br>
            <small class="text-muted">${student.registration_number} - ${student.clean_program}</small>
        </div>
    `).join('');

    suggestionsContainer.innerHTML = suggestionsHTML;
    suggestionsContainer.style.display = 'block';
}

// Select suggestion
function selectSuggestion(registrationNumber, inputId) {
    const input = document.getElementById(inputId);
    const student = allStudents.find(s => s.registration_number === registrationNumber);
    
    if (student && input) {
        input.value = student.student_name;
        hideSuggestions(inputId);
        
        // Automatically show student details when selected from suggestions
        showStudentDetails(registrationNumber);
    }
}

// Hide suggestions
function hideSuggestions(inputId = null) {
    if (inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            const suggestionsContainer = input.parentElement.querySelector('.suggestions-list');
            if (suggestionsContainer) {
                suggestionsContainer.style.display = 'none';
            }
        }
    } else {
        const suggestionLists = document.querySelectorAll('.suggestions-list');
        suggestionLists.forEach(list => {
            if (list) {
                list.style.display = 'none';
            }
        });
    }
}

// Perform quick search
function performQuickSearch() {
    const quickSearchInput = document.getElementById('quickSearch');
    if (!quickSearchInput) return;
    
    const query = quickSearchInput.value.trim();
    if (!query) {
        alert('Please enter a search term.');
        return;
    }

    console.log('Performing quick search for:', query);
    const results = searchStudents(query);
    
    if (results.length === 1) {
        showStudentDetails(results[0].registration_number);
    } else if (results.length > 1) {
        // Switch to search section and show results
        showSection('search');
        const globalSearchInput = document.getElementById('globalSearch');
        if (globalSearchInput) {
            globalSearchInput.value = query;
        }
        setTimeout(() => {
            displaySearchResults(results);
        }, 300);
    } else {
        alert('No students found matching your search.');
    }
}

// Perform global search
function performGlobalSearch() {
    const globalSearchInput = document.getElementById('globalSearch');
    if (!globalSearchInput) return;
    
    const query = globalSearchInput.value.trim();
    if (!query) {
        alert('Please enter a search term.');
        return;
    }

    console.log('Performing global search for:', query);
    const results = searchStudents(query);
    displaySearchResults(results);
}

// Search students function
function searchStudents(query) {
    if (!isDataLoaded || !allStudents.length) return [];

    const lowerQuery = query.toLowerCase();
    
    return allStudents.filter(student => 
        student.student_name.toLowerCase().includes(lowerQuery) ||
        student.registration_number.toLowerCase().includes(lowerQuery) ||
        student.father_name.toLowerCase().includes(lowerQuery) ||
        student.mother_name.toLowerCase().includes(lowerQuery) ||
        student.clean_program.toLowerCase().includes(lowerQuery)
    );
}

// Display search results
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;

    resultsContainer.style.display = 'block';

    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="alert alert-warning text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                No students found matching your search criteria.
                <div class="mt-2">
                    <small>Try searching with student names like "SAKIB", "MEHVISH" or registration numbers like "533300016064"</small>
                </div>
            </div>
        `;
        return;
    }

    const resultsHTML = `
        <div class="search-results-header mb-4">
            <h4><i class="fas fa-search-plus me-2"></i>Search Results (${results.length} found)</h4>
        </div>
        <div class="row">
            ${results.map(student => `
                <div class="col-lg-6 mb-4">
                    <div class="student-result-card">
                        <div class="student-result-header">
                            <div class="student-result-name">${student.student_name}</div>
                            <div class="student-result-reg">${student.registration_number}</div>
                        </div>
                        <div class="student-basic-info">
                            <p><strong>Program:</strong> ${student.clean_program}</p>
                            <p><strong>Father's Name:</strong> ${student.father_name}</p>
                            <p><strong>Mother's Name:</strong> ${student.mother_name}</p>
                            <p><strong>Minor:</strong> ${student.minor || 'N/A'}</p>
                        </div>
                        <div class="mt-3">
                            <button class="btn btn-primary btn-sm me-2" onclick="showStudentDetails('${student.registration_number}')">
                                <i class="fas fa-eye me-1"></i>View Full Details
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" onclick="showProgram('${student.clean_program}')">
                                <i class="fas fa-users me-1"></i>View Program
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    resultsContainer.innerHTML = resultsHTML;
}

// Show student details in modal
function showStudentDetails(registrationNumber) {
    console.log('Showing student details for:', registrationNumber);
    
    const student = allStudents.find(s => s.registration_number === registrationNumber);
    
    if (!student) {
        alert('Student not found.');
        return;
    }

    const modalTitle = document.getElementById('studentModalTitle');
    const modalBody = document.getElementById('studentModalBody');
    
    if (modalTitle) {
        modalTitle.textContent = `${student.student_name} - Complete Details`;
    }

    if (modalBody) {
        const detailsHTML = `
            <div class="student-details">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <h5 class="text-primary">Personal Information</h5>
                        <table class="table table-sm">
                            <tr><td><strong>Serial No:</strong></td><td>${student.sno}</td></tr>
                            <tr><td><strong>Name:</strong></td><td>${student.student_name}</td></tr>
                            <tr><td><strong>Registration No:</strong></td><td class="reg-number">${student.registration_number}</td></tr>
                            <tr><td><strong>Father's Name:</strong></td><td>${student.father_name}</td></tr>
                            <tr><td><strong>Mother's Name:</strong></td><td>${student.mother_name}</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h5 class="text-primary">Academic Program</h5>
                        <table class="table table-sm">
                            <tr><td><strong>Program:</strong></td><td>${student.clean_program}</td></tr>
                            <tr><td><strong>Minor Subject:</strong></td><td>${student.minor || 'N/A'}</td></tr>
                        </table>
                        <div class="mt-3">
                            <small class="text-muted">${student.program_name}</small>
                        </div>
                    </div>
                </div>
                
                <h5 class="text-primary mt-4 mb-3">Course Details</h5>
                <div class="course-details">
                    <div class="course-item">
                        <div class="course-label">Multidisciplinary Semester 1</div>
                        <div class="course-value">${student.multi_sem1 || 'N/A'}</div>
                    </div>
                    <div class="course-item">
                        <div class="course-label">Multidisciplinary Semester 2</div>
                        <div class="course-value">${student.multi_sem2 || 'N/A'}</div>
                    </div>
                    <div class="course-item">
                        <div class="course-label">Skill Enhancement Course</div>
                        <div class="course-value">${student.skill_enhancement || 'N/A'}</div>
                    </div>
                    <div class="course-item">
                        <div class="course-label">Value Added Course 1</div>
                        <div class="course-value">${student.value_added1 || 'N/A'}</div>
                    </div>
                    <div class="course-item">
                        <div class="course-label">Value Added Course 2</div>
                        <div class="course-value">${student.value_added2 || 'N/A'}</div>
                    </div>
                    <div class="course-item">
                        <div class="course-label">Ability Enhancement Course 1</div>
                        <div class="course-value">${student.ability_enhancement1 || 'N/A'}</div>
                    </div>
                    <div class="course-item">
                        <div class="course-label">Ability Enhancement Course 2</div>
                        <div class="course-value">${student.ability_enhancement2 || 'N/A'}</div>
                    </div>
                </div>
                
                <div class="alert alert-info mt-4">
                    <small><i class="fas fa-info-circle me-1"></i> This information is from the official admission records for Academic Year 2025-26.</small>
                </div>
            </div>
        `;
        
        modalBody.innerHTML = detailsHTML;
    }

    // Show the modal
    try {
        const modalElement = document.getElementById('studentModal');
        if (modalElement && window.bootstrap) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        } else {
            console.error('Bootstrap modal not available');
            // Fallback: show details in alert if modal fails
            alert(`Student Details:\n\nName: ${student.student_name}\nRegistration: ${student.registration_number}\nProgram: ${student.clean_program}\nFather: ${student.father_name}\nMother: ${student.mother_name}`);
        }
    } catch (error) {
        console.error('Error showing modal:', error);
        // Fallback: show details in alert if modal fails
        alert(`Student Details:\n\nName: ${student.student_name}\nRegistration: ${student.registration_number}\nProgram: ${student.clean_program}\nFather: ${student.father_name}\nMother: ${student.mother_name}`);
    }
}

// Handle program search
function handleProgramSearch() {
    const programSearchInput = document.getElementById('programSearch');
    if (!programSearchInput) return;
    
    const query = programSearchInput.value.trim().toLowerCase();
    const table = document.getElementById('studentsTable');
    
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const studentName = row.querySelector('.student-name')?.textContent.toLowerCase() || '';
        const regNumber = row.querySelector('.reg-number')?.textContent.toLowerCase() || '';
        
        if (studentName.includes(query) || regNumber.includes(query)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Handle sort change
function handleSortChange() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect || !currentProgram) return;
    
    displayProgramStudents(currentProgram);
}

// Animate statistics numbers
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current);
        }, 16);
    });
}

// Show error message
function showErrorMessage(message) {
    const alertHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Find a suitable container to show the alert
    const container = document.querySelector('.container');
    if (container) {
        container.insertAdjacentHTML('afterbegin', alertHTML);
    }
}

// Setup search functionality (called after data is loaded)
function setupSearchFunctionality() {
    // Enable search inputs
    const searchInputs = ['quickSearch', 'globalSearch'];
    
    searchInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.disabled = false;
            input.placeholder = 'Enter student name or registration number';
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        const searchInputs = document.querySelectorAll('#quickSearch, #globalSearch');
        let clickedOnSearch = false;
        
        searchInputs.forEach(input => {
            if (input.parentElement.contains(e.target)) {
                clickedOnSearch = true;
            }
        });
        
        if (!clickedOnSearch) {
            hideSuggestions();
        }
    });
}

// Export functions for global access
window.showSection = showSection;
window.showProgram = showProgram;
window.showStudentDetails = showStudentDetails;
window.performQuickSearch = performQuickSearch;
window.performGlobalSearch = performGlobalSearch;
window.selectSuggestion = selectSuggestion;