from __future__ import annotations

import json
import math
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
SCENE_DIR = ROOT / "scenes"

PALETTE = {
    "primary_fill": "#dbeafe",
    "primary_stroke": "#1e3a5f",
    "secondary_fill": "#bfdbfe",
    "tertiary_fill": "#eff6ff",
    "start_fill": "#fed7aa",
    "start_stroke": "#c2410c",
    "success_fill": "#a7f3d0",
    "success_stroke": "#047857",
    "decision_fill": "#fef3c7",
    "decision_stroke": "#b45309",
    "warning_fill": "#fee2e2",
    "warning_stroke": "#dc2626",
    "external_fill": "#fed7aa",
    "external_stroke": "#c2410c",
    "dark": "#1e293b",
    "title": "#1e40af",
    "body": "#374151",
    "muted": "#64748b",
    "white": "#ffffff",
}


class Diagram:
    def __init__(self, title: str, subtitle: str = "", width: int = 1400, height: int = 900):
        self.title = title
        self.subtitle = subtitle
        self.width = width
        self.height = height
        self.elements: list[dict[str, Any]] = []
        self.counter = 1
        self.text(40, 28, title, 30, PALETTE["title"], width=900, bold=True)
        if subtitle:
            self.text(42, 70, subtitle, 15, PALETTE["muted"], width=1000)

    def _id(self, prefix: str) -> str:
        value = f"{prefix}_{self.counter:04d}"
        self.counter += 1
        return value

    def _base(self, typ: str, x: float, y: float, w: float, h: float) -> dict[str, Any]:
        seed = 1000 + self.counter * 17
        return {
            "id": self._id(typ),
            "type": typ,
            "x": x,
            "y": y,
            "width": w,
            "height": h,
            "angle": 0,
            "strokeColor": PALETTE["primary_stroke"],
            "backgroundColor": "transparent",
            "fillStyle": "solid",
            "strokeWidth": 2,
            "strokeStyle": "solid",
            "roughness": 0,
            "opacity": 100,
            "groupIds": [],
            "frameId": None,
            "roundness": {"type": 3},
            "seed": seed,
            "version": 1,
            "versionNonce": seed + 10,
            "isDeleted": False,
            "boundElements": None,
            "updated": 1,
            "link": None,
            "locked": False,
        }

    def text(
        self,
        x: float,
        y: float,
        value: str,
        size: int = 16,
        color: str = PALETTE["body"],
        width: float = 180,
        align: str = "left",
        bold: bool = False,
    ) -> str:
        lines = value.count("\n") + 1
        height = max(24, lines * size * 1.35)
        el = self._base("text", x, y, width, height)
        el.update(
            {
                "text": value,
                "originalText": value,
                "fontSize": size,
                "fontFamily": 3,
                "textAlign": align,
                "verticalAlign": "middle",
                "strokeColor": color,
                "backgroundColor": "transparent",
                "containerId": None,
                "lineHeight": 1.25,
                "fontWeight": 700 if bold else 400,
            }
        )
        self.elements.append(el)
        return el["id"]

    def rect(
        self,
        x: float,
        y: float,
        w: float,
        h: float,
        label: str,
        fill: str = PALETTE["tertiary_fill"],
        stroke: str = PALETTE["primary_stroke"],
        size: int = 16,
    ) -> str:
        box = self._base("rectangle", x, y, w, h)
        box.update({"backgroundColor": fill, "strokeColor": stroke})
        self.elements.append(box)
        self.text(x + 12, y + h / 2 - 18, label, size, PALETTE["body"], width=w - 24, align="center")
        return box["id"]

    def ellipse(
        self,
        x: float,
        y: float,
        w: float,
        h: float,
        label: str,
        fill: str = PALETTE["start_fill"],
        stroke: str = PALETTE["start_stroke"],
        size: int = 16,
    ) -> str:
        el = self._base("ellipse", x, y, w, h)
        el.update({"backgroundColor": fill, "strokeColor": stroke})
        self.elements.append(el)
        self.text(x + 10, y + h / 2 - 18, label, size, PALETTE["body"], width=w - 20, align="center")
        return el["id"]

    def diamond(
        self,
        x: float,
        y: float,
        w: float,
        h: float,
        label: str,
        size: int = 15,
    ) -> str:
        el = self._base("diamond", x, y, w, h)
        el.update({"backgroundColor": PALETTE["decision_fill"], "strokeColor": PALETTE["decision_stroke"]})
        self.elements.append(el)
        self.text(x + 20, y + h / 2 - 20, label, size, PALETTE["body"], width=w - 40, align="center")
        return el["id"]

    def line(self, x1: float, y1: float, x2: float, y2: float, color: str = PALETTE["muted"], width: int = 2) -> str:
        el = self._base("line", x1, y1, x2 - x1, y2 - y1)
        el.update(
            {
                "strokeColor": color,
                "strokeWidth": width,
                "points": [[0, 0], [x2 - x1, y2 - y1]],
                "roundness": None,
            }
        )
        self.elements.append(el)
        return el["id"]

    def arrow(
        self,
        x1: float,
        y1: float,
        x2: float,
        y2: float,
        label: str = "",
        color: str = PALETTE["primary_stroke"],
        width: int = 2,
        points: list[list[float]] | None = None,
    ) -> str:
        if points is None:
            points = [[0, 0], [x2 - x1, y2 - y1]]
        el = self._base("arrow", x1, y1, x2 - x1, y2 - y1)
        el.update(
            {
                "strokeColor": color,
                "strokeWidth": width,
                "points": points,
                "startArrowhead": None,
                "endArrowhead": "arrow",
                "roundness": {"type": 2},
            }
        )
        self.elements.append(el)
        if label:
            lx = min(x1, x2) + abs(x2 - x1) / 2 - 70
            ly = min(y1, y2) + abs(y2 - y1) / 2 - 24
            self.text(lx, ly, label, 13, PALETTE["muted"], width=150, align="center")
        return el["id"]

    def section(self, x: float, y: float, w: float, h: float, label: str) -> str:
        el = self._base("rectangle", x, y, w, h)
        el.update(
            {
                "backgroundColor": "transparent",
                "strokeColor": "#94a3b8",
                "strokeWidth": 1,
                "strokeStyle": "dashed",
            }
        )
        self.elements.append(el)
        self.text(x + 14, y + 12, label, 17, PALETTE["title"], width=w - 28, bold=True)
        return el["id"]

    def timeline(self, x: float, y: float, labels: list[str], gap: float = 145) -> None:
        self.line(x, y, x + gap * (len(labels) - 1), y, PALETTE["primary_stroke"], 2)
        for idx, label in enumerate(labels):
            cx = x + gap * idx
            dot = self._base("ellipse", cx - 7, y - 7, 14, 14)
            dot.update({"backgroundColor": PALETTE["primary_stroke"], "strokeColor": PALETTE["primary_stroke"]})
            self.elements.append(dot)
            self.text(cx - 55, y + 20, label, 13, PALETTE["body"], width=110, align="center")

    def scene(self) -> dict[str, Any]:
        return {
            "type": "excalidraw",
            "version": 2,
            "source": "https://excalidraw.com",
            "elements": self.elements,
            "appState": {
                "viewBackgroundColor": "#ffffff",
                "gridSize": 20,
                "exportBackground": True,
            },
            "files": {},
        }


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def save(name: str, diagram: Diagram) -> None:
    SCENE_DIR.mkdir(parents=True, exist_ok=True)
    path = SCENE_DIR / f"{name}.excalidraw"
    path.write_text(json.dumps(diagram.scene(), indent=2), encoding="utf-8")


def flow_diagram(title: str, subtitle: str, steps: list[str], filename: str, decisions: set[int] | None = None) -> None:
    decisions = decisions or set()
    d = Diagram(title, subtitle, width=1500, height=720)
    x, y = 70, 250
    step_w, step_h, gap = 155, 82, 55
    centers = []
    for i, step in enumerate(steps):
        sx = x + i * (step_w + gap)
        if i in decisions:
            d.diamond(sx, y - 16, step_w, step_h + 32, step, 13)
        elif i == 0:
            d.ellipse(sx, y, step_w, step_h, step, PALETTE["start_fill"], PALETTE["start_stroke"], 14)
        elif i == len(steps) - 1:
            d.ellipse(sx, y, step_w, step_h, step, PALETTE["success_fill"], PALETTE["success_stroke"], 14)
        else:
            d.rect(sx, y, step_w, step_h, step, PALETTE["tertiary_fill"], PALETTE["primary_stroke"], 14)
        centers.append((sx + step_w, y + step_h / 2, sx, y + step_h / 2))
    for i in range(len(steps) - 1):
        d.arrow(centers[i][0] + 4, centers[i][1], centers[i + 1][2] - 10, centers[i + 1][3])
    d.text(90, 430, "Design note: Each step writes or reads controlled records before the next action proceeds.", 15, PALETTE["muted"], width=760)
    save(filename, d)


def chapter2_client_server() -> None:
    d = Diagram("Figure 2.1: Client-Server Architecture", "Conceptual view of centralized backend services with distributed clients.")
    d.section(55, 125, 370, 540, "Client Layer")
    d.rect(110, 205, 230, 80, "Operations Dashboard\n(web client)", PALETTE["primary_fill"])
    d.rect(110, 340, 230, 80, "Mobile Application\n(student/staff client)", PALETTE["primary_fill"])
    d.rect(110, 475, 230, 80, "Public Portal\n(public web client)", PALETTE["primary_fill"])
    d.section(520, 145, 350, 500, "Server Layer")
    d.rect(595, 245, 210, 95, "Centralized Backend\nbusiness rules + APIs", PALETTE["secondary_fill"])
    d.rect(595, 430, 210, 80, "Authentication\nand authorization", PALETTE["decision_fill"], PALETTE["decision_stroke"])
    d.section(965, 150, 340, 490, "Data and Services")
    d.rect(1025, 220, 220, 80, "Relational Database", PALETTE["success_fill"], PALETTE["success_stroke"])
    d.rect(1025, 350, 220, 80, "Queue and Cache", PALETTE["tertiary_fill"])
    d.rect(1025, 480, 220, 80, "External Payment\nGateway", PALETTE["external_fill"], PALETTE["external_stroke"])
    for yy in (245, 380, 515):
        d.arrow(345, yy, 590, 290, "HTTP / API")
    d.arrow(805, 290, 1020, 260, "read/write")
    d.arrow(805, 470, 1020, 390, "jobs/cache")
    d.arrow(805, 325, 1020, 520, "payment events")
    save("figure-2-1-client-server-architecture", d)


def chapter2_rest_api() -> None:
    d = Diagram("Figure 2.3: REST API Architecture", "Stateless request and response flow between mobile clients and backend resources.")
    d.rect(80, 265, 220, 95, "Mobile Application\nJSON request", PALETTE["primary_fill"])
    d.rect(390, 210, 240, 85, "API Routes\n/api/mobile/*", PALETTE["tertiary_fill"])
    d.rect(390, 390, 240, 85, "Sanctum Token\nAuthentication", PALETTE["decision_fill"], PALETTE["decision_stroke"])
    d.rect(730, 265, 240, 95, "Controllers +\nAPI Resources", PALETTE["secondary_fill"])
    d.rect(1080, 250, 230, 110, "PostgreSQL\nstudent, permit,\npayment records", PALETTE["success_fill"], PALETTE["success_stroke"])
    d.arrow(300, 305, 390, 250, "request")
    d.arrow(300, 330, 390, 430, "bearer token")
    d.arrow(630, 250, 730, 305, "validated")
    d.arrow(630, 430, 730, 330, "authorized")
    d.arrow(970, 305, 1080, 305, "query/update")
    d.arrow(1080, 360, 300, 390, "JSON response", points=[[0, 0], [-370, 105], [-780, 20]])
    d.timeline(120, 570, ["Request", "Validate", "Authorize", "Process", "Respond"], 220)
    save("figure-2-3-rest-api-architecture", d)


def chapter2_rbac() -> None:
    d = Diagram("Figure 2.4: Role-Based Access Control Model", "Users receive roles, roles contain permissions, and permissions protect operations.")
    d.section(60, 170, 310, 590, "User Roles")
    roles = [("Super Admin", 250), ("Admin", 370), ("Staff", 490), ("Student", 610)]
    for label, y in roles:
        d.rect(120, y, 180, 70, label, PALETTE["primary_fill"])
    d.section(500, 170, 330, 590, "Permission Sets")
    perms = [("Manage roles\nand settings", 230), ("Manage students\nand permits", 350), ("Verify permits\nand NFC cards", 470), ("Vote, request permit,\nview content", 590)]
    for label, y in perms:
        d.rect(575, y + 10, 185, 75, label, PALETTE["decision_fill"], PALETTE["decision_stroke"], 14)
    d.section(960, 170, 330, 590, "Protected Resources")
    resources = [("Operations Dashboard", 250), ("Permit + Payment\nWorkflows", 370), ("Verification Logs\nand Audit Logs", 490), ("Mobile Student\nServices", 610)]
    for label, y in resources:
        d.rect(1030, y, 200, 75, label, PALETTE["success_fill"], PALETTE["success_stroke"], 14)
    for i, (_, y) in enumerate(roles):
        d.arrow(300, y + 35, 575, perms[i][1] + 45)
        d.arrow(760, perms[i][1] + 45, 1030, resources[i][1] + 35)
    save("figure-2-4-rbac-model", d)


def chapter2_nfc() -> None:
    flow_diagram(
        "Figure 2.2: NFC Verification Workflow",
        "Conceptual NFC verification from card tap to backend response.",
        ["NFC Card", "Android Device\nreads UID", "Verification\nrequest", "Backend\nvalidation", "Permit status\nlookup", "Verification\nresult"],
        "figure-2-2-nfc-verification-workflow",
    )


def chapter3_manual_existing() -> None:
    flow_diagram(
        "Figure 3.1: Existing Manual Permit Issuance Workflow",
        "Manual permit process before the proposed centralized platform.",
        ["Student\nrequest", "Manual payment\nconfirmation", "Officer\nreview", "Paper or\nspreadsheet record", "Physical permit\ndelivery", "Manual\nverification"],
        "figure-3-1-existing-manual-permit-issuance-workflow",
        {1, 2},
    )


def chapter3_overall() -> None:
    d = Diagram("Figure 3.2: Overall System Architecture", "Project-specific architecture for dashboard, public portal, mobile API, payments, NFC, queues, and data storage.", 1500, 980)
    d.section(55, 135, 365, 670, "Access Surfaces")
    d.rect(105, 210, 240, 82, "Operations Dashboard\nLaravel + React/Inertia", PALETTE["primary_fill"], size=14)
    d.rect(105, 360, 240, 82, "Public Portal\npublished content + requests", PALETTE["primary_fill"], size=14)
    d.rect(105, 510, 240, 82, "Mobile Application\nExpo React Native", PALETTE["primary_fill"], size=14)
    d.rect(105, 660, 240, 82, "NFC Verification Layer\nmobile scanner + card UID", PALETTE["start_fill"], PALETTE["start_stroke"], size=14)
    d.section(515, 135, 405, 670, "Application Core")
    d.rect(585, 210, 260, 95, "Laravel Backend\ncontrollers, policies,\ndomain actions", PALETTE["secondary_fill"], size=14)
    d.rect(585, 375, 260, 85, "Mobile API\nSanctum protected routes", PALETTE["tertiary_fill"], size=14)
    d.rect(585, 535, 260, 85, "Security Controls\nRBAC, validation, rate limits", PALETTE["decision_fill"], PALETTE["decision_stroke"], size=14)
    d.rect(585, 680, 260, 75, "Audit Logging\nsensitive workflow events", PALETTE["success_fill"], PALETTE["success_stroke"], size=14)
    d.section(1015, 135, 405, 670, "Data and External Services")
    d.rect(1085, 205, 245, 90, "PostgreSQL Database\nstudents, permits, votes,\npayments, logs", PALETTE["success_fill"], PALETTE["success_stroke"], size=14)
    d.rect(1085, 360, 245, 80, "Paystack\npayment gateway", PALETTE["external_fill"], PALETTE["external_stroke"], size=15)
    d.rect(1085, 505, 245, 80, "Queue Workers\nemails, background jobs", PALETTE["tertiary_fill"], size=14)
    d.rect(1085, 650, 245, 80, "Cache Layer\nsummaries, public content", PALETTE["tertiary_fill"], size=14)
    for yy in (250, 400):
        d.arrow(345, yy, 585, yy, "web request")
    d.arrow(345, 550, 585, 415, "API request")
    d.arrow(345, 700, 585, 575, "verify")
    d.arrow(845, 255, 1085, 250, "read/write")
    d.arrow(845, 420, 1085, 400, "payment init")
    d.arrow(845, 570, 1085, 545, "dispatch")
    d.arrow(845, 710, 1085, 690, "cache")
    d.arrow(1210, 360, 845, 420, "callback/webhook", PALETTE["external_stroke"], points=[[0, 0], [-175, 0], [-365, 60]])
    save("figure-3-2-overall-system-architecture", d)


def chapter3_dashboard_mobile() -> None:
    d = Diagram("Figure 3.3: Dashboard and Mobile Interaction Architecture", "Separate user surfaces share backend rules while preserving role-specific access.")
    d.section(60, 155, 330, 490, "Dashboard Users")
    d.rect(120, 245, 210, 80, "Executives\nAdministrators\nStaff", PALETTE["primary_fill"])
    d.rect(120, 405, 210, 80, "Session Auth\nweb middleware", PALETTE["decision_fill"], PALETTE["decision_stroke"])
    d.section(505, 155, 330, 490, "Mobile Users")
    d.rect(565, 225, 210, 80, "Students\npermit + elections", PALETTE["primary_fill"])
    d.rect(565, 365, 210, 80, "Staff Operations\nverification + NFC", PALETTE["primary_fill"])
    d.rect(565, 505, 210, 80, "Sanctum Token\nmobile API", PALETTE["decision_fill"], PALETTE["decision_stroke"])
    d.section(955, 155, 360, 490, "Shared Backend")
    d.rect(1025, 230, 220, 80, "Policies +\nPermissions", PALETTE["decision_fill"], PALETTE["decision_stroke"])
    d.rect(1025, 365, 220, 80, "Domain Actions\nshared workflows", PALETTE["secondary_fill"])
    d.rect(1025, 500, 220, 80, "Models + Database\nsingle source of truth", PALETTE["success_fill"], PALETTE["success_stroke"])
    d.arrow(330, 285, 1025, 270, "role protected")
    d.arrow(330, 445, 1025, 405, "dashboard action")
    d.arrow(775, 545, 1025, 405, "API action")
    d.arrow(1245, 405, 1245, 500, "persist")
    d.arrow(1025, 540, 775, 545, "scoped response", points=[[0, 0], [-120, 90], [-250, 5]])
    save("figure-3-3-dashboard-and-mobile-interaction-architecture", d)


def chapter3_erd() -> None:
    d = Diagram("Figure 3.4: Entity Relationship Diagram of the Proposed System", "Core relational entities and major foreign-key relationships.", 1600, 1200)
    cols = [70, 390, 710, 1030, 1310]
    y1, y2, y3 = 155, 430, 710
    entities = {
        "users": (cols[0], y1, ["PK id", "email", "role"]),
        "students": (cols[1], y1, ["PK id", "FK user_id", "student_number"]),
        "permits": (cols[2], y1, ["PK id", "FK student_id", "status"]),
        "permit_requests": (cols[3], y1, ["PK id", "FK student_id", "status"]),
        "payments": (cols[4], y1, ["PK id", "FK permit_request_id", "reference"]),
        "nfc_cards": (cols[1], y2, ["PK id", "FK student_id", "uid_hash", "status"]),
        "verification_logs": (cols[2], y2, ["PK id", "FK student_id", "method", "result"]),
        "audit_logs": (cols[3], y2, ["PK id", "FK user_id", "event"]),
        "elections": (cols[0], y3, ["PK id", "status", "period"]),
        "election_positions": (cols[1], y3, ["PK id", "FK election_id"]),
        "election_candidates": (cols[2], y3, ["PK id", "FK position_id", "FK student_id"]),
        "election_votes": (cols[3], y3, ["PK id", "FK candidate_id", "FK student_id"]),
        "announcements": (cols[0], 985, ["PK id", "visibility", "status"]),
        "events": (cols[1], 985, ["PK id", "visibility", "status"]),
        "documents": (cols[2], 985, ["PK id", "visibility", "status"]),
    }

    def entity_box(name: str, x: float, y: float, fields: list[str]) -> None:
        box = d._base("rectangle", x, y, 230, 145)
        box.update({"backgroundColor": PALETTE["primary_fill"], "strokeColor": PALETTE["primary_stroke"]})
        d.elements.append(box)
        d.text(x + 18, y + 18, name, 16, PALETTE["body"], width=195, align="center", bold=True)
        d.line(x + 18, y + 50, x + 212, y + 50, PALETTE["muted"], 1)
        d.text(x + 18, y + 64, "\n".join(fields), 12, PALETTE["muted"], width=195)

    for name, (x, y, fields) in entities.items():
        entity_box(name, x, y, fields)
    arrows = [
        ("users", "students", "1:1"),
        ("students", "permits", "1:M"),
        ("students", "permit_requests", "1:M"),
        ("permit_requests", "payments", "1:M"),
        ("students", "nfc_cards", "1:M"),
        ("students", "verification_logs", "1:M"),
        ("users", "audit_logs", "1:M"),
        ("elections", "election_positions", "1:M"),
        ("election_positions", "election_candidates", "1:M"),
        ("election_candidates", "election_votes", "1:M"),
        ("students", "election_candidates", "1:M"),
        ("students", "election_votes", "1:M"),
    ]
    def center(key: str) -> tuple[float, float]:
        x, y, _ = entities[key]
        return x + 110, y + 68
    for a, b, label in arrows:
        ax, ay = center(a)
        bx, by = center(b)
        d.arrow(ax, ay, bx, by, "", width=1)
        d.text((ax + bx) / 2 - 22, (ay + by) / 2 - 20, label, 12, PALETTE["muted"], width=45, align="center")
    d.text(1125, 985, "Content entities are published\nthrough the public portal and\nmobile content endpoints.", 15, PALETTE["muted"], width=320)
    save("figure-3-4-entity-relationship-diagram", d)


def chapter3_workflows() -> None:
    flow_diagram("Figure 3.5: Permit Request and Payment Workflow", "Self-service permit request from student action to issued permit.", ["Student\nrequest", "Validate\neligibility", "Initialize\npayment", "Paystack", "Verify\npayment", "Issue\npermit", "Audit log"], "figure-3-5-permit-request-and-payment-workflow", {1, 4})
    flow_diagram("Figure 3.6: Paystack Verification Flow", "Payment verification uses callbacks, webhooks, and idempotent backend checks.", ["Create\ntransaction", "Redirect to\nPaystack", "Callback\nor webhook", "Server-side\nverify", "Duplicate\ncheck", "Success or\nfailure state"], "figure-3-6-paystack-verification-flow", {3, 4})
    flow_diagram("Figure 3.7: NFC Verification Workflow", "NFC identifiers are normalized and hashed before student and permit validation.", ["Scan NFC\ncard", "Read UID", "Normalize +\nhash UID", "Lookup active\ncard", "Resolve\nstudent", "Validate\npermit", "Return result\nand log"], "figure-3-7-nfc-verification-workflow", {3, 5})
    flow_diagram("Figure 3.8: Election Voting Workflow", "Election voting checks eligibility before immutable vote storage.", ["Authenticate\nstudent", "Load active\nelection", "Eligibility\nchecks", "Retrieve\ncandidates", "Confirm\nvote", "Immutable\nstorage", "Result\nhandling"], "figure-3-8-election-voting-workflow", {2, 4})
    flow_diagram("Figure 3.9: Mobile API Communication Flow", "Mobile requests pass through token authentication, protected routes, resources, and database records.", ["Mobile app", "Bearer token", "Protected\nroutes", "Controller", "API\nresource", "Database", "JSON\nresponse"], "figure-3-9-mobile-api-communication-flow", {1, 2})


def chapter3_security() -> None:
    d = Diagram("Figure 3.10: Security and Verification Architecture", "Layered controls for authentication, authorization, sensitive identifiers, and auditability.", 1500, 900)
    d.section(70, 160, 300, 560, "Request Entry")
    d.rect(125, 245, 190, 75, "Dashboard\nsession", PALETTE["primary_fill"])
    d.rect(125, 395, 190, 75, "Mobile API\nSanctum token", PALETTE["primary_fill"])
    d.rect(125, 545, 190, 75, "Public portal\nlimited routes", PALETTE["primary_fill"])
    d.section(505, 160, 380, 560, "Security Controls")
    controls = [("RBAC\nroles + permissions", 225), ("Middleware\nroute protection", 345), ("Validation\nForm Requests", 465), ("Rate limiting\nAPI protection", 585)]
    for label, y in controls:
        d.rect(585, y, 220, 70, label, PALETTE["decision_fill"], PALETTE["decision_stroke"], 14)
    d.section(1015, 160, 350, 560, "Integrity Records")
    d.rect(1085, 230, 210, 75, "Hashed permit\ncodes", PALETTE["success_fill"], PALETTE["success_stroke"], 14)
    d.rect(1085, 350, 210, 75, "Hashed NFC\nUIDs", PALETTE["success_fill"], PALETTE["success_stroke"], 14)
    d.rect(1085, 470, 210, 75, "Audit logs", PALETTE["success_fill"], PALETTE["success_stroke"], 14)
    d.rect(1085, 590, 210, 75, "Queue isolation\nsafe logs", PALETTE["tertiary_fill"], size=14)
    for sy in (282, 432, 582):
        d.arrow(315, sy, 585, 260)
        d.arrow(315, sy, 585, 380)
    for sy in (260, 380, 500, 620):
        d.arrow(805, sy, 1085, sy + 5)
    save("figure-3-10-security-and-verification-architecture", d)


def chapter3_queue_cache() -> None:
    d = Diagram("Figure 3.11: Queue and Cache Architecture", "Asynchronous work and cache invalidation used for performance and operational reliability.", 1450, 850)
    d.rect(90, 255, 230, 85, "Application Event\npermit, payment,\ncontent, election", PALETTE["start_fill"], PALETTE["start_stroke"], 14)
    d.rect(430, 190, 230, 80, "Queue Jobs\nnotifications + reports", PALETTE["primary_fill"], size=14)
    d.rect(430, 375, 230, 80, "Cache Layer\nsummaries + public content", PALETTE["tertiary_fill"], size=14)
    d.rect(775, 190, 230, 80, "Queue Worker\nprocesses jobs", PALETTE["secondary_fill"], size=14)
    d.rect(775, 375, 230, 80, "Cache Invalidation\nstate changes", PALETTE["decision_fill"], PALETTE["decision_stroke"], size=14)
    d.rect(1120, 190, 230, 80, "Email / Background\nside effects", PALETTE["success_fill"], PALETTE["success_stroke"], size=14)
    d.rect(1120, 375, 230, 80, "Dashboard/Public\nfresh summaries", PALETTE["success_fill"], PALETTE["success_stroke"], size=14)
    d.rect(590, 595, 250, 80, "Scheduled Tasks\ncleanup + recurring checks", PALETTE["primary_fill"], size=14)
    d.arrow(320, 295, 430, 230, "dispatch")
    d.arrow(320, 310, 430, 415, "cache read")
    d.arrow(660, 230, 775, 230, "run")
    d.arrow(660, 415, 775, 415, "invalidate")
    d.arrow(1005, 230, 1120, 230, "send")
    d.arrow(1005, 415, 1120, 415, "refresh")
    d.arrow(715, 595, 890, 455, "scheduled\nupdates")
    save("figure-3-11-queue-and-cache-architecture", d)


def chapter4_workflows() -> None:
    flow_diagram("Figure 4.3: Student Account Activation Workflow", "Student account setup from dashboard creation to active login credentials.", ["Create\nstudent", "Generate\nactivation token", "Email\nnotification", "Password\nsetup", "Activate\naccount", "Student\nlogin"], "figure-4-3-student-account-activation-workflow", {3})
    flow_diagram("Figure 4.5: Permit Verification Workflow", "Implementation-focused verification flow for permit code, student number, and NFC methods.", ["Submit\nidentifier", "Select method", "Normalize or\nhash value", "Lookup\nrecord", "Validate\npermit", "Return result\nand log"], "figure-4-5-permit-verification-workflow", {1, 4})
    flow_diagram("Figure 4.7: Paystack Payment Flow", "Implemented payment flow from permit request checkout to verified permit issuance.", ["Create permit\nrequest", "Initialize\nPaystack", "Redirect\ncheckout", "Callback or\nwebhook", "Verify\nserver-side", "Issue permit\nor recover"], "figure-4-7-paystack-payment-flow", {3, 4})
    flow_diagram("Figure 4.13: Mobile Voting Screen Flow", "Mobile election voting from election retrieval to result access.", ["Retrieve\nelection", "Select\ncandidate", "Confirm\nvote", "Eligibility\ncheck", "Immutable\nsave", "Result\naccess"], "figure-4-13-mobile-voting-screen-flow", {3})


def chapter4_mobile_api() -> None:
    flow_diagram("Figure 4.24: Mobile API Communication Flow", "Implemented mobile API flow through Sanctum, endpoint groups, API resources, and database records.", ["Mobile\nscreen", "API client", "Sanctum\ntoken", "Endpoint\ngroup", "Controller +\nresource", "Database", "Refresh\nquery"], "figure-4-24-mobile-api-communication-flow", {2, 3})


def chapter4_queue() -> None:
    d = Diagram("Figure 4.25: Queue Workflow", "Implementation view of queued jobs, workers, retries, and scheduler-triggered tasks.", 1450, 850)
    d.rect(90, 270, 220, 80, "System Event\npayment, account,\ncontent, report", PALETTE["start_fill"], PALETTE["start_stroke"], 14)
    d.rect(430, 190, 230, 75, "Dispatch Job\nqueued operation", PALETTE["primary_fill"], size=14)
    d.rect(430, 390, 230, 75, "Scheduled Command\nrecurring task", PALETTE["primary_fill"], size=14)
    d.rect(780, 285, 230, 80, "Queue Worker\nprocesses payload", PALETTE["secondary_fill"], size=14)
    d.diamond(1110, 280, 190, 95, "Job\nsucceeds?", 14)
    d.rect(1080, 155, 250, 70, "Notification or\nbackground result", PALETTE["success_fill"], PALETTE["success_stroke"], 14)
    d.rect(1080, 465, 250, 70, "Failed job log\nretry or review", PALETTE["warning_fill"], PALETTE["warning_stroke"], 14)
    d.arrow(310, 310, 430, 230, "dispatch")
    d.arrow(310, 330, 430, 430, "schedule")
    d.arrow(660, 230, 780, 325)
    d.arrow(660, 430, 780, 325)
    d.arrow(1010, 325, 1110, 325)
    d.arrow(1205, 280, 1205, 225, "yes")
    d.arrow(1205, 375, 1205, 465, "no")
    save("figure-4-25-queue-workflow", d)


def chapter4_deployment() -> None:
    d = Diagram("Figure 4.27: Deployment Architecture", "Production deployment view for web, mobile, backend services, database, queues, cache, and SSL.", 1500, 900)
    d.section(80, 145, 310, 560, "Clients")
    d.rect(140, 230, 190, 75, "Dashboard\nbrowser", PALETTE["primary_fill"])
    d.rect(140, 365, 190, 75, "Public portal\nbrowser", PALETTE["primary_fill"])
    d.rect(140, 500, 190, 75, "Mobile\napplication", PALETTE["primary_fill"])
    d.section(520, 145, 430, 560, "VPS / Application Host")
    d.rect(610, 220, 250, 75, "SSL / Web Server\nHTTPS termination", PALETTE["decision_fill"], PALETTE["decision_stroke"], 14)
    d.rect(610, 355, 250, 80, "Laravel Application\nweb + API routes", PALETTE["secondary_fill"], size=14)
    d.rect(610, 500, 250, 75, "Queue Worker\nbackground jobs", PALETTE["tertiary_fill"], size=14)
    d.rect(610, 620, 250, 65, "Scheduler\nrecurring commands", PALETTE["tertiary_fill"], size=14)
    d.section(1080, 145, 300, 560, "Managed Services")
    d.rect(1135, 235, 190, 75, "PostgreSQL\nDatabase", PALETTE["success_fill"], PALETTE["success_stroke"])
    d.rect(1135, 370, 190, 75, "Cache / Queue\nStore", PALETTE["tertiary_fill"])
    d.rect(1135, 505, 190, 75, "Paystack\nWebhook", PALETTE["external_fill"], PALETTE["external_stroke"])
    for yy in (267, 402, 537):
        d.arrow(330, yy, 610, 258, "HTTPS")
    d.arrow(860, 395, 1135, 272, "SQL")
    d.arrow(860, 540, 1135, 407, "jobs/cache")
    d.arrow(1135, 542, 860, 395, "webhook", PALETTE["external_stroke"])
    save("figure-4-27-deployment-architecture", d)


def chapter4_testing() -> None:
    d = Diagram("Supplementary Figure: Testing Workflow", "Validation structure for core system behavior and high-risk workflows. Use in appendix unless Chapter Four numbering is updated.", 1450, 850)
    d.rect(80, 280, 210, 80, "Code Change\nor Feature", PALETTE["start_fill"], PALETTE["start_stroke"])
    test_items = [
        ("Unit Tests\nhelpers + small logic", 420, 155),
        ("Feature Tests\nmodule workflows", 420, 285),
        ("API Tests\nmobile endpoints", 420, 415),
        ("Mobile Tests\nscreen flows", 420, 545),
        ("Verification Tests\nNFC, permit code,\nstudent number", 420, 675),
    ]
    for label, x, y in test_items:
        d.rect(x, y, 240, 80, label, PALETTE["primary_fill"], size=14)
        d.arrow(290, 320, x, y + 40)
    d.rect(790, 305, 250, 90, "Test Database\ncontrolled seed data", PALETTE["success_fill"], PALETTE["success_stroke"], 14)
    d.rect(790, 505, 250, 90, "Expected Result\npass, reject, log,\nor recover", PALETTE["decision_fill"], PALETTE["decision_stroke"], 14)
    d.rect(1165, 405, 210, 90, "Validated\nSystem Behavior", PALETTE["success_fill"], PALETTE["success_stroke"], 14)
    for _, x, y in test_items:
        d.arrow(x + 240, y + 40, 790, 350)
    d.arrow(915, 395, 915, 505, "assert")
    d.arrow(1040, 550, 1165, 450, "passed evidence")
    save("supplement-testing-workflow", d)


def supplemental_requested_workflows() -> None:
    flow_diagram("Supplementary Figure: Authentication Workflow", "Dashboard and mobile authentication from login to logout. Use only if Chapter Four is revised to add this figure.", ["Login\nrequest", "Validate\ncredentials", "Create session\nor token", "Authorize\nrequest", "Persist\nsession", "Logout\nor revoke"], "supplement-authentication-workflow", {1, 3})
    flow_diagram("Supplementary Figure: Permit Lifecycle Workflow", "Permit state transitions used by issuance, verification, delivery, expiry, and revocation.", ["Issued", "Active", "Delivered", "Expired", "Revoked"], "supplement-permit-lifecycle-workflow")
    flow_diagram("Supplementary Figure: NFC Card Lifecycle", "NFC card lifecycle from registration to replacement or revocation.", ["Register\ncard", "Active", "Replace\ncard", "Lost\nreported", "Revoked"], "supplement-nfc-card-lifecycle", {2, 3})
    flow_diagram("Supplementary Figure: Mobile Permit Request Flow", "Mobile permit request and payment completion through the mobile API.", ["Mobile\nrequest", "Create permit\nrequest", "Paystack\nredirect", "Callback", "Verify\npayment", "Update\npermit"], "supplement-mobile-permit-request-flow", {1, 4})


def generate_all() -> None:
    chapter2_client_server()
    chapter2_nfc()
    chapter2_rest_api()
    chapter2_rbac()
    chapter3_manual_existing()
    chapter3_overall()
    chapter3_dashboard_mobile()
    chapter3_erd()
    chapter3_workflows()
    chapter3_security()
    chapter3_queue_cache()
    chapter4_workflows()
    chapter4_mobile_api()
    chapter4_queue()
    chapter4_deployment()
    chapter4_testing()
    supplemental_requested_workflows()


if __name__ == "__main__":
    generate_all()
    print(f"Generated Excalidraw scenes in {SCENE_DIR}")
