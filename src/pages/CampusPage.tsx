import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Building2, TrendingUp, Users, MapPin, IndianRupee, Briefcase, GraduationCap } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const placementTrends = [
  { year: "2020", placed: 68, avgPackage: 5.2 },
  { year: "2021", placed: 72, avgPackage: 5.8 },
  { year: "2022", placed: 78, avgPackage: 6.5 },
  { year: "2023", placed: 82, avgPackage: 7.2 },
  { year: "2024", placed: 85, avgPackage: 8.1 },
];

const topCompanies = [
  { name: "TCS", students: 45, package: "3.6 - 7 LPA", skills: ["Java", "SQL", "Aptitude"] },
  { name: "Infosys", students: 38, package: "3.6 - 9 LPA", skills: ["Python", "DSA", "Problem Solving"] },
  { name: "Wipro", students: 32, package: "3.5 - 6.5 LPA", skills: ["Java", "Testing", "SQL"] },
  { name: "Amazon", students: 8, package: "12 - 28 LPA", skills: ["DSA", "System Design", "OS"] },
  { name: "Google", students: 3, package: "18 - 35 LPA", skills: ["DSA", "Algorithms", "Math"] },
  { name: "Microsoft", students: 5, package: "15 - 30 LPA", skills: ["DSA", "OOP", "System Design"] },
];

const deptStats = [
  { dept: "CSE", placed: 92, count: 115 },
  { dept: "IT", placed: 85, count: 78 },
  { dept: "ECE", placed: 72, count: 62 },
  { dept: "EEE", placed: 65, count: 45 },
  { dept: "MECH", placed: 58, count: 38 },
];

const CampusPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Campus Intelligence</h1>
          <p className="text-muted-foreground">Historical placement data & company-specific insights</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: GraduationCap, label: "Placement Rate", value: "85%", gradient: "gradient-primary" },
            { icon: IndianRupee, label: "Avg Package", value: "8.1 LPA", gradient: "gradient-accent" },
            { icon: Building2, label: "Companies Visited", value: "42", gradient: "gradient-amber" },
            { icon: Briefcase, label: "Total Offers", value: "338", gradient: "gradient-primary" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.gradient}`}>
                <stat.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Placement Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <TrendingUp className="h-5 w-5 text-emerald" />
              Placement Trends (5-Year)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={placementTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="year" fontSize={12} stroke="hsl(220, 9%, 46%)" />
                <YAxis fontSize={12} stroke="hsl(220, 9%, 46%)" />
                <Tooltip />
                <Line type="monotone" dataKey="placed" stroke="hsl(234, 89%, 54%)" strokeWidth={2.5} dot={{ r: 4 }} name="Placed %" />
                <Line type="monotone" dataKey="avgPackage" stroke="hsl(160, 84%, 39%)" strokeWidth={2.5} dot={{ r: 4 }} name="Avg Package (LPA)" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Department Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Users className="h-5 w-5 text-primary" />
              Department-wise Placement
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deptStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="dept" fontSize={12} stroke="hsl(220, 9%, 46%)" />
                <YAxis fontSize={12} stroke="hsl(220, 9%, 46%)" />
                <Tooltip />
                <Bar dataKey="placed" name="Placed %" fill="hsl(234, 89%, 54%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Top Companies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Building2 className="h-5 w-5 text-primary" />
            Top Recruiting Companies
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topCompanies.map((company, i) => (
              <div key={company.name} className="rounded-xl border border-border p-4 transition-all hover:border-primary/30">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-base font-semibold text-foreground">{company.name}</h4>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {company.students} hired
                  </span>
                </div>
                <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
                  <IndianRupee className="h-3.5 w-3.5" />
                  {company.package}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {company.skills.map((skill) => (
                    <span key={skill} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default CampusPage;
