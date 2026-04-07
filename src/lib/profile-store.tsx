import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react"

export interface ProfileData {
  username: string
  bio: string
  avatar: string | null
}

interface ProfileStore {
  profile: ProfileData
  updateProfile: (data: Partial<ProfileData>) => void
}

const STORAGE_KEY = "aces-profile"

const DEFAULT_PROFILE: ProfileData = {
  username: "Aces User",
  bio: "Software Engineer at Aces",
  avatar: null, // We'll rely on the AvatarFallback or a URL if provided
}

const ProfileContext = createContext<ProfileStore | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : DEFAULT_PROFILE
    } catch {
      return DEFAULT_PROFILE
    }
  })

  // Synchronize with local storage on state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  }, [profile])

  const updateProfile = useCallback((data: Partial<ProfileData>) => {
    setProfile(prev => ({ ...prev, ...data }))
  }, [])

  const value = useMemo(() => ({ profile, updateProfile }), [profile, updateProfile])

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}
