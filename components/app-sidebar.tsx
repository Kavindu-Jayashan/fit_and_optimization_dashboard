"use client";

import {
  BriefcaseIcon,
  DoorClosedLockedIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  Settings2Icon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";

const data = {
  user: {
    name: "candidate",
    email: "candidate@example.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Job Listings",
      url: "/jobs",
      icon: BriefcaseIcon,
    },
    {
      title: "Dashbaord",
      url: "/dashbaord",
      icon: LayoutDashboardIcon,
    },
    {
      title: "My CVs",
      url: "#",
      icon: FileTextIcon,
    },
  ],
  navSecondary: [
    {
      title: "settings",
      url: "#",
      icon: <Settings2Icon />,
    },
    {
      title: "logout",
      url: "#",
      icon: <DoorClosedLockedIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/jobs">
                <FileTextIcon className="size-5 text-[#4a7c59]" />
                <span className="text-base font-semibold">Dashboard</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {data.navMain.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild >
                <a href={item.url} >
                  <item.icon  className="size-4"/>
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
