
document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('contentArea');
    const searchInput = document.getElementById('searchInput');
    const totalContactsEl = document.getElementById('totalContacts');
    const totalOrgsEl = document.getElementById('totalOrgs');

    // Broker Mapping derived from user request
    const BROKER_MAPPING = {
        "American Homes Real Estate Inm": { name: "Ariel Bohorquez", email: "americanhomesusa@gmail.com" },
        "Baybeach Realty": { name: "Patrick Reinert", email: "patrickreinert@msn.com" },
        // "Berkshire Hathaway FL Realty": { name: "", email: "" }, // Provided empty in prompt
        "Broker Brothers LLC": { name: "Kathryn Zangrilli", email: "kz@brokerbrothersre.com" },
        "Builders Land Associates": { name: "Rachel Rodriguez", email: "builderslandassociates@gmail.com" },
        "CoastalHaus Realty Inc": { name: "Stefan Bolsen", email: "info@bolsenteam.com" },
        "Coldwell Banker Realty": { name: "Bradford Bateman", email: "bradford.bateman@cbrealty.com" },
        "Compass Florida, LLC": { name: "Adam Vellano", email: "adam.vellano@compass.com" },
        "Crimaldi and Associates, LLC": { name: "Dawn Allen", email: "dawn.allen@buyfla.com" },
        "Decatur Real Estate Group": { name: "Michelle Decatur", email: "michelle@decaturrealestategroup.com" },
        "Dina Marie Realty LLC": { name: "Dina Marie Skaff", email: "dina@dinamarierealty.com" },
        "DomainRealty.com LLC": { name: "Hansen Parker", email: "broker@domainrealty.com" },
        "Downing-Frye Realty Inc": { name: "Michael Hughes", email: "mhughes@dfryerealty.com" },
        "Elite Realty of SWFL": { name: "Judith Gietzen", email: "judigietzen@gmail.com" },
        "EXP Realty LLC": { name: "Hanan Shahin", email: "a.shahin.broker@exprealty.net" },
        "Grandeur Realty Co": { name: "Carla Huyler", email: "carlasellsswfl@icloud.com" },
        "Group 3 Realty": { name: "Marcela Cifuentes", email: "marcela@thegroup3.com" },
        "HomeSmart": { name: "Derek Varnadoe", email: "dvarnadoe@hsmove.com" },
        "Hunters Ridge Realty Co.": { name: "Marsha Lynn", email: "marsha@huntersridge.net" },
        "Jason Mitchell Real Estate Flo": { name: "Yumiko Ray", email: "yumiko.ray@gmail.com" },
        "John R. Wood Properties": { name: "David Jeronimus", email: "davej@johnrwood.com" },
        "Keller Williams Elevate Luxury": { name: "Christina Ruud", email: "christina@christinaruud.com" },
        "Keller Williams Elite Realty": { name: "Joseph Kendall", email: "brokerjoe@me.com" },
        "Kevin Shelly Realty Inc.": { name: "Kevin Shelly", email: "kevin@kevinshellyrealty.com" },
        "Knowledge Base Real Estate": { name: "Kevin Bartlett", email: "office@knowledgebasefl.com" },
        "Local Real Estate LLC": { name: "Angela Parker", email: "angie@livelocalre.com" },
        "LPT Realty, LLC": { name: "Natalie Cox", email: "flbrokers@lptrealty.com" },
        "Miromar Realty LLC": { name: "Robert Ekdahl", email: "rekdahl@miromar.com" },
        "Neal Communities Realty, Inc.": { name: "Lisa Sarraf", email: "lsarraf@nealcommunities.com" },
        "Orchid Properties": { name: "Jennifer Springer-Rinden", email: "jennifer@orchidrealtygroup.com" },
        "Orchid Realty International": { name: "Mary Kate Collins", email: "marykate@orchidrealtygroup.com" },
        "Potter Trinity": { name: "Daniel O'Berski", email: "dan.oberski@trinitycre.com" },
        "Premier Commercial Inc": { name: "Andrew DeSalvo", email: "andrewd@premiermail.net" },
        "Premier Sotheby's Int'l Realty": { name: "Erin McDonald", email: "erin.mcdonald@premiersir.com" },
        "Premiere Plus Realty Company": { name: "Nicholas Jankowski", email: "Broker@PPRMail.com" },
        "Pulte Realty Inc": { name: "Jeremy Needelman", email: "jeremy.needelman@pulte.com" },
        "RE/MAX GOLD": { name: "RICHARD MCKINNEY", email: "richard.mckinney@remax.net" },
        "RE/MAX Realty Group": { name: "Maurice Dailey Jr", email: "maury@mdailey.com" },
        "Realty One Group MVP": { name: "Mark Ldbetter", email: "mark.w.ledbetter@gmail.com" },
        "Realty World J. PAVICH R.E.": { name: "Joseph Pavich Sr", email: "joe@jpavich.com" },
        "Royal Shell Real Estate, Inc.": { name: "Cici Arango", email: "cici@royalshellsales.com" },
        "Sun Village Realty LLC": { name: "Thomas Runyon", email: "runyon17@gmail.com" },
        "William Raveis Real Estate": { name: "Matthew Lane", email: "matt.lane@raveis.com" }
    };

    let allContacts = [];

    // Load Checkbox State from LocalStorage
    const checkedState = JSON.parse(localStorage.getItem('ber_contacts_checked') || '{}');

    // Fetch Data
    fetch('contacts.json')
        .then(response => response.json())
        .then(data => {
            allContacts = data;
            renderData(allContacts);
        })
        .catch(error => {
            console.error('Error loading contacts:', error);
            contentArea.innerHTML = `<div style="text-align:center; color: #ef4444; padding: 2rem;">
                                        <i class="fa-solid fa-triangle-exclamation fa-2x"></i>
                                        <p>Failed to load contact data. Please check if 'contacts.json' exists.</p>
                                     </div>`;
        });

    // Search Handler
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allContacts.filter(contact =>
            (contact.FirstName && contact.FirstName.toLowerCase().includes(term)) ||
            (contact.LastName && contact.LastName.toLowerCase().includes(term)) ||
            (contact.Organization && contact.Organization.toLowerCase().includes(term)) ||
            (contact.Email && contact.Email.toLowerCase().includes(term))
        );
        renderData(filtered);
    });

    function renderData(contacts) {
        contentArea.innerHTML = '';
        totalContactsEl.textContent = contacts.length;

        if (contacts.length === 0) {
            contentArea.innerHTML = `<div style="text-align:center; padding: 4rem; color: var(--text-muted);">
                                        <p>No contacts found matching your search.</p>
                                     </div>`;
            totalOrgsEl.textContent = 0;
            return;
        }

        const groups = {};
        contacts.forEach(contact => {
            const org = contact.Organization ? contact.Organization.trim() : "Other";
            if (!groups[org]) {
                groups[org] = [];
            }
            groups[org].push(contact);
        });

        const sortedOrgs = Object.keys(groups).sort((a, b) => a.localeCompare(b));
        totalOrgsEl.textContent = sortedOrgs.length;

        sortedOrgs.forEach(orgName => {
            const orgContacts = groups[orgName];
            orgContacts.sort((a, b) => (a.LastName || '').localeCompare(b.LastName || ''));

            const groupSection = document.createElement('div');
            groupSection.className = 'org-group';

            // Broker Info logic
            let brokerInfoHtml = '';
            // Only try to find logic if we have a match
            // We use simple substring matching or direct lookup. Direct lookup is safer.
            // Some org names in spreadsheet might differ slightly, let's normalize if needed.
            // For now, exact match from my list above.
            const broker = BROKER_MAPPING[orgName];
            if (broker) {
                brokerInfoHtml = `
                    <div class="broker-info">
                        <i class="fa-solid fa-user-tie"></i> 
                        <span class="broker-label">Broker:</span> 
                        <span class="broker-name">${broker.name}</span>
                        ${broker.email ? `<a href="mailto:${broker.email}" class="broker-email"><i class="fa-regular fa-envelope"></i> ${broker.email}</a>` : ''}
                    </div>
                `;
            }

            const groupHeader = `
                <div class="org-header">
                    <div class="org-title-row">
                        <h2 class="org-title">${orgName}</h2>
                        <span class="org-count">${orgContacts.length}</span>
                    </div>
                    ${brokerInfoHtml}
                </div>
            `;

            const cardsGrid = document.createElement('div');
            cardsGrid.className = 'contacts-grid';

            orgContacts.forEach(contact => {
                const card = createContactCard(contact);
                cardsGrid.appendChild(card);
            });

            groupSection.innerHTML = groupHeader;
            groupSection.appendChild(cardsGrid);
            contentArea.appendChild(groupSection);
        });
    }

    function createContactCard(contact) {
        const div = document.createElement('div');
        div.className = 'contact-card';

        const initials = getInitials(contact.FirstName, contact.LastName);
        const name = `${contact.FirstName || ''} ${contact.LastName || ''}`.trim() || 'Unknown Name';
        const role = contact.Role || 'Member';
        const email = contact.Email || '';
        const phone = contact.PriPhone || contact.MobilePhone || '';
        const cityState = [contact.City, contact.State].filter(Boolean).join(', ');

        // Checkbox ID - composite key: Organization + Email or Name to ensure uniqueness
        const uniqueKey = `${contact.Organization || 'Other'}_${email || name}`;
        const isChecked = checkedState[uniqueKey] ? 'checked' : '';

        // Add class if checked for styling
        if (isChecked) div.classList.add('is-checked');

        let detailsHtml = '';
        if (email && email.toLowerCase() !== 'do not email') {
            detailsHtml += `
                <div class="detail-row">
                    <i class="fa-regular fa-envelope"></i>
                    <a href="mailto:${email}" title="${email}">${truncate(email, 25)}</a>
                </div>`;
        }
        if (phone) {
            detailsHtml += `
                <div class="detail-row">
                    <i class="fa-solid fa-phone"></i>
                    <a href="tel:${phone}">${phone}</a>
                </div>`;
        }
        if (cityState) {
            detailsHtml += `
                <div class="detail-row">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>${cityState}</span>
                </div>`;
        }

        div.innerHTML = `
            <div class="card-top-bar">
                 <label class="custom-checkbox">
                    <input type="checkbox" data-key="${uniqueKey}" ${isChecked}>
                    <span class="checkmark"></span>
                    <span class="checkbox-label">Signed Up</span>
                </label>
            </div>
            <div class="contact-header">
                <div class="avatar-placeholder">${initials}</div>
                <div class="contact-info">
                    <h3 class="contact-name">${name}</h3>
                    <div class="contact-role">${role}</div>
                </div>
            </div>
            <div class="contact-details">
                ${detailsHtml}
            </div>
        `;

        // Event listener for checkbox
        const checkbox = div.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                checkedState[uniqueKey] = true;
                div.classList.add('is-checked');
            } else {
                delete checkedState[uniqueKey];
                div.classList.remove('is-checked');
            }
            localStorage.setItem('ber_contacts_checked', JSON.stringify(checkedState));
        });

        return div;
    }

    function getInitials(first, last) {
        let f = first ? first[0] : '';
        let l = last ? last[0] : '';
        return (f + l).toUpperCase() || '?';
    }

    function truncate(str, n) {
        return (str.length > n) ? str.substr(0, n - 1) + '&hellip;' : str;
    }
});
