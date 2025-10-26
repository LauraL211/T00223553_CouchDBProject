const db = new PouchDB('movies_local');

const remoteCouch = 'http://Admin:mtu12345@localhost:5984/movies';

db.sync(remoteCouch, {
  live: true,
  retry: true
}).on('change', showMovies)
  .on('error', function (err) {
    console.error('Sync error:', err);
  });

const form = document.getElementById('movie-form');
const moviesDiv = document.getElementById('movies');

showMovies();

form.addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const overview = document.getElementById('overview').value.trim();
  const first_air_date = document.getElementById('first_air_date').value;
  const vote_average = parseFloat(document.getElementById('vote_average').value);

  if (!name) {
    alert('Name is required!');
    return;
  }

  const movie = {
    _id: new Date().toISOString(),
    name,
    overview,
    first_air_date: first_air_date || null,
    vote_average: isNaN(vote_average) ? 0 : vote_average
  };

  try {
    await db.put(movie);
    form.reset();
    showMovies();
  } catch (err) {
    console.error('Error adding movie:', err);
  }
});

async function showMovies() {
  try {
    const result = await db.allDocs({ include_docs: true, descending: true });
    moviesDiv.innerHTML = '';
    result.rows.forEach(row => {
      const doc = row.doc;
      const div = document.createElement('div');
      div.className = 'movie';
      div.innerHTML = `
        <strong>${doc.name}</strong><br>
        <em>${doc.overview || ''}</em><br>
        <small>First air date: ${doc.first_air_date || 'N/A'}</small><br>
        <small>Rating: ${doc.vote_average || 'N/A'}</small><br>
        <button onclick="editMovie('${doc._id}')">Edit</button>
        <button onclick="deleteMovie('${doc._id}', '${doc._rev}')">Delete</button>
      `;
      moviesDiv.appendChild(div);
    });
  } catch (err) {
    console.error('Error showing movies:', err);
  }
}

async function editMovie(id) {
  try {
    const doc = await db.get(id);
    const newName = prompt('Edit the show name:', doc.name);
    if (newName === null) return; 
    doc.name = newName;
    await db.put(doc);
    showMovies();
  } catch (err) {
    console.error('Error editing movie:', err);
  }
}

async function deleteMovie(id, rev) {
  try {
    await db.remove(id, rev);
    showMovies();
  } catch (err) {
    console.error('Error deleting movie:', err);
  }
}
