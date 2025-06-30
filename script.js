async function populateDropdowns() {
       const horseSelector = document.getElementById('horseSelector');
       const sexFilter = document.getElementById('sexFilter');
       const breedFilter = document.getElementById('breedFilter');
       const colorFilter = document.getElementById('colorFilter');
       
       const horses = await fetch('/api/horses').then(res => res.json());
       
       if (horseSelector) {
         horses.forEach(horse => {
           const option = document.createElement('option');
           option.value = horse._id;
           option.textContent = (horse.prefix ? horse.prefix + ' ' : '') + horse.name;
           horseSelector.appendChild(option);
         });
       }
       
       if (sexFilter) {
         const sexes = [...new Set(horses.map(horse => horse.sex).filter(s => s))];
         sexes.forEach(sex => {
           const option = document.createElement('option');
           option.value = sex;
           option.textContent = sex;
           sexFilter.appendChild(option);
         });
       }
       if (breedFilter) {
         const breeds = [...new Set(horses.map(horse => horse.breed).filter(b => b))];
         breeds.forEach(breed => {
           const option = document.createElement('option');
           option.value = breed;
           option.textContent = breed;
           breedFilter.appendChild(option);
         });
       }
       if (colorFilter) {
         const colors = [...new Set(horses.map(horse => horse.color).filter(c => c))];
         colors.forEach(color => {
           const option = document.createElement('option');
           option.value = color;
           option.textContent = color;
           colorFilter.appendChild(option);
         });
       }
       
       if (document.getElementById('roster')) {
         applyFilters();
       }
     }
     
     async function displayHorse() {
       const horseSelector = document.getElementById('horseSelector');
       const profile = document.getElementById('profile');
       const selectedId = horseSelector.value;
       
       if (!selectedId) {
         profile.classList.add('hidden');
         return;
       }
       
       const horse = await fetch(`/api/horses/${selectedId}`).then(res => res.json());
       if (horse) {
         document.getElementById('horseImage').src = horse.image || 'https://via.placeholder.com/300x200';
         document.getElementById('horseName').textContent = (horse.prefix ? horse.prefix + ' ' : '') + horse.name;
         document.getElementById('horseSex').textContent = horse.sex || 'Not specified';
         document.getElementById('horseBreed').textContent = horse.breed || 'Not specified';
         document.getElementById('horseColor').textContent = horse.color || 'Not specified';
         document.getElementById('horseNotes').textContent = horse.notes || 'Not specified';
         document.getElementById('horseSire').textContent = horse.sire || 'Unknown';
         document.getElementById('horseSire').onclick = horse.sire ? () => selectRelative(horse.sire) : null;
         document.getElementById('horseDam').textContent = horse.dam || 'Unknown';
         document.getElementById('horseDam').onclick = horse.dam ? () => selectRelative(horse.dam) : null;
         document.getElementById('horseStoryline').textContent = horse.storyline || 'Not specified';
         document.getElementById('horseLifetimeEarnings').textContent = horse.lifetimeEarnings || 'Not specified';
         document.getElementById('horseShowPlacings').textContent = horse.showPlacings || 'Not specified';
         document.getElementById('horseGenotype').textContent = horse.genotype || 'Not specified';
         profile.classList.remove('hidden');
       }
     }
     
     async function selectRelative(name) {
       const horses = await fetch(`/api/horses/relatives/${name}`).then(res => res.json());
       const horse = horses.find(h => h.name === name);
       if (horse) {
         document.getElementById('horseSelector').value = horse._id;
         displayHorse();
       }
     }
     
     async function applyFilters() {
       const sexFilter = document.getElementById('sexFilter')?.value;
       const breedFilter = document.getElementById('breedFilter')?.value;
       const colorFilter = document.getElementById('colorFilter')?.value;
       const roster = document.getElementById('roster');
       
       const query = new URLSearchParams();
       if (sexFilter) query.append('sex', sexFilter);
       if (breedFilter) query.append('breed', breedFilter);
       if (colorFilter) query.append('color', colorFilter);
       
       const horses = await fetch(`/api/horses/filter?${query.toString()}`).then(res => res.json());
       
       roster.innerHTML = '';
       horses.forEach(horse => {
         const card = document.createElement('div');
         card.className = 'bg-white p-4 rounded shadow text-center';
         card.innerHTML = `
           <a href="profile.html?id=${horse._id}">
             <img src="${horse.image || 'https://via.placeholder.com/300x200'}" alt="${horse.name}" class="w-[300px] h-[200px] object-cover mx-auto mb-2">
             <h3 class="text-lg font-semibold">${horse.prefix ? horse.prefix + ' ' : ''}${horse.name}</h3>
           </a>
         `;
         roster.appendChild(card);
       });
     }
     
     window.onload = async function() {
       await populateDropdowns();
       const urlParams = new URLSearchParams(window.location.search);
       const horseId = urlParams.get('id');
       if (horseId && document.getElementById('horseSelector')) {
         document.getElementById('horseSelector').value = horseId;
         await displayHorse();
       }
     };