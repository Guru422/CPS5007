import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const competencyData = [
  { skill: "Communication", score: 7 },
  { skill: "Python", score: 8 },
  { skill: "SQL", score: 9 },
  { skill: "Teamwork", score: 6 },
  { skill: "Analysis", score: 8 }
];

const qualificationData = [
  { year: "2023", count: 1 },
  { year: "2024", count: 2 },
  { year: "2025", count: 3 },
  { year: "2026", count: 4 }
];

const developmentData = [
  { month: "Jan", entries: 1 },
  { month: "Feb", entries: 3 },
  { month: "Mar", entries: 5 },
  { month: "Apr", entries: 4 }
];

const placementStatusData = [
  { name: "Pending", value: 2 },
  { name: "Approved", value: 1 },
  { name: "Rejected", value: 1 }
];

const colours = ["#1b6ea8", "#2e7d32", "#b42318"];

export default function AnalyticsPage() {
  return (
    <div>
      <h2>Analytics</h2>
      <p className="muted">
        Visual overview of your competencies, qualifications, development logs,
        and placement progress.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "18px",
          marginTop: "18px"
        }}
      >
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Competency Scores</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={competencyData}>
              <XAxis dataKey="skill" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Bar dataKey="score" fill="#1b6ea8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Skill Radar</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={competencyData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis domain={[0, 10]} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#1b6ea8"
                fill="#1b6ea8"
                fillOpacity={0.35}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Qualifications by Year</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={qualificationData}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2e7d32" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Development Activity</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={developmentData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="entries"
                stroke="#1b6ea8"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Placement Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={placementStatusData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {placementStatusData.map((_, index) => (
                  <Cell key={index} fill={colours[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Analytics Summary</h3>
          <p>
            This page will eventually use live student-entered data from
            competencies, qualifications, development logs, and placements.
          </p>
          <p className="muted">
            Current version uses mock front-end data for demonstration.
          </p>
        </div>
      </div>
    </div>
  );
}