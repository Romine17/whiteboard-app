import { useMemo, useState } from 'react'
import './App.css'

const ARTISTS = [
  { name: 'Playboi Carti', tags: ['rage', 'experimental', 'adlibs', 'opium', 'hype'] },
  { name: 'Destroy Lonely', tags: ['opium', 'melodic', 'dark', 'fashion', 'underground'] },
  { name: 'Ken Carson', tags: ['rage', 'opium', 'hype', 'distorted', 'underground'] },
  { name: 'Homixide Gang', tags: ['rage', 'opium', 'chaotic', 'hype', 'underground'] },
  { name: 'Yeat', tags: ['rage', 'distorted', 'experimental', 'hype', 'adlibs'] },
  { name: 'Lil Uzi Vert', tags: ['melodic', 'experimental', 'hype', 'adlibs', 'mainstream'] },
  { name: 'SoFaygo', tags: ['melodic', 'rage', 'uplifting', 'hype', 'underground'] },
  { name: 'Cochise', tags: ['bouncy', 'adlibs', 'hype', 'carti-adjacent', 'experimental'] },
  { name: 'Lancey Foux', tags: ['fashion', 'experimental', 'dark', 'hype', 'underground'] },
  { name: 'Trippie Redd', tags: ['melodic', 'rage', 'emotional', 'mainstream', 'experimental'] },
  { name: 'UnoTheActivist', tags: ['carti-adjacent', 'melodic', 'underground', 'adlibs', 'dark'] },
  { name: 'Lucki', tags: ['dark', 'melodic', 'laidback', 'underground', 'emotional'] },
  { name: 'Drake', tags: ['mainstream', 'melodic', 'versatile', 'polished', 'hitmaker'] },
  { name: 'Travis Scott', tags: ['hype', 'experimental', 'dark', 'mainstream', 'adlibs'] },
  { name: 'Future', tags: ['melodic', 'dark', 'mainstream', 'adlibs', 'trap'] },
  { name: 'Don Toliver', tags: ['melodic', 'atmospheric', 'mainstream', 'dark', 'smooth'] },
]

function scoreArtist(candidate, selected) {
  const selectedTagPool = new Set(selected.flatMap((a) => a.tags))
  const sharedTags = candidate.tags.filter((tag) => selectedTagPool.has(tag))
  const score = sharedTags.length
  return { score, sharedTags }
}

function App() {
  const [selectedNames, setSelectedNames] = useState([])

  const selectedArtists = useMemo(
    () => ARTISTS.filter((a) => selectedNames.includes(a.name)),
    [selectedNames],
  )

  const recommendations = useMemo(() => {
    if (selectedArtists.length < 3) return []

    return ARTISTS.filter((artist) => !selectedNames.includes(artist.name))
      .map((artist) => {
        const { score, sharedTags } = scoreArtist(artist, selectedArtists)
        return {
          ...artist,
          score,
          sharedTags,
          reason:
            sharedTags.length > 0
              ? `Similar because of: ${sharedTags.slice(0, 3).join(', ')}`
              : 'Wildcard pick for discovery',
        }
      })
      .filter((artist) => artist.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
  }, [selectedArtists, selectedNames])

  function toggleArtist(name) {
    setSelectedNames((prev) => {
      if (prev.includes(name)) return prev.filter((a) => a !== name)
      if (prev.length >= 3) return prev
      return [...prev, name]
    })
  }

  return (
    <div className="app">
      <h1>Artist Similarity Recommender</h1>
      <p>Select exactly 3 artists you like, then get ranked recommendations + why.</p>

      <section className="panel">
        <h2>Choose 3 artists</h2>
        <div className="chips">
          {ARTISTS.map((artist) => {
            const active = selectedNames.includes(artist.name)
            const disabled = !active && selectedNames.length >= 3
            return (
              <button
                key={artist.name}
                className={`chip ${active ? 'active' : ''}`}
                onClick={() => toggleArtist(artist.name)}
                disabled={disabled}
              >
                {artist.name}
              </button>
            )
          })}
        </div>
        <p className="helper">Selected: {selectedNames.length}/3</p>
      </section>

      <section className="panel">
        <h2>Recommendations</h2>
        {selectedNames.length < 3 ? (
          <p>Select 3 artists to generate recommendations.</p>
        ) : (
          <ul className="results">
            {recommendations.map((artist, idx) => (
              <li key={artist.name}>
                <div>
                  <strong>
                    #{idx + 1} {artist.name}
                  </strong>
                  <p>{artist.reason}</p>
                </div>
                <span className="score">Match {artist.score}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default App
