import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Code2,
  BookOpen,
  Mic,
  Trophy,
  BarChart3,
  Target,
  Users,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Code2, label: "Coding", path: "/coding" },
  { icon: BookOpen, label: "Assessments", path: "/assessments" },
  { icon: Mic, label: "Speech Practice", path: "/speech" },
  { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Target, label: "Campus Intel", path: "/campus" },
  { icon: Users, label: "Community", path: "/community" },
];

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuth();

  const displayName = profile?.name || "User";
  const initials = displayName.charAt(0).toUpperCase();
  const dept = profile?.department || "";
  const year = profile?.year || "";

  const allNavItems = role === "admin"
    ? [...navItems, { icon: Shield, label: "Admin", path: "/admin" }]
    : navItems;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <Code2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-sidebar-primary-foreground">
            Intelli<span className="text-sidebar-primary">Prep</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {allNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-xl px-4 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-accent text-sm font-bold text-accent-foreground">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-sidebar-accent-foreground truncate">{displayName}</div>
              <div className="text-xs text-sidebar-foreground">
                {dept && year ? `${dept} • ${year}` : role === "admin" ? "Admin" : "Student"}
              </div>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <Link to="/profile" className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground hover:bg-sidebar-accent">
              <Settings className="h-3.5 w-3.5" />
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary">
            <Code2 className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-base font-bold text-foreground">IntelliPrep</span>
        </div>
        <button onClick={handleSignOut} className="text-muted-foreground">
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card lg:hidden">
        {allNavItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 pt-14 lg:ml-64 lg:pt-0">
        <div className="min-h-screen p-4 pb-20 md:p-8 lg:pb-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
