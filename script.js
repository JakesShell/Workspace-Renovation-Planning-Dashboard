const fallbackState = {
    syncedAt: "Local demo mode",
    readiness: 82,
    assets: 91,
    budget: 284000,
    activeSiteId: "hq-west",
    sites: [
        { id: "hq-west", name: "HQ West Floor 4", location: "Cape Town", readiness: 82, budget: 94000, blockers: 2, owner: "Facilities + IT", status: "Needs Handoff", assets: 91, approvals: 78 },
        { id: "studio-east", name: "Studio East Buildout", location: "Johannesburg", readiness: 74, budget: 68000, blockers: 2, owner: "Workplace Ops", status: "Vendor Risk", assets: 84, approvals: 72 },
        { id: "support-hub", name: "Support Hub Refresh", location: "Remote Team", readiness: 91, budget: 56000, blockers: 1, owner: "Cloud Support", status: "On Track", assets: 96, approvals: 88 },
        { id: "training-room", name: "Training Room Launch", location: "Durban", readiness: 88, budget: 66000, blockers: 0, owner: "Enablement", status: "Ready Soon", assets: 94, approvals: 92 }
    ],
    phases: [
        { label: "01", title: "Scope Locked", detail: "Final renovation scope, floor zones, and stakeholder approvals captured.", status: "Complete" },
        { label: "02", title: "Vendor Mobilized", detail: "Contractors, furniture, network installers, and access control owners assigned.", status: "Active" },
        { label: "03", title: "Assets Staged", detail: "Furniture, monitors, docking stations, badges, and network equipment tracked.", status: "At Risk" },
        { label: "04", title: "Launch Handoff", detail: "Facilities, IT, security, and support sign off before the workspace opens.", status: "Pending" }
    ],
    blockers: [
        { id: "blk-network-closet", siteId: "hq-west", title: "Network Closet Handoff", detail: "Switch installation window has not been confirmed by the infrastructure owner.", owner: "Cloud Support", severity: "medium", status: "open" },
        { id: "blk-access-badge", siteId: "hq-west", title: "Access Badge Batch", detail: "Temporary access cards are not yet matched to the revised floor plan.", owner: "Security Ops", severity: "medium", status: "open" },
        { id: "blk-furniture-window", siteId: "studio-east", title: "Furniture Delivery Window", detail: "Vendor delivery overlaps with cleaning crew schedule.", owner: "Vendor Lead", severity: "low", status: "open" }
    ],
    vendors: [
        { id: "ven-interiors", name: "Northline Interiors", role: "Furniture + layout", owner: "Maya Chen", status: "Delivery Confirmed", load: "Medium" },
        { id: "ven-network", name: "BlueGrid Networks", role: "Switches + Wi-Fi", owner: "Leo Andrade", status: "Handoff Needed", load: "High" },
        { id: "ven-access", name: "SecureDoor Access", role: "Badges + doors", owner: "Priya Solanki", status: "Batch Pending", load: "High" }
    ],
    pipeline: [
        { title: "Site Forms", detail: "Facilities and vendor updates enter through structured workspace forms." },
        { title: "Cloud API", detail: "Submissions are routed through an API layer for validation." },
        { title: "Ops Store", detail: "Readiness, blockers, assets, and spend are stored centrally." },
        { title: "Alerts", detail: "High-risk blockers notify owners or support queues." },
        { title: "Reports", detail: "Leadership receives launch briefs and readiness snapshots." }
    ],
    health: [
        { label: "Data Freshness", value: "96%" },
        { label: "Owner Coverage", value: "88%" },
        { label: "Asset Mapping", value: "91%" },
        { label: "Approval Readiness", value: "79%" },
        { label: "Risk Visibility", value: "94%" }
    ],
    syncEvents: []
};

let spaceOpsState = JSON.parse(JSON.stringify(fallbackState));
let backendOnline = false;

const views = document.querySelectorAll(".view-panel");
const navButtons = document.querySelectorAll(".nav-button");
const toast = document.getElementById("toast");

function getApiBase() {
    if (window.location.protocol === "file:") {
        return "http://localhost:3000";
    }

    return "";
}

async function apiGet(path) {
    const response = await fetch(`${getApiBase()}${path}`);

    if (!response.ok) {
        throw new Error(`GET ${path} failed`);
    }

    return response.json();
}

async function apiPost(path, body = {}) {
    const response = await fetch(`${getApiBase()}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`POST ${path} failed`);
    }

    return response.json();
}

async function apiPatch(path, body = {}) {
    const response = await fetch(`${getApiBase()}${path}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`PATCH ${path} failed`);
    }

    return response.json();
}

function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

function setView(viewName) {
    views.forEach((view) => {
        view.classList.toggle("active", view.id === `view-${viewName}`);
    });

    navButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.view === viewName);
    });

    const target = document.getElementById(`view-${viewName}`);

    if (target) {
        window.setTimeout(() => {
            const topbar = document.querySelector(".topbar");
            const offset = topbar ? topbar.offsetHeight + 46 : 140;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({
                top: Math.max(0, top),
                behavior: "smooth"
            });
        }, 50);
    }
}

function getActiveSite() {
    return spaceOpsState.sites.find((site) => site.id === spaceOpsState.activeSiteId) || spaceOpsState.sites[0];
}

function formatCurrency(value) {
    return `$${Number(value || 0).toLocaleString("en-US")}`;
}

function mapBackendDashboard(dashboard) {
    const summary = dashboard.summary || {};

    return {
        syncedAt: dashboard.meta?.lastSync || "Not synced yet",
        readiness: summary.readinessScore ?? 0,
        assets: summary.assetReadiness ?? 0,
        budget: summary.projectedSpend ?? 0,
        activeSiteId: spaceOpsState.activeSiteId || dashboard.sites?.[0]?.id || "hq-west",
        sites: dashboard.sites || [],
        phases: dashboard.phases || [],
        blockers: (dashboard.blockers || []).filter((blocker) => blocker.status !== "resolved"),
        vendors: dashboard.vendors || [],
        pipeline: dashboard.pipeline || [],
        health: [
            { label: "Data Freshness", value: dashboard.meta?.syncStatus === "complete" ? "100%" : "76%" },
            { label: "Owner Coverage", value: "88%" },
            { label: "Asset Mapping", value: `${summary.assetReadiness ?? 0}%` },
            { label: "Approval Readiness", value: `${summary.approvalReadiness ?? 0}%` },
            { label: "Risk Visibility", value: summary.riskLevel === "high" ? "62%" : "94%" }
        ],
        syncEvents: dashboard.syncEvents || []
    };
}

async function loadDashboardFromBackend() {
    try {
        const dashboard = await apiGet("/api/dashboard");
        spaceOpsState = mapBackendDashboard(dashboard);
        backendOnline = true;
        renderAll();
        showToast("Connected to SpaceOps CoreOps API.");
    } catch (error) {
        backendOnline = false;
        spaceOpsState = JSON.parse(JSON.stringify(fallbackState));
        renderAll();
        showToast("Backend offline. Running local demo mode.");
    }
}

function updateReadiness(value) {
    spaceOpsState.readiness = Math.min(100, Math.max(0, Number(value) || 0));

    const readinessScore = document.getElementById("readinessScore");
    const briefReadiness = document.getElementById("briefReadiness");
    const orb = document.querySelector(".readiness-orb");

    if (readinessScore) readinessScore.textContent = `${spaceOpsState.readiness}%`;
    if (briefReadiness) briefReadiness.textContent = `${spaceOpsState.readiness}%`;

    if (orb) {
        orb.style.background = `
            radial-gradient(circle at center, var(--panel) 0 52%, transparent 53%),
            conic-gradient(var(--cloud) 0 ${spaceOpsState.readiness}%, rgba(23,33,28,.1) 0)
        `;
    }
}

function renderSiteSelect() {
    const select = document.getElementById("siteSelect");
    if (!select) return;

    const currentValue = select.value || spaceOpsState.activeSiteId;

    select.innerHTML = spaceOpsState.sites
        .map((site) => `<option value="${site.id}">${site.name}</option>`)
        .join("");

    if (spaceOpsState.sites.some((site) => site.id === currentValue)) {
        select.value = currentValue;
        spaceOpsState.activeSiteId = currentValue;
    } else {
        select.value = spaceOpsState.activeSiteId;
    }

    if (!select.dataset.bound) {
        select.dataset.bound = "true";
        select.addEventListener("change", () => {
            spaceOpsState.activeSiteId = select.value;
            renderAll();
            showToast("Active workspace changed.");
        });
    }
}

function renderHero() {
    const site = getActiveSite();
    const siteSummary = document.getElementById("siteSummary");

    if (siteSummary && site) {
        siteSummary.textContent = `${site.location} · ${site.owner} · ${site.status}`;
    }

    document.getElementById("siteCount").textContent = spaceOpsState.sites.length;
    document.getElementById("assetReadiness").textContent = `${spaceOpsState.assets}%`;
    document.getElementById("budgetStatus").textContent = formatCurrency(spaceOpsState.budget);
    document.getElementById("blockerCount").textContent = spaceOpsState.blockers.length;

    document.getElementById("briefSites").textContent = `${spaceOpsState.sites.length} active locations`;
    document.getElementById("briefAssets").textContent = `${spaceOpsState.assets}% ready`;
    document.getElementById("briefBlockers").textContent = `${spaceOpsState.blockers.length} open`;
}

function renderPhases() {
    const phaseList = document.getElementById("phaseList");
    if (!phaseList) return;

    phaseList.innerHTML = spaceOpsState.phases
        .map((phase) => `
            <div class="phase-item">
                <b>${phase.label}</b>
                <div>
                    <strong>${phase.title}</strong>
                    <span>${phase.detail}</span>
                </div>
                <em class="status-pill">${phase.status}</em>
            </div>
        `)
        .join("");
}

function renderBlockers() {
    const blockerList = document.getElementById("blockerList");
    if (!blockerList) return;

    if (!spaceOpsState.blockers.length) {
        blockerList.innerHTML = `
            <div class="blocker-item low">
                <strong>No open blockers</strong>
                <span>All current issues have owners or have been resolved.</span>
                <em class="status-pill">Clear</em>
            </div>
        `;
        document.getElementById("nextActionTitle").textContent = "All launch blockers are clear.";
        document.getElementById("nextActionCopy").textContent = "The workspace portfolio is ready for the next approval step.";
        return;
    }

    blockerList.innerHTML = spaceOpsState.blockers
        .slice(0, 4)
        .map((blocker) => `
            <div class="blocker-item ${blocker.severity === "low" ? "low" : ""}">
                <strong>${blocker.title}</strong>
                <span>${blocker.detail}</span>
                <em class="status-pill">${blocker.owner}</em>
            </div>
        `)
        .join("");

    const next = spaceOpsState.blockers[0];
    document.getElementById("nextActionTitle").textContent = next.title;
    document.getElementById("nextActionCopy").textContent = next.detail;
}

function renderSites() {
    const siteGrid = document.getElementById("siteGrid");
    if (!siteGrid) return;

    siteGrid.innerHTML = spaceOpsState.sites
        .map((site) => `
            <article class="site-card">
                <strong>${site.name}</strong>
                <span>${site.location} · ${site.owner}</span>
                <div class="readiness-bar"><span style="width:${site.readiness}%"></span></div>
                <div class="card-footer">
                    <span>${site.readiness}% ready</span>
                    <span>${site.blockers} blockers</span>
                </div>
                <em class="status-pill">${site.status}</em>
            </article>
        `)
        .join("");
}

function renderVendors() {
    const vendorGrid = document.getElementById("vendorGrid");
    if (!vendorGrid) return;

    vendorGrid.innerHTML = spaceOpsState.vendors
        .map((vendor) => `
            <article class="vendor-card">
                <strong>${vendor.name}</strong>
                <span>${vendor.role}</span>
                <p class="muted">Owner: ${vendor.owner}</p>
                <div class="card-footer">
                    <span>${vendor.status}</span>
                    <span>${vendor.load}</span>
                </div>
            </article>
        `)
        .join("");
}

function renderCloudPipeline() {
    const pipelineFlow = document.getElementById("pipelineFlow");
    if (!pipelineFlow) return;

    pipelineFlow.innerHTML = spaceOpsState.pipeline
        .map((step, index) => `
            <article class="pipeline-step">
                <b>${index + 1}</b>
                <strong>${step.title}</strong>
                <span>${step.detail}</span>
            </article>
        `)
        .join("");
}

function renderHealth() {
    const healthList = document.getElementById("healthList");
    if (!healthList) return;

    healthList.innerHTML = spaceOpsState.health
        .map((item) => `
            <div class="health-item">
                <strong>${item.label}</strong>
                <em>${item.value}</em>
            </div>
        `)
        .join("");
}

function renderAll() {
    renderSiteSelect();
    renderHero();
    renderPhases();
    renderBlockers();
    renderSites();
    renderVendors();
    renderCloudPipeline();
    renderHealth();
    updateReadiness(spaceOpsState.readiness);
}

async function resolveTopBlocker() {
    if (!spaceOpsState.blockers.length) {
        showToast("No open blockers to resolve.");
        return;
    }

    const blocker = spaceOpsState.blockers[0];

    if (backendOnline) {
        try {
            await apiPatch(`/api/blockers/${blocker.id}/resolve`);
            await /* SPACEOPS SCREENSHOT VIEW SUPPORT */
loadDashboardFromBackend().then(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedView = params.get("view");

    if (requestedView && ["command", "sites", "cloud", "vendors", "brief"].includes(requestedView)) {
        window.setTimeout(() => setView(requestedView), 250);
    }
});
            showToast(`${blocker.title} resolved through backend workflow.`);
            return;
        } catch (error) {
            showToast("Backend resolve failed. Using local fallback.");
        }
    }

    spaceOpsState.blockers.shift();
    updateReadiness(spaceOpsState.readiness + 3);
    renderAll();
    showToast(`${blocker.title} marked complete.`);
}

async function runCloudSync() {
    if (backendOnline) {
        try {
            const result = await apiPost("/api/cloud-sync/run");
            await /* SPACEOPS SCREENSHOT VIEW SUPPORT */
loadDashboardFromBackend().then(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedView = params.get("view");

    if (requestedView && ["command", "sites", "cloud", "vendors", "brief"].includes(requestedView)) {
        window.setTimeout(() => setView(requestedView), 250);
    }
});
            showToast(result.message || "Cloud sync completed.");
            return;
        } catch (error) {
            showToast("Cloud sync API failed. Using local simulation.");
        }
    }

    updateReadiness(spaceOpsState.readiness + 1);
    showToast("Local cloud sync simulation complete.");
}

async function refreshSites() {
    if (backendOnline) {
        await runCloudSync();
        return;
    }

    spaceOpsState.sites = spaceOpsState.sites.map((site, index) => ({
        ...site,
        readiness: Math.min(100, site.readiness + (index % 2 === 0 ? 1 : 2))
    }));

    updateReadiness(spaceOpsState.readiness + 1);
    renderAll();
    showToast("Site readiness signals refreshed.");
}

async function rebalanceVendors() {
    if (backendOnline) {
        try {
            await apiPost("/api/vendors/rebalance");
            await /* SPACEOPS SCREENSHOT VIEW SUPPORT */
loadDashboardFromBackend().then(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedView = params.get("view");

    if (requestedView && ["command", "sites", "cloud", "vendors", "brief"].includes(requestedView)) {
        window.setTimeout(() => setView(requestedView), 250);
    }
});
            showToast("Vendor load rebalanced through backend workflow.");
            return;
        } catch (error) {
            showToast("Backend vendor rebalance failed. Using local fallback.");
        }
    }

    spaceOpsState.vendors = spaceOpsState.vendors.map((vendor) => {
        if (vendor.load === "High") return { ...vendor, load: "Medium", status: "Owner Confirmed" };
        return vendor;
    });

    renderAll();
    showToast("Vendor load rebalanced.");
}

function approveLaunchPlan() {
    updateReadiness(spaceOpsState.readiness + 4);
    showToast("Launch plan approved for leadership review.");
}

async function exportBrief() {
    if (backendOnline) {
        window.open(`${getApiBase()}/api/reports/readiness.txt`, "_blank");
        showToast("Backend readiness brief opened.");
        return;
    }

    const brief = [
        "SpaceOps Cloud Workspace Readiness Brief",
        "",
        `Portfolio Readiness: ${spaceOpsState.readiness}%`,
        `Sites Tracked: ${spaceOpsState.sites.length}`,
        `Asset Readiness: ${spaceOpsState.assets}%`,
        `Projected Spend: ${formatCurrency(spaceOpsState.budget)}`,
        `Open Blockers: ${spaceOpsState.blockers.length}`,
        "",
        "Sites:",
        ...spaceOpsState.sites.map((site) => `- ${site.name}: ${site.readiness}% ready | ${site.blockers} blockers | ${site.status}`)
    ].join("\n");

    downloadTextFile("spaceops-workspace-readiness-brief.txt", brief, "text/plain");
    showToast("Readiness brief exported.");
}

function copySummary() {
    const summary = `SpaceOps portfolio readiness is ${spaceOpsState.readiness}% across ${spaceOpsState.sites.length} sites with ${spaceOpsState.blockers.length} open blockers and ${spaceOpsState.assets}% asset readiness.`;

    navigator.clipboard
        .writeText(summary)
        .then(() => showToast("Executive summary copied."))
        .catch(() => showToast("Could not copy summary in this browser."));
}

function downloadTextFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

navButtons.forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
});

document.addEventListener("click", (event) => {
    const actionElement = event.target.closest("[data-action]");
    if (!actionElement) return;

    const action = actionElement.dataset.action;

    if (action === "resolve-blocker") resolveTopBlocker();
    if (action === "refresh-sites") refreshSites();
    if (action === "rebalance-vendors") rebalanceVendors();
});

document.getElementById("syncButton").addEventListener("click", runCloudSync);
document.getElementById("simulateSyncButton").addEventListener("click", runCloudSync);
document.getElementById("finalSyncButton").addEventListener("click", runCloudSync);
document.getElementById("approveLaunchButton").addEventListener("click", approveLaunchPlan);
document.getElementById("exportReportButton").addEventListener("click", exportBrief);
document.getElementById("finalExportButton").addEventListener("click", exportBrief);
document.getElementById("exportCloudBriefButton").addEventListener("click", exportBrief);
document.getElementById("copyBriefButton").addEventListener("click", copySummary);

/* SPACEOPS SCREENSHOT VIEW SUPPORT */
loadDashboardFromBackend().then(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedView = params.get("view");

    if (requestedView && ["command", "sites", "cloud", "vendors", "brief"].includes(requestedView)) {
        window.setTimeout(() => setView(requestedView), 250);
    }
});

