
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'

import useFetchPhotos from './useFetchPhotos'

const STORAGE_KEY = 'celebrare-gallery-favourites'

function getSavedFavourites() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) : []

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function favouritesReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_FAVOURITE':
      return state.includes(action.payload)
        ? state.filter((id) => id !== action.payload)
        : [...state, action.payload]

    default:
      return state
  }
}

function HeartIcon({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Gallery() {
  const { photos, loading, error } = useFetchPhotos()

  const [search, setSearch] = useState('')

  const [favourites, dispatch] = useReducer(
    favouritesReducer,
    undefined,
    getSavedFavourites
  )

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(favourites)
      )
    } catch (err) {
      console.error('Unable to save favourites:', err)
    }
  }, [favourites])

  const handleSearch = useCallback((event) => {
    setSearch(event.target.value)
  }, [])

  const filteredPhotos = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    if (!keyword) return photos

    return photos.filter((photo) =>
      photo.author.toLowerCase().includes(keyword)
    )
  }, [photos, search])

  function toggleFavourite(photoId) {
    dispatch({
      type: 'TOGGLE_FAVOURITE',
      payload: photoId,
    })
  }

  return (
    <main className="min-h-screen bg-gray-100">

      <header className="bg-violet-700 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="uppercase tracking-widest text-sm text-violet-200">
            CELEBRARE
          </p>

          <h1 className="text-4xl font-bold mt-3">
            Photo Gallery
          </h1>

          <p className="mt-3 text-violet-100">
            Explore beautiful photos and save your favourites.
          </p>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-5 py-10">

        <label
          htmlFor="search"
          className="block font-semibold mb-2"
        >
          Search photos by author
        </label>

        <input
          id="search"
          type="search"
          placeholder="Enter author's name..."
          value={search}
          onChange={handleSearch}
          className="w-full sm:max-w-lg p-3 rounded-xl border border-gray-300 bg-white outline-none focus:ring-2 focus:ring-violet-400"
        />

        <div className="flex justify-between items-center mt-8 mb-6">
          <h2 className="text-2xl font-bold">
            All Photos
          </h2>

          <span className="text-gray-500 text-sm">
            {loading ? 'Loading...' : `${filteredPhotos.length} photos`}
          </span>
        </div>

        {loading && (
          <div className="text-center py-20" role="status">
            <div className="w-12 h-12 rounded-full border-4 border-violet-200 border-t-violet-700 animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading photos...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-100 text-red-700 p-5 rounded-xl">
            Unable to load photos: {error}
          </div>
        )}

        {!loading && !error && filteredPhotos.length === 0 && (
          <p className="text-center py-16 text-gray-500">
            No photos found. Try another author name.
          </p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {filteredPhotos.map((photo) => {
              const isFavourite = favourites.includes(photo.id)

              return (
                <article
                  key={photo.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
                >

                  <img
                    src={photo.download_url}
                    alt={`Photo by ${photo.author}`}
                    loading="lazy"
                    className="w-full h-56 object-cover"
                  />

                  <div className="flex justify-between items-center p-4">

                    <div className="min-w-0">
                      <p className="text-xs text-gray-400">
                        PHOTOGRAPHER
                      </p>

                      <h3 className="font-semibold mt-1 truncate">
                        {photo.author}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleFavourite(photo.id)}
                      aria-label={isFavourite ? 'Remove favourite' : 'Add favourite'}
                      aria-pressed={isFavourite}
                      className={`p-2 rounded-full ${
                        isFavourite
                          ? 'text-red-500 bg-red-50'
                          : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <HeartIcon filled={isFavourite} />
                    </button>

                  </div>
                </article>
              )
            })}

          </div>
        )}

        <div className="border-t mt-12 pt-8">
          <h2 className="text-2xl font-bold">
            My Favourites
          </h2>

          <p className="text-gray-500 mt-2">
            {favourites.length} saved photos
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            {favourites.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No favourites yet. Click a heart to save photos.
              </p>
            ) : (
              favourites.map((id) => {
                const photo = photos.find((item) => item.id === id)

                return photo ? (
                  <span
                    key={id}
                    className="bg-violet-100 text-violet-800 px-4 py-2 rounded-full text-sm"
                  >
                    {photo.author}
                  </span>
                ) : null
              })
            )}
          </div>
        </div>

      </section>
    </main>
  )
}

export default function App() {
  return <Gallery />
}
