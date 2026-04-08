import * as React from "react"
import {
  BarChart3,
  LayoutDashboard,
  KanbanSquare,
  Calendar,
  StickyNote,
  Wallet,
  ChevronRight,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useProfile } from "@/lib/profile-store"


const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Cashflow",
      url: "/cashflow",
      icon: Wallet,
    },
    {
      title: "Assignments",
      url: "/assignments",
      icon: KanbanSquare,
    },
    {
      title: "Schedule",
      url: "/schedule",
      icon: Calendar,
    },
    {
      title: "Notes",
      url: "/notes",
      icon: StickyNote,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const { profile } = useProfile()
  const profileBio = profile.bio.trim() || "No bio set"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BarChart3 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden">
                  <span className="truncate font-semibold text-foreground">Aces</span>
                  <span className="truncate text-xs text-muted-foreground">Productivity Manager</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={location.pathname === item.url}
                >
                  <Link to={item.url}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              asChild 
              tooltip="Settings"
              isActive={location.pathname === "/settings"}
            >
              <Link to="/settings">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={profile.avatar || ""} alt={profile.username} />
                  <AvatarFallback className="rounded-lg">{profile.username.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[state=collapsed]:hidden">
                  <span className="truncate font-semibold">{profile.username}</span>
                  <span className="relative h-4 overflow-hidden text-xs text-muted-foreground">
                    <span className="absolute inset-0 truncate transition-all duration-200 group-hover/menu-button:-translate-y-full group-hover/menu-button:opacity-0">
                      {profileBio}
                    </span>
                    <span className="absolute inset-0 truncate translate-y-full opacity-0 transition-all duration-200 group-hover/menu-button:translate-y-0 group-hover/menu-button:opacity-100">
                      Settings
                    </span>
                  </span>
                </div>
                <ChevronRight className="ml-auto size-4 text-muted-foreground" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
