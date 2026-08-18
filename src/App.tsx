import { AnimatePresence } from 'framer-motion'
import { HashRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { TabBar } from './components/layout/TabBar'
import { HomeScreen } from './routes/HomeScreen'
import { PlayHomeScreen } from './routes/PlayHomeScreen'
import { ProfileScreen } from './routes/ProfileScreen'
import { GameSetupScreen } from './routes/GameSetupScreen'
import { BoardScreen } from './routes/BoardScreen'
import { VictoryScreen } from './routes/VictoryScreen'
import { GeoModeMenuScreen } from './routes/GeoModeMenuScreen'
import { GeoQuizScreen } from './routes/GeoQuizScreen'
import { GeoResultsScreen } from './routes/GeoResultsScreen'
import { LeaderboardScreen } from './routes/LeaderboardScreen'
import { QuizSetupScreen } from './routes/QuizSetupScreen'
import { QuizSessionScreen } from './routes/QuizSessionScreen'
import { QuizResultsScreen } from './routes/QuizResultsScreen'

/** Écrans racines des 4 onglets : la barre d'onglets reste visible. */
function TabBarLayout() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
      <TabBar />
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route element={<TabBarLayout />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/jouer" element={<PlayHomeScreen />} />
          <Route path="/geographie" element={<GeoModeMenuScreen />} />
          <Route path="/quiz" element={<QuizSetupScreen />} />
          <Route path="/profil" element={<ProfileScreen />} />
        </Route>
        <Route path="/nouvelle-partie" element={<GameSetupScreen />} />
        <Route path="/plateau" element={<BoardScreen />} />
        <Route path="/victoire" element={<VictoryScreen />} />
        <Route path="/geographie/quiz" element={<GeoQuizScreen />} />
        <Route path="/geographie/resultats" element={<GeoResultsScreen />} />
        <Route path="/quiz/session" element={<QuizSessionScreen />} />
        <Route path="/quiz/resultats" element={<QuizResultsScreen />} />
        <Route path="/classement" element={<LeaderboardScreen />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <HashRouter>
      <AppShell>
        <AnimatedRoutes />
      </AppShell>
    </HashRouter>
  )
}

export default App
