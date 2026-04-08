import { Suspense, lazy } from "react"
import { HashRouter as Router, Routes, Route } from "react-router-dom"
import { MainLayout } from "./components/layout"
import { AssignmentProvider } from "./lib/assignment-store"
import { ScheduleProvider } from "./lib/schedule-store"
import { ProfileProvider } from "./lib/profile-store"
import { NotesProvider } from "./lib/notes-store"
import { CashflowProvider } from "./lib/cashflow-store"

const DashboardPage = lazy(() => import("./pages/dashboard"))
const AssignmentsPage = lazy(() => import("./pages/assignments"))
const SchedulePage = lazy(() => import("./pages/schedule"))
const SettingsPage = lazy(() => import("./pages/settings"))
const NotesPage = lazy(() => import("./pages/notes"))
const CashflowPage = lazy(() => import("./pages/cashflow"))

import "./App.css"

function App() {
  return (
    <Router>
      <ProfileProvider>
        <NotesProvider>
          <AssignmentProvider>
            <ScheduleProvider>
              <CashflowProvider>
                <MainLayout>
                  <Suspense fallback={null}>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/cashflow" element={<CashflowPage />} />
                      <Route path="/assignments" element={<AssignmentsPage />} />
                      <Route path="/schedule" element={<SchedulePage />} />
                      <Route path="/notes" element={<NotesPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                  </Suspense>
                </MainLayout>
              </CashflowProvider>
            </ScheduleProvider>
          </AssignmentProvider>
        </NotesProvider>
      </ProfileProvider>
    </Router>
  )
}

export default App
