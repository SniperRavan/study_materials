// Sample studyMaterials data (simplified for demo)
let studyMaterials = {
    1: {
        mechanical: {
            'Engineering Mathematics': [
                { type: 'pdf', title: 'Calculus Fundamentals', url: '#', views: 245, description: 'Complete guide to differential and integral calculus' },
                { type: 'youtube', title: 'Linear Algebra Basics', url: 'https://youtube.com/watch?v=example1', views: 189, description: 'Video series on matrices and vectors' }
            ],
            'Engineering Physics': [
                { type: 'pdf', title: 'Quantum Mechanics Notes', url: '#', views: 167, description: 'Introduction to quantum theory and applications' }
            ]
        },
        civil: {
            'Building Materials': [
                { type: 'pdf', title: 'Concrete Technology', url: '#', views: 189, description: 'Properties and applications of concrete' }
            ]
        }
    },
    2: {
        mechanical: {
            'Thermodynamics': [
                { type: 'pdf', title: 'Heat Transfer Fundamentals', url: '#', views: 312, description: 'Conduction, convection, and radiation principles' }
            ]
        }
    },
    3: {
        cse: {
            'Software Engineering': [
                { type: 'pdf', title: 'Software Development Life Cycle', url: '#', views: 367, description: 'SDLC models and methodologies' }
            ]
        }
    }
};

let currentYear = 1;

function toggleAdmin() {
    const panel = document.getElementById('adminPanel');
    panel.classList.toggle('show');
}

function showYear(year) {
    currentYear = year;
    // Update active tab
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', parseInt(tab.dataset.year) === year);
    });
    renderStreams();
}

function renderStreams() {
    const container = document.getElementById('streamsContainer');
    container.innerHTML = '';

    const yearData = studyMaterials[currentYear];
    if (!yearData) {
        container.innerHTML = '<p>No data available for this year.</p>';
        return;
    }

    for (const stream in yearData) {
        const streamCard = document.createElement('div');
        streamCard.className = 'stream-card';

        const streamTitle = document.createElement('h3');
        streamTitle.textContent = stream.charAt(0).toUpperCase() + stream.slice(1) + ' Engineering';
        streamCard.appendChild(streamTitle);

        const subjectsGrid = document.createElement('div');
        subjectsGrid.className = 'subjects-grid';

        const subjects = yearData[stream];
        for (const subject in subjects) {
            const subjectCard = document.createElement('div');
            subjectCard.className = 'subject-card';

            const subjectName = document.createElement('div');
            subjectName.className = 'subject-name';
            subjectName.textContent = subject;
            subjectCard.appendChild(subjectName);

            const resourcesDiv = document.createElement('div');
            resourcesDiv.className = 'resources';

            subjects[subject].forEach(resource => {
                const resourceItem = document.createElement('a');
                resourceItem.className = 'resource-item';
                resourceItem.href = resource.url;
                resourceItem.target = '_blank';
                resourceItem.textContent = `${resource.title} (${resource.type.toUpperCase()})`;
                resourcesDiv.appendChild(resourceItem);
            });

            subjectCard.appendChild(resourcesDiv);
            subjectsGrid.appendChild(subjectCard);
        }

        streamCard.appendChild(subjectsGrid);
        container.appendChild(streamCard);
    }
}

function performSearch() {
    const query = document.getElementById('searchBox').value.toLowerCase();
    const container = document.getElementById('streamsContainer');
    container.innerHTML = '';

    const yearData = studyMaterials[currentYear];
    if (!yearData) {
        container.innerHTML = '<p>No data available for this year.</p>';
        return;
    }

    for (const stream in yearData) {
        const streamCard = document.createElement('div');
        streamCard.className = 'stream-card';

        const streamTitle = document.createElement('h3');
        streamTitle.textContent = stream.charAt(0).toUpperCase() + stream.slice(1) + ' Engineering';
        streamCard.appendChild(streamTitle);

        const subjectsGrid = document.createElement('div');
        subjectsGrid.className = 'subjects-grid';

        const subjects = yearData[stream];
        let streamHasMatch = false;

        for (const subject in subjects) {
            if (subject.toLowerCase().includes(query) || stream.toLowerCase().includes(query)) {
                const subjectCard = document.createElement('div');
                subjectCard.className = 'subject-card';

                const subjectName = document.createElement('div');
                subjectName.className = 'subject-name';
                subjectName.textContent = subject;
                subjectCard.appendChild(subjectName);

                const resourcesDiv = document.createElement('div');
                resourcesDiv.className = 'resources';

                subjects[subject].forEach(resource => {
                    if (resource.title.toLowerCase().includes(query) || resource.description.toLowerCase().includes(query)) {
                        const resourceItem = document.createElement('a');
                        resourceItem.className = 'resource-item';
                        resourceItem.href = resource.url;
                        resourceItem.target = '_blank';
                        resourceItem.textContent = `${resource.title} (${resource.type.toUpperCase()})`;
                        resourcesDiv.appendChild(resourceItem);
                    }
                });

                if (resourcesDiv.children.length > 0) {
                    subjectCard.appendChild(resourcesDiv);
                    subjectsGrid.appendChild(subjectCard);
                    streamHasMatch = true;
                }
            }
        }

        if (streamHasMatch) {
            streamCard.appendChild(subjectsGrid);
            container.appendChild(streamCard);
        }
    }
}

function toggleResourceFields() {
    const type = document.getElementById('adminResourceType').value;
    const fileGroup = document.getElementById('fileUploadGroup');
    const linkGroup = document.getElementById('linkGroup');

    if (type === 'pdf') {
        fileGroup.style.display = 'block';
        linkGroup.style.display = 'none';
    } else if (type === 'youtube' || type === 'website') {
        fileGroup.style.display = 'none';
        linkGroup.style.display = 'block';
    } else {
        fileGroup.style.display = 'none';
        linkGroup.style.display = 'none';
    }
}

function saveResource(event) {
    event.preventDefault();

    const year = document.getElementById('adminYear').value;
    const stream = document.getElementById('adminStream').value;
    const subject = document.getElementById('adminSubject').value.trim();
    const type = document.getElementById('adminResourceType').value;
    const title = document.getElementById('adminResourceTitle').value.trim();
    const description = document.getElementById('adminDescription').value.trim();

    let url = '#';
    if (type === 'pdf') {
        // For demo, no actual file upload handling
        url = '#';
    } else {
        url = document.getElementById('adminUrl').value.trim();
        if (!url) {
            alert('Please enter a valid URL for the resource.');
            return;
        }
    }

    if (!studyMaterials[year]) studyMaterials[year] = {};
    if (!studyMaterials[year][stream]) studyMaterials[year][stream] = {};
    if (!studyMaterials[year][stream][subject]) studyMaterials[year][stream][subject] = [];

    studyMaterials[year][stream][subject].push({
        type,
        title,
        url,
        views: 0,
        description
    });

    alert('Resource saved successfully!');
    toggleAdmin();
    showYear(parseInt(year));
    document.getElementById('adminForm').reset();
    toggleResourceFields();
}

// Attach event listeners after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    // Year tab buttons
    document.querySelectorAll('.nav-tab').forEach(button => {
        button.addEventListener('click', () => {
            const year = parseInt(button.dataset.year);
            showYear(year);
        });
    });

    // Admin panel toggle button
    document.querySelector('.admin-toggle').addEventListener('click', toggleAdmin);

    // Admin panel close button
    document.querySelector('.close-admin').addEventListener('click', toggleAdmin);

    // Search input
    document.getElementById('searchBox').addEventListener('input', performSearch);

    // Resource type selector in admin form
    document.getElementById('adminResourceType').addEventListener('change', toggleResourceFields);

    // Admin form submit
    document.getElementById('adminForm').addEventListener('submit', saveResource);

    // Initialize
    showYear(1);
    toggleResourceFields();
});
