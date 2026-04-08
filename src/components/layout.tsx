import * as React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AppSidebar } from "@/components/app-sidebar"
import { useLocation, Link } from "react-router-dom"
import { Minus, Moon, Square, Sun, X } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const pathnames = location.pathname.split("/").filter((x) => x)
  const { resolvedTheme, setTheme } = useTheme()

  const handleMinimize = () => {
    window.ipcRenderer?.windowControls?.minimize()
  }

  const handleMaximize = () => {
    window.ipcRenderer?.windowControls?.maximize()
  }

  const handleClose = () => {
    window.ipcRenderer?.windowControls?.close()
  }

  const handleToggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      <TooltipProvider>
        <SidebarProvider className="min-h-0 flex-1 overflow-hidden">
          <AppSidebar />
          <SidebarInset className="flex min-h-0 flex-col overflow-hidden">
            <header className="flex h-12 shrink-0 items-center justify-between border-b px-4 app-region-drag select-none bg-background/50 backdrop-blur-md z-50">
              <div className="flex items-center gap-2 app-region-no-drag">
                <SidebarTrigger className="-ml-1 mr-2" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink asChild>
                        <Link to="/">Dashboard</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {pathnames.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                    {pathnames.map((name, index) => {
                      const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`
                      const isLast = index === pathnames.length - 1
                      return (
                        <React.Fragment key={name}>
                          <BreadcrumbItem>
                            {isLast ? (
                              <BreadcrumbPage className="capitalize">{name}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink asChild>
                                <Link to={routeTo} className="capitalize">
                                  {name}
                                </Link>
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {!isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                      )
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              {/* Window Controls - Right side of header */}
              <div className="flex items-center h-full app-region-no-drag -mr-4">
                <button
                  onClick={handleToggleTheme}
                  className="flex h-full w-10 items-center justify-center hover:bg-muted/50 transition-colors"
                  title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="size-3.5" />
                  ) : (
                    <Moon className="size-3.5" />
                  )}
                </button>
                <button 
                  onClick={handleMinimize}
                  className="flex h-full w-10 items-center justify-center hover:bg-muted/50 transition-colors"
                >
                  <Minus className="size-3.5" />
                </button>
                <button 
                  onClick={handleMaximize}
                  className="flex h-full w-10 items-center justify-center hover:bg-muted/50 transition-colors"
                >
                  <Square className="size-3" />
                </button>
                <button 
                  onClick={handleClose}
                  className="flex h-full w-12 items-center justify-center hover:bg-destructive/80 hover:text-destructive-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </header>
            <ScrollArea className="flex-1 overflow-hidden">
              <main className="flex flex-col gap-6 p-6 min-h-full">
                {children}
              </main>
            </ScrollArea>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </div>
  )
}
