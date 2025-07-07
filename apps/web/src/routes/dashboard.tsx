import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePrivateData, useUserProfile, useUserOrganizations } from "@/utils/api-client"
import { authClient } from "@/lib/auth-client"

export default function Dashboard() {
  const { data: session } = authClient.useSession();
  const { data: privateData, isLoading: loadingPrivate } = usePrivateData();
  const { data: profile, isLoading: loadingProfile } = useUserProfile();
  const { data: organizations, isLoading: loadingOrgs } = useUserOrganizations();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>API Testing</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            {/* Session Data */}
            <div className="bg-muted/50 aspect-video rounded-xl p-4">
              <h3 className="font-medium mb-2">Session Data</h3>
              {session ? (
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Name:</span> {session.user.name}</p>
                  <p><span className="font-medium">Email:</span> {session.user.email}</p>
                  <p><span className="font-medium">ID:</span> {session.user.id}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not authenticated</p>
              )}
            </div>

            {/* Private API Data */}
            <div className="bg-muted/50 aspect-video rounded-xl p-4">
              <h3 className="font-medium mb-2">Private API</h3>
              {loadingPrivate ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : privateData ? (
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Message:</span> {privateData.message}</p>
                  <p><span className="font-medium">User:</span> {privateData.user?.name}</p>
                </div>
              ) : (
                <p className="text-sm text-red-500">Failed to load</p>
              )}
            </div>

            {/* User Profile */}
            <div className="bg-muted/50 aspect-video rounded-xl p-4">
              <h3 className="font-medium mb-2">User Profile API</h3>
              {loadingProfile ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : profile ? (
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Name:</span> {profile.name}</p>
                  <p><span className="font-medium">Email:</span> {profile.email}</p>
                  <p><span className="font-medium">Orgs:</span> {profile.organizations?.length || 0}</p>
                </div>
              ) : (
                <p className="text-sm text-red-500">Failed to load</p>
              )}
            </div>
          </div>

          {/* Organizations List */}
          <div className="bg-muted/50 min-h-[200px] flex-1 rounded-xl p-4">
            <h3 className="font-medium mb-4">Organizations API</h3>
            {loadingOrgs ? (
              <p className="text-sm text-muted-foreground">Loading organizations...</p>
            ) : organizations && organizations.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {organizations.map((org: any) => (
                  <div key={org.id} className="border rounded-lg p-4 bg-background">
                    <h4 className="font-medium">{org.name}</h4>
                    <p className="text-sm text-muted-foreground">{org.slug}</p>
                    {org.description && (
                      <p className="text-sm mt-2">{org.description}</p>
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                      <span>APIs: {org._count?.apis || 0}</span>
                      <span>Members: {org._count?.members || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No organizations found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Create your first organization to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
