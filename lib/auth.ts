// Simple admin authentication for Sherdor Mebel
const ADMIN_PASSWORD = "sherzod"

export const checkAdminPassword = (password: string): boolean => {
  return password === ADMIN_PASSWORD
}

export const setAdminSession = (): void => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("sherdor_admin", "true")
    sessionStorage.setItem("sherdor_admin_timestamp", Date.now().toString())
  }
}

export const clearAdminSession = (): void => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("sherdor_admin")
    sessionStorage.removeItem("sherdor_admin_timestamp")
  }
}

export const isAdminLoggedIn = (): boolean => {
  if (typeof window === "undefined") return false

  const isAdmin = sessionStorage.getItem("sherdor_admin") === "true"
  const timestamp = sessionStorage.getItem("sherdor_admin_timestamp")

  if (isAdmin && timestamp) {
    const sessionAge = Date.now() - Number.parseInt(timestamp)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

    if (sessionAge > maxAge) {
      clearAdminSession()
      return false
    }
  }

  return isAdmin
}

export const getAdminSessionInfo = (): { isAdmin: boolean; timeRemaining?: number } => {
  if (typeof window === "undefined") return { isAdmin: false }

  const isAdmin = sessionStorage.getItem("sherdor_admin") === "true"
  const timestamp = sessionStorage.getItem("sherdor_admin_timestamp")

  if (isAdmin && timestamp) {
    const sessionAge = Date.now() - Number.parseInt(timestamp)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    const timeRemaining = maxAge - sessionAge

    if (timeRemaining > 0) {
      return { isAdmin: true, timeRemaining }
    } else {
      clearAdminSession()
      return { isAdmin: false }
    }
  }

  return { isAdmin }
}
