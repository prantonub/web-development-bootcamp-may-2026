import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const BACKEND_URL = "https://financehub-personal-expence-tracker.onrender.com";

export default function Export() {
  const { user } = useAuth();
  const now = new Date();

  const [reportMonth, setReportMonth] = useState(now.getMonth() + 1);
  const [reportYear, setReportYear] = useState(now.getFullYear());
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState("");

  // Opens report in new tab — the report page has a "Download PDF" button
  // that uses html2pdf.js to download directly without any browser dialog
  const handleExportReport = () => {
    setError("");

    // Validate user is logged in
    if (!user) {
      setError("You must be logged in to generate reports");
      return;
    }

    // Get token
    const token = localStorage.getItem("sw_token");
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return;
    }

    setReportLoading(true);
    try {
      const url = `${BACKEND_URL}/api/export/summary?month=${reportMonth}&year=${reportYear}&token=${token}`;
      console.log("📄 Opening report URL:", url);

      const newWindow = window.open(url, "_blank");
      if (
        !newWindow ||
        newWindow.closed ||
        typeof newWindow.closed == "undefined"
      ) {
        setError("Pop-up window blocked. Please allow pop-ups for this site.");
      }
    } catch (err) {
      setError("Failed to generate report. Please try again.");
      console.error("❌ Report error:", err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setError("");

    if (!user) {
      setError("You must be logged in to export data");
      return;
    }

    try {
      const response = await api.get("/export/csv", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `transactions-${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("CSV export failed. Please try again.");
      console.error("❌ CSV error:", err);
    }
  };

  const yearOptions = Array.from(
    { length: 6 },
    (_, i) => now.getFullYear() - 5 + i,
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="page-title">Export & Reports</h1>
        <p className="page-sub">Download and export your financial data</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
          ❌ {error}
        </div>
      )}

      {/* PDF Report card */}
      <div className="card p-6">
        <div className="mb-5">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">
            Generate Reports
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Create PDF reports for specific months
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label className="label">Month</label>
            <select
              className="input"
              value={reportMonth}
              onChange={(e) => setReportMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Year</label>
            <select
              className="input"
              value={reportYear}
              onChange={(e) => setReportYear(Number(e.target.value))}
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleExportReport}
          disabled={reportLoading}
          className="w-full btn-primary justify-center mb-3"
        >
          {reportLoading
            ? "⏳ Opening..."
            : `📄 Generate ${MONTHS[reportMonth - 1]} ${reportYear} PDF Report`}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Report opens in a new tab → click <strong>⬇ Download PDF</strong> to
          save as PDF
        </p>
      </div>

      {/* CSV Export card */}
      <div className="card p-6">
        <div className="mb-5">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">
            Export All Data
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Download all your transactions as CSV
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="w-full btn-secondary justify-center"
        >
          📊 Export All Transactions to CSV
        </button>
      </div>
    </div>
  );
}
