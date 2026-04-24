const summaryItems = [
    { title: "Project Type", text: "Office Renovation Initiative" },
    { title: "Timeline", text: "14 Weeks" },
    { title: "Primary Objective", text: "Improve Workspace Functionality And Employee Experience" },
    { title: "Core Delivery Area", text: "Layout, Lighting, Furnishings, And Compliance Readiness" }
];

const goals = [
    { title: "Enhance Workplace Efficiency", text: "Redesign the office layout to support better communication and collaboration." },
    { title: "Improve Aesthetics", text: "Create a modern and welcoming workspace aligned with company brand values." },
    { title: "Ensure Compliance", text: "Maintain alignment with building codes and workplace safety requirements." },
    { title: "Deliver On Time And Within Budget", text: "Manage project execution carefully across schedule, suppliers, and costs." }
];

const inScope = [
    "Redesign Of Office Layout",
    "Lighting And Electrical Upgrades",
    "Installation Of New Furniture And Fixtures",
    "Painting And Decoration",
    "Coordination With Contractors And Suppliers",
    "Compliance With Local Building Codes And Safety Regulations"
];

const outScope = [
    "Structural Changes To The Building",
    "Major HVAC Upgrades Beyond Minor Adjustments",
    "Renovation Of Areas Outside The Initial Assessment"
];

const phases = [
    { title: "Phase 1: Planning (Weeks 1-4)", text: "Gather stakeholder requirements, assess the current space, and build the project plan with budget and timeline." },
    { title: "Phase 2: Design (Weeks 5-6)", text: "Review layout concepts, collaborate on design choices, and finalize renovation direction." },
    { title: "Phase 3: Procurement (Weeks 7-8)", text: "Source materials, confirm vendor contracts, and lock delivery expectations." },
    { title: "Phase 4: Execution (Weeks 9-12)", text: "Oversee renovation work, perform site checks, and resolve operational issues." },
    { title: "Phase 5: Review And Closure (Weeks 13-14)", text: "Complete final walkthroughs, gather feedback, and document lessons learned." }
];

const metrics = [
    { title: "On-Time Completion", text: "Track how much work is completed against the planned schedule." },
    { title: "Budget Adherence", text: "Compare actual spend against approved budget and contingency limits." },
    { title: "Stakeholder Satisfaction", text: "Review employee and management feedback after handover." },
    { title: "Compliance Success", text: "Confirm inspection pass rates and regulatory alignment." }
];

const risks = [
    { title: "Construction Delays", text: "Mitigation: build schedule buffer and maintain close contractor communication." },
    { title: "Budget Overruns", text: "Mitigation: monitor spend closely and preserve contingency funds." },
    { title: "Compliance Violations", text: "Mitigation: consult compliance experts and secure permits before work starts." },
    { title: "Stakeholder Resistance", text: "Mitigation: involve employees early and explain renovation benefits clearly." }
];

const benefits = [
    { title: "Improved Work Environment", text: "A better space can support morale, comfort, and productivity." },
    { title: "Increased Collaboration", text: "A stronger layout can improve communication and teamwork." },
    { title: "Enhanced Brand Image", text: "A refreshed workspace supports a more professional company presence." }
];

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

function renderCards(containerId, items) {
    const container = document.getElementById(containerId);
    container.innerHTML = items.map(item => `
        <article class="card">
            <h3>${item.title}</h3>
            <p>${item.text}</p>
        </article>
    `).join("");
}

function renderList(containerId, items) {
    const container = document.getElementById(containerId);
    container.innerHTML = items.map(item => `<li>${item}</li>`).join("");
}

document.addEventListener("DOMContentLoaded", () => {
    renderCards("summaryGrid", summaryItems);
    renderCards("goalsGrid", goals);
    renderCards("phasesGrid", phases);
    renderCards("metricsGrid", metrics);
    renderCards("riskGrid", risks);
    renderCards("benefitsGrid", benefits);
    renderList("inScopeList", inScope);
    renderList("outScopeList", outScope);
});
