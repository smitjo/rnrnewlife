import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './routes/Home'
import { Browse } from './routes/Browse'
import { BookDetail } from './routes/BookDetail'
import { Library } from './routes/Library'
import { Settings } from './routes/Settings'
import { Reader } from './routes/Reader'
import { StoreProvider } from './store'

export function App() {
  return (
    <StoreProvider>
      {/*
        HashRouter keeps the build deployable to any static host (GitHub Pages,
        a WordPress subdirectory on rnrnewlife.com) with no rewrite rules.
      */}
      <HashRouter>
        <Routes>
          {/* The reader takes over the full screen, so it sits outside the shell. */}
          <Route path="/read/:slug" element={<Reader />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/book/:slug" element={<BookDetail />} />
            <Route path="/library" element={<Library />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  )
}
