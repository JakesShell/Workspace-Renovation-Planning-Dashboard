const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "spaceops-db.json");

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

const seedData = {
  meta: {
    appName: "SpaceOps",
    lastSync: "Not synced yet",
    syncStatus: "idle",
    syncRuns: 0
  },
  sites: [
    {
      id: "hq-west",
      name: "HQ West Floor 4",
      location: "Cape Town",
      readiness: 82,
      budget: 94000,
      blockers: 2,
      owner: "Facilities + IT",
      status: "Needs Handoff",
      assets: 91,
      approvals: 78
    },
    {
      id: "studio-east",
      name: "Studio East Buildout",
      location: "Johannesburg",
      readiness: 74,
      budget: 68000,
      blockers: 2,
      owner: "Workplace Ops",
      status: "Vendor Risk",
      assets: 84,
      approvals: 72
    },
    {
      id: "support-hub",
      name: "Support Hub Refresh",
      location: "Remote Team",
      readiness: 91,
      budget: 56000,
      blockers: 1,
      owner: "Cloud Support",
      status: "On Track",
      assets: 96,
      approvals: 88
    },
    {
      id: "training-room",
      name: "Training Room Launch",
      location: "Durban",
      readiness: 88,
      budget: 66000,
      blockers: 0,
      owner: "Enablement",
      status: "Ready Soon",
      assets: 94,
      approvals: 92
    }
  ],
  phases: [
    { label: "01", title: "Scope Locked", detail: "Final renovation scope, floor zones, and stakeholder approvals captured.", status: "Complete" },
    { label: "02", title: "Vendor Mobilized", detail: "Contractors, furniture, network installers, and access control owners assigned.", status: "Active" },
    { label: "03", title: "Assets Staged", detail: "Furniture, monitors, docking stations, badges, and network equipment tracked.", status: "At Risk" },
    { label: "04", title: "Launch Handoff", detail: "Facilities, IT, security, and support sign off before the workspace opens.", status: "Pending" }
  ],
  blockers: [
    {
      id: "blk-network-closet",
      siteId: "hq-west",
      title: "Network Closet Handoff",
      detail: "Switch installation window has not been confirmed by the infrastructure owner.",
      owner: "Cloud Support",
      severity: "medium",
      status: "open",
      createdAt: "2026-05-17T14:12:00.000Z",
      updatedAt: "2026-05-17T14:12:00.000Z"
    },
    {
      id: "blk-access-badge",
      siteId: "hq-west",
      title: "Access Badge Batch",
      detail: "Temporary access cards are not yet matched to the revised floor plan.",
      owner: "Security Ops",
      severity: "medium",
      status: "open",
      createdAt: "2026-05-17T14:15:00.000Z",
      updatedAt: "2026-05-17T14:15:00.000Z"
    },
    {
      id: "blk-furniture-window",
      siteId: "studio-east",
      title: "Furniture Delivery Window",
      detail: "Vendor delivery overlaps with cleaning crew schedule.",
      owner: "Vendor Lead",
      severity: "low",
      status: "open",
      createdAt: "2026-05-17T14:18:00.000Z",
      updatedAt: "2026-05-17T14:18:00.000Z"
    },
    {
      id: "blk-av-test",
      siteId: "studio-east",
      title: "AV Room Test",
      detail: "Training room display and camera setup still need final test.",
      owner: "IT Support",
      severity: "medium",
      status: "open",
      createdAt: "2026-05-17T14:22:00.000Z",
      updatedAt: "2026-05-17T14:22:00.000Z"
    },
    {
      id: "blk-exec-walkthrough",
      siteId: "support-hub",
      title: "Executive Walkthrough",
      detail: "Final stakeholder review not yet scheduled.",
      owner: "Workplace Ops",
      severity: "low",
      status: "open",
      createdAt: "2026-05-17T14:25:00.000Z",
      updatedAt: "2026-05-17T14:25:00.000Z"
    }
  ],
  vendors: [
    { id: "ven-interiors", name: "Northline Interiors", role: "Furniture + layout", owner: "Maya Chen", status: "Delivery Confirmed", load: "Medium" },
    { id: "ven-network", name: "BlueGrid Networks", role: "Switches + Wi-Fi", owner: "Leo Andrade", status: "Handoff Needed", load: "High" },
    { id: "ven-access", name: "SecureDoor Access", role: "Badges + doors", owner: "Priya Solanki", status: "Batch Pending", load: "High" },
    { id: "ven-av", name: "Atrium AV", role: "Screens + rooms", owner: "Jonas Bell", status: "Testing", load: "Medium" },
    { id: "ven-cleaning", name: "CleanWorks", role: "Final cleanup", owner: "Claire Bennett", status: "Scheduled", load: "Low" },
    { id: "ven-signage", name: "Wayfinder Print", role: "Signage", owner: "Alex Ramos", status: "Ready", load: "Low" },
    { id: "ven-procurement", name: "WorkNest Procurement", role: "Asset tracking", owner: "Nia Kapoor", status: "Reconciling", load: "Medium" },
    { id: "ven-launch", name: "Launch Desk", role: "Go-live support", owner: "Owen Hart", status: "On Call", load: "Balanced" }
  ],
  pipeline: [
    { title: "Site Forms", detail: "Facilities and vendor updates enter through structured workspace forms." },
    { title: "Cloud API", detail: "Submissions are routed through an API layer for validation." },
    { title: "Ops Store", detail: "Readiness, blockers, assets, and spend are stored centrally." },
    { title: "Alerts", detail: "High-risk blockers notify owners or support queues." },
    { title: "Reports", detail: "Leadership receives launch briefs and readiness snapshots." }
  ],
  syncEvents: []
};

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(seedData, null, 2));
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function calculateReadiness(db) {
  const openBlockers = db.blockers.filter((blocker) => blocker.status !== "resolved");

  const siteAverage = Math.round(
    db.sites.reduce((sum, site) => sum + Number(site.readiness || 0), 0) / Math.max(db.sites.length, 1)
  );

  const assetAverage = Math.round(
    db.sites.reduce((sum, site) => sum + Number(site.assets || 0), 0) / Math.max(db.sites.length, 1)
  );

  const approvalAverage = Math.round(
    db.sites.reduce((sum, site) => sum + Number(site.approvals || 0), 0) / Math.max(db.sites.length, 1)
  );

  const criticalPenalty = openBlockers.filter((blocker) => blocker.severity === "critical").length * 8;
  const mediumPenalty = openBlockers.filter((blocker) => blocker.severity === "medium").length * 4;
  const lowPenalty = openBlockers.filter((blocker) => blocker.severity === "low").length * 2;

  const baseScore = Math.round((siteAverage * 0.45) + (assetAverage * 0.3) + (approvalAverage * 0.25));
  const readinessScore = Math.max(0, Math.min(100, baseScore - criticalPenalty - mediumPenalty - lowPenalty));

  const topRisk = openBlockers[0] || null;

  return {
    readinessScore,
    riskLevel: readinessScore >= 88 ? "low" : readinessScore >= 70 ? "moderate" : "high",
    topRisk: topRisk ? topRisk.title : "No open blockers",
    recommendedAction: topRisk
      ? `Confirm owner and deadline for: ${topRisk.title}.`
      : "Prepare the workspace launch brief for leadership approval.",
    openBlockers: openBlockers.length,
    assetReadiness: assetAverage,
    approvalReadiness: approvalAverage,
    projectedSpend: db.sites.reduce((sum, site) => sum + Number(site.budget || 0), 0),
    siteCount: db.sites.length
  };
}

function addSyncEvent(db, source, message, status = "success") {
  db.syncEvents.unshift({
    id: `sync-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    source,
    message,
    status,
    timestamp: new Date().toISOString()
  });

  db.syncEvents = db.syncEvents.slice(0, 25);
}

app.get("/api/health", (req, res) => {
  const db = readDb();
  res.json({
    status: "ok",
    service: "SpaceOps CoreOps API",
    version: "1.0.0",
    lastSync: db.meta.lastSync,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/metrics", (req, res) => {
  const db = readDb();
  const summary = calculateReadiness(db);

  res.type("text/plain").send([
    "# HELP spaceops_readiness_score Portfolio readiness score",
    "# TYPE spaceops_readiness_score gauge",
    `spaceops_readiness_score ${summary.readinessScore}`,
    "# HELP spaceops_open_blockers Current open blockers",
    "# TYPE spaceops_open_blockers gauge",
    `spaceops_open_blockers ${summary.openBlockers}`,
    "# HELP spaceops_site_count Tracked workspace sites",
    "# TYPE spaceops_site_count gauge",
    `spaceops_site_count ${summary.siteCount}`,
    "# HELP spaceops_sync_runs Simulated cloud sync runs",
    "# TYPE spaceops_sync_runs counter",
    `spaceops_sync_runs ${db.meta.syncRuns || 0}`
  ].join("\n"));
});

app.get("/api/dashboard", (req, res) => {
  const db = readDb();
  res.json({
    ...db,
    summary: calculateReadiness(db)
  });
});

app.get("/api/readiness-summary", (req, res) => {
  const db = readDb();
  res.json(calculateReadiness(db));
});

app.get("/api/sites", (req, res) => {
  res.json(readDb().sites);
});

app.get("/api/sites/:id", (req, res) => {
  const site = readDb().sites.find((item) => item.id === req.params.id);

  if (!site) {
    return res.status(404).json({ error: "Site not found" });
  }

  res.json(site);
});

app.post("/api/sites", (req, res) => {
  const db = readDb();
  const site = {
    id: req.body.id || `site-${Date.now()}`,
    name: req.body.name || "Untitled Workspace",
    location: req.body.location || "Location not set",
    readiness: Number(req.body.readiness || 0),
    budget: Number(req.body.budget || 0),
    blockers: Number(req.body.blockers || 0),
    owner: req.body.owner || "Unassigned",
    status: req.body.status || "New",
    assets: Number(req.body.assets || 0),
    approvals: Number(req.body.approvals || 0)
  };

  db.sites.push(site);
  addSyncEvent(db, "Site API", `New workspace site added: ${site.name}`);
  writeDb(db);

  res.status(201).json(site);
});

app.patch("/api/sites/:id", (req, res) => {
  const db = readDb();
  const index = db.sites.findIndex((site) => site.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Site not found" });
  }

  db.sites[index] = {
    ...db.sites[index],
    ...req.body
  };

  addSyncEvent(db, "Site API", `Workspace site updated: ${db.sites[index].name}`);
  writeDb(db);

  res.json(db.sites[index]);
});

app.get("/api/blockers", (req, res) => {
  res.json(readDb().blockers);
});

app.post("/api/blockers", (req, res) => {
  const db = readDb();
  const blocker = {
    id: req.body.id || `blk-${Date.now()}`,
    siteId: req.body.siteId || "hq-west",
    title: req.body.title || "Untitled Blocker",
    detail: req.body.detail || "No detail provided.",
    owner: req.body.owner || "Unassigned",
    severity: req.body.severity || "medium",
    status: "open",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.blockers.push(blocker);

  const site = db.sites.find((item) => item.id === blocker.siteId);
  if (site) {
    site.blockers = Number(site.blockers || 0) + 1;
    site.status = "Needs Handoff";
  }

  addSyncEvent(db, "Blocker API", `New blocker created: ${blocker.title}`, "warning");
  writeDb(db);

  res.status(201).json(blocker);
});

app.patch("/api/blockers/:id/resolve", (req, res) => {
  const db = readDb();
  const blocker = db.blockers.find((item) => item.id === req.params.id);

  if (!blocker) {
    return res.status(404).json({ error: "Blocker not found" });
  }

  blocker.status = "resolved";
  blocker.resolvedAt = new Date().toISOString();
  blocker.updatedAt = new Date().toISOString();

  const site = db.sites.find((item) => item.id === blocker.siteId);
  if (site) {
    site.blockers = Math.max(0, Number(site.blockers || 0) - 1);
    site.readiness = Math.min(100, Number(site.readiness || 0) + 4);

    if (site.blockers === 0) {
      site.status = "Ready Soon";
    }
  }

  addSyncEvent(db, "Blocker Workflow", `Resolved blocker: ${blocker.title}`);
  writeDb(db);

  res.json({ blocker, summary: calculateReadiness(db) });
});

app.get("/api/vendors", (req, res) => {
  res.json(readDb().vendors);
});

app.patch("/api/vendors/:id", (req, res) => {
  const db = readDb();
  const index = db.vendors.findIndex((vendor) => vendor.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Vendor not found" });
  }

  db.vendors[index] = {
    ...db.vendors[index],
    ...req.body
  };

  addSyncEvent(db, "Vendor Workflow", `Vendor updated: ${db.vendors[index].name}`);
  writeDb(db);

  res.json(db.vendors[index]);
});

app.post("/api/vendors/rebalance", (req, res) => {
  const db = readDb();

  db.vendors = db.vendors.map((vendor) => {
    if (vendor.load === "High") {
      return {
        ...vendor,
        load: "Medium",
        status: "Owner Confirmed"
      };
    }

    return vendor;
  });

  addSyncEvent(db, "Vendor Workflow", "High-load vendors rebalanced.");
  writeDb(db);

  res.json(db.vendors);
});

app.get("/api/cloud-sync/status", (req, res) => {
  const db = readDb();
  res.json({
    status: db.meta.syncStatus,
    lastSync: db.meta.lastSync,
    syncRuns: db.meta.syncRuns || 0
  });
});

app.get("/api/sync-events", (req, res) => {
  res.json(readDb().syncEvents);
});

app.post("/api/cloud-sync/run", (req, res) => {
  const db = readDb();

  db.meta.syncStatus = "complete";
  db.meta.lastSync = new Date().toISOString();
  db.meta.syncRuns = Number(db.meta.syncRuns || 0) + 1;

  db.sites = db.sites.map((site, index) => ({
    ...site,
    readiness: Math.min(100, Number(site.readiness || 0) + (index % 2 === 0 ? 1 : 2)),
    assets: Math.min(100, Number(site.assets || 0) + 1)
  }));

  addSyncEvent(db, "Vendor Portal", "Vendor milestone updates received.");
  addSyncEvent(db, "Facilities Form", "Site readiness checklist refreshed.");
  addSyncEvent(db, "IT Support Queue", "Network and AV readiness signals synced.");

  writeDb(db);

  res.json({
    message: "Cloud sync completed.",
    status: db.meta.syncStatus,
    lastSync: db.meta.lastSync,
    syncRuns: db.meta.syncRuns,
    summary: calculateReadiness(db),
    events: db.syncEvents.slice(0, 5)
  });
});

app.get("/api/reports/readiness.txt", (req, res) => {
  const db = readDb();
  const summary = calculateReadiness(db);

  const report = [
    "SpaceOps Cloud Workspace Readiness Brief",
    "",
    `Readiness Score: ${summary.readinessScore}%`,
    `Risk Level: ${summary.riskLevel}`,
    `Top Risk: ${summary.topRisk}`,
    `Recommended Action: ${summary.recommendedAction}`,
    `Open Blockers: ${summary.openBlockers}`,
    `Asset Readiness: ${summary.assetReadiness}%`,
    `Approval Readiness: ${summary.approvalReadiness}%`,
    `Projected Spend: $${summary.projectedSpend.toLocaleString("en-US")}`,
    "",
    "Sites:",
    ...db.sites.map((site) => `- ${site.name}: ${site.readiness}% ready | ${site.blockers} blockers | ${site.status}`),
    "",
    "Open Blockers:",
    ...db.blockers
      .filter((blocker) => blocker.status !== "resolved")
      .map((blocker) => `- ${blocker.title}: ${blocker.detail} | Owner: ${blocker.owner} | Severity: ${blocker.severity}`),
    "",
    "Recent Sync Events:",
    ...db.syncEvents.slice(0, 8).map((event) => `- ${event.timestamp}: ${event.source} | ${event.message}`)
  ].join("\n");

  res.type("text/plain").send(report);
});

app.post("/api/reset-demo-data", (req, res) => {
  writeDb(seedData);
  res.json({ message: "Demo data reset.", dashboard: { ...seedData, summary: calculateReadiness(seedData) } });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

ensureDb();

app.listen(PORT, () => {
  console.log(`SpaceOps CoreOps API running at http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
