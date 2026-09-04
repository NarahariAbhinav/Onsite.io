"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("🌱 Starting SiteFlow database seeding...");
    // 1. Organization
    const org = await prisma.organization.upsert({
        where: { code: "SITEFLOW_ORG" },
        create: {
            code: "SITEFLOW_ORG",
            name: "SiteFlow Global Construction",
            industry: "Construction / Real Estate",
        },
        update: {},
    });
    // 2. Default Users & Employee Profiles
    const defaultPassword = await bcryptjs_1.default.hash("siteflow2026!", 10);
    const usersData = [
        { email: "r.menon@siteflow.internal", fullName: "R. Menon", role: client_1.Role.SYSTEM_ADMIN, dept: "Management", desig: "Project Admin" },
        { email: "a.sharma@siteflow.internal", fullName: "A. Sharma", role: client_1.Role.SOP_OWNER, dept: "Civil Engineering", desig: "Chief Process Engineer" },
        { email: "k.iyer@siteflow.internal", fullName: "K. Iyer", role: client_1.Role.QUALITY_MANAGER, dept: "Quality & Assurance", desig: "QA/QC Lead" },
        { email: "s.deshmukh@siteflow.internal", fullName: "S. Deshmukh", role: client_1.Role.PROJECT_MANAGER, dept: "Projects", desig: "Senior Project Manager" },
        { email: "v.patil@siteflow.internal", fullName: "V. Patil", role: client_1.Role.EMPLOYEE_LEARNER, dept: "Civil Execution", desig: "Junior Site Engineer" },
        { email: "m.joshi@siteflow.internal", fullName: "M. Joshi", role: client_1.Role.AUDITOR, dept: "Compliance", desig: "Lead Auditor" },
    ];
    const createdUsers = {};
    for (const u of usersData) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            create: {
                organizationId: org.id,
                email: u.email,
                passwordHash: defaultPassword,
                fullName: u.fullName,
                role: u.role,
                employeeProfile: {
                    create: {
                        employeeCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
                        department: u.dept,
                        designation: u.desig,
                    },
                },
            },
            update: {},
            include: { employeeProfile: true },
        });
        createdUsers[u.role] = user;
    }
    // 3. Document Masters (BRD Section 7.16)
    const docMasters = [
        { documentType: "DRAWING", name: "Approved Architectural Working Drawing", isMandatoryDefault: true },
        { documentType: "DRAWING", name: "Structural Reinforcement Schedule (BBS)", isMandatoryDefault: true },
        { documentType: "BOQ", name: "Bill of Quantities & Material Indent", isMandatoryDefault: false },
        { documentType: "METHOD_STATEMENT", name: "Safe Work Method Statement (SWMS)", isMandatoryDefault: true },
        { documentType: "TEST_REPORT", name: "Concrete Cube Compression Test Certificate (28-Day)", isMandatoryDefault: true },
        { documentType: "CERTIFICATE", name: "Third-Party Ultrasonic Rebar Integrity Clearance", isMandatoryDefault: true },
    ];
    for (const dm of docMasters) {
        await prisma.documentMaster.upsert({
            where: { name: dm.name },
            create: dm,
            update: {},
        });
    }
    // 4. Master SOPs with Steps, Quizzes, Practical Assessments, and Audit Templates
    const sopsData = [
        {
            code: "SOP-CIV-001",
            title: "Excavation & Foundation Shoring SOP",
            department: "Civil",
            criticality: client_1.Severity.HIGH,
            steps: [
                { stepNumber: 1, title: "Site clearance & trench demarcation", instructions: "Clear organic topsoil and mark outer trench lines with lime as per approved grid drawing." },
                { stepNumber: 2, title: "Underground utility verification", instructions: "Cross-check municipal electricity, plumbing and fiber gas drawings using cable radar detector." },
                { stepNumber: 3, title: "Layered mechanical excavation", instructions: "Excavate in 1.5m lifts while securing trench side slopes with strutted wooden shoring." },
                { stepNumber: 4, title: "Trench dewatering & pit dry inspection", instructions: "Operate submersible slurry pumps to prevent waterlogging before PCC bed casting." },
                { stepNumber: 5, title: "Bed level survey & geotechnical sign-off", instructions: "Take reduced levels with auto-level instrument and verify safe bearing capacity." },
            ],
            quiz: {
                title: "Excavation Safety & Procedure Competency",
                passingPct: 80,
                maxAttempts: 3,
                questions: [
                    {
                        orderIndex: 1,
                        questionText: "What is the maximum lift height before shoring must be reinforced?",
                        options: ["1.5 meters", "3.0 meters", "5.0 meters", "0.5 meters"],
                        correctAnswer: "1.5 meters",
                        marks: 1,
                    },
                    {
                        orderIndex: 2,
                        questionText: "True or False: Underground utility detection is optional if manual digging is used.",
                        options: ["True", "False"],
                        correctAnswer: "False",
                        marks: 1,
                    },
                ],
            },
            assessment: {
                title: "Practical Simulation: Site Trench Inspection & Slope Check",
                assessmentType: "SIMULATION",
                scenarioDescription: "Simulate a 3.0m deep excavation encountering unexpected water seepage. Outline immediate containment, shoring installation, and dewatering log entries.",
                expectedOutputs: "Submission of slope stability verification log, pump discharge record, and engineer sign-off note.",
            },
            audit: {
                title: "Excavation Safety Audit Template",
                checkpoints: [
                    { checkpointText: "Perimeter barricading and warning tape installed", expectedControl: "Continuous 1.2m rigid guardrail around pit", severity: client_1.Severity.CRITICAL },
                    { checkpointText: "Trench shoring integrity verified", expectedControl: "Strut deflection within allowable 5mm limits", severity: client_1.Severity.HIGH },
                ],
            },
        },
        {
            code: "SOP-CIV-002",
            title: "RCC Column & Beam Concreting SOP",
            department: "Civil",
            criticality: client_1.Severity.CRITICAL,
            steps: [
                { stepNumber: 1, title: "Rebar spacing and cover block inspection", instructions: "Verify clear cover (40mm for columns, 25mm for beams) using PVC/concrete spacers." },
                { stepNumber: 2, title: "Formwork alignment & tightness check", instructions: "Check shuttering plumbness with plumb bob; seal form joints with foam tape to prevent grout leakage." },
                { stepNumber: 3, title: "Slump test & batch slip verification", instructions: "Check concrete workability on site (target slump 120 ± 25mm) before discharge from transit mixer." },
                { stepNumber: 4, title: "Continuous mechanical compaction", instructions: "Immerse 60mm needle vibrator vertically in 300mm layers without touching rebar bars." },
                { stepNumber: 5, title: "Cube sample casting & 28-day water curing", instructions: "Cast 6 sample test cubes per 50m³; submerge in curing tank after 24-hour demoulding." },
            ],
            quiz: {
                title: "RCC Quality Control & Compaction Quiz",
                passingPct: 80,
                maxAttempts: 3,
                questions: [
                    {
                        orderIndex: 1,
                        questionText: "What is the standard clear cover requirement for RCC columns?",
                        options: ["20mm", "40mm", "15mm", "75mm"],
                        correctAnswer: "40mm",
                        marks: 1,
                    },
                    {
                        orderIndex: 2,
                        questionText: "How long must test cubes be immersed in curing water before 28-day compression testing?",
                        options: ["7 days", "14 days", "28 days", "3 days"],
                        correctAnswer: "28 days",
                        marks: 1,
                    },
                ],
            },
            assessment: {
                title: "Concrete Slump & Cover Block Practical Checklist",
                assessmentType: "PRACTICAL_OBSERVATION",
                scenarioDescription: "Perform live slump cone measurement on delivery transit mixer and verify cover spacer distribution on column reinforcement.",
                expectedOutputs: "Slump cone test log sheet with batch plant receipt and photo verification.",
            },
            audit: {
                title: "RCC Concreting Audit Template",
                checkpoints: [
                    { checkpointText: "Slump test conducted for every 30m³ batch", expectedControl: "Logged slump between 100-140mm", severity: client_1.Severity.HIGH },
                    { checkpointText: "Formwork plumb and leak-tight", expectedControl: "Zero slurry leakage at base seams", severity: client_1.Severity.CRITICAL },
                ],
            },
        },
    ];
    for (const s of sopsData) {
        const existingSop = await prisma.sop.findUnique({ where: { code: s.code } });
        if (!existingSop) {
            const sop = await prisma.sop.create({
                data: {
                    organizationId: org.id,
                    code: s.code,
                    title: s.title,
                    department: s.department,
                    ownerId: createdUsers[client_1.Role.SOP_OWNER].id,
                    criticality: s.criticality,
                },
            });
            const version = await prisma.sopVersion.create({
                data: {
                    sopId: sop.id,
                    versionNumber: "V1.0",
                    lifecycleStatus: client_1.SopLifecycleStatus.EFFECTIVE,
                    createdById: createdUsers[client_1.Role.SOP_OWNER].id,
                    effectiveDate: new Date(),
                    steps: {
                        create: s.steps,
                    },
                },
            });
            await prisma.sop.update({
                where: { id: sop.id },
                data: { currentVersionId: version.id },
            });
            // Quiz
            if (s.quiz) {
                await prisma.quiz.create({
                    data: {
                        sopVersionId: version.id,
                        title: s.quiz.title,
                        passingPct: s.quiz.passingPct,
                        maxAttempts: s.quiz.maxAttempts,
                        questions: {
                            create: s.quiz.questions,
                        },
                    },
                });
            }
            // Practical Assessment
            if (s.assessment) {
                await prisma.assessmentTemplate.create({
                    data: {
                        sopVersionId: version.id,
                        title: s.assessment.title,
                        assessmentType: s.assessment.assessmentType,
                        scenarioDescription: s.assessment.scenarioDescription,
                        expectedOutputs: s.assessment.expectedOutputs,
                    },
                });
            }
            // Audit Template
            if (s.audit) {
                await prisma.auditTemplate.create({
                    data: {
                        sopVersionId: version.id,
                        title: s.audit.title,
                        checkpoints: {
                            create: s.audit.checkpoints,
                        },
                    },
                });
            }
        }
    }
    // 5. Sample Projects
    const projectsData = [
        {
            code: "PRJ-GVR-01",
            name: "Green Valley Residency",
            location: "Kharghar Sector 10, Navi Mumbai",
            lat: 19.0473,
            lng: 73.0699,
            areaAcres: 4.8,
            floors: 24,
            flats: 192,
            amenities: ["Swimming Pool", "Gym", "Club House", "Power Backup"],
            startDate: new Date("2025-01-15"),
            endDate: new Date("2026-12-30"),
            status: client_1.ProjectStatus.IN_PROGRESS,
        },
        {
            code: "PRJ-SNT-02",
            name: "Sunrise Towers",
            location: "Whitefield Hope Farm, Bengaluru",
            lat: 12.9856,
            lng: 77.7371,
            areaAcres: 6.2,
            floors: 32,
            flats: 384,
            amenities: ["Children's Play Area", "Club House", "Parking", "Landscaped Garden"],
            startDate: new Date("2024-08-01"),
            endDate: new Date("2027-03-31"),
            status: client_1.ProjectStatus.IN_PROGRESS,
        },
    ];
    for (const p of projectsData) {
        await prisma.project.upsert({
            where: { code: p.code },
            create: {
                organizationId: org.id,
                managerId: createdUsers[client_1.Role.PROJECT_MANAGER].id,
                ...p,
            },
            update: {},
        });
    }
    console.log("✅ SiteFlow database seeding completed successfully!");
}
main()
    .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
