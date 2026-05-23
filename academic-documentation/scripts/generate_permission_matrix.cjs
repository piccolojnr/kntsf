/* eslint-disable @typescript-eslint/no-require-imports, no-undef */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const coreRoot = path.resolve(__dirname, "../..");
const outputPath = path.resolve(__dirname, "../appendices/APPENDIX_K_PERMISSION_MATRIX.md");

function readConfigJson(key) {
  const command = `php artisan tinker --execute="echo json_encode(config('${key}'));"`;

  return JSON.parse(
    execSync(command, {
      cwd: coreRoot,
      encoding: "utf8",
    }).trim(),
  );
}

const permissions = readConfigJson("app-permissions.permissions");
const roles = readConfigJson("app-permissions.roles");

const allPermissions = [];

for (const [module, list] of Object.entries(permissions)) {
  for (const permission of list) {
    allPermissions.push({ module, permission });
  }
}

const roleSets = {};

for (const [roleName, rolePermissions] of Object.entries(roles)) {
  roleSets[roleName] =
    rolePermissions.length === 1 && rolePermissions[0] === "*"
      ? allPermissions.map((entry) => entry.permission)
      : rolePermissions;
}

const roleNames = ["super_admin", "admin", "staff", "student"];
const lines = [
  "# Appendix K — Permission Matrix",
  "",
  "This appendix summarizes role and permission configuration from `config/app-permissions.php` and Spatie Laravel Permission seeding. Backend middleware and policies enforce these permissions on dashboard and mobile routes.",
  "",
  "## K.1 System Roles",
  "",
  "| Role | Description |",
  "| --- | --- |",
  "| super_admin | Full system access through wildcard permission assignment. |",
  "| admin | Full governance administration across students, permits, payments, content, elections, and settings. |",
  "| staff | Operational access for students, permits, verification, NFC cards, payments, and limited content review. |",
  "| student | Personal dashboard access, permit viewing, payments, polls, elections, and profile settings. |",
  "",
  "## K.2 Permission Inventory by Module",
  "",
  "| Module | Permission |",
  "| --- | --- |",
];

for (const entry of allPermissions) {
  lines.push(`| ${entry.module} | \`${entry.permission}\` |`);
}

lines.push("", "## K.3 Role and Permission Matrix", "", "| Permission | super_admin | admin | staff | student |", "| --- | --- | --- | --- | --- |");

for (const entry of allPermissions) {
  const cells = roleNames.map((role) => (roleSets[role].includes(entry.permission) ? "Yes" : "—"));
  lines.push(`| \`${entry.permission}\` | ${cells.join(" | ")} |`);
}

lines.push("", "## K.4 Module Access Summary", "", "| Module | super_admin | admin | staff | student |", "| --- | --- | --- | --- | --- |");

for (const [module, modulePermissions] of Object.entries(permissions)) {
  const cells = roleNames.map((role) => {
    const allowed = modulePermissions.filter((permission) => roleSets[role].includes(permission)).length;
    const total = modulePermissions.length;

    if (allowed === 0) {
      return "—";
    }

    if (allowed === total) {
      return "Full";
    }

    return `Partial (${allowed}/${total})`;
  });

  lines.push(`| ${module} | ${cells.join(" | ")} |`);
}

lines.push(
  "",
  "## K.5 Notes",
  "",
  "- Executive profile management is controlled through `executives.*` permissions, typically assigned to admin users.",
  "- Mobile staff operations require both role membership and endpoint-level permission checks.",
  "- Student election and poll participation still depends on backend eligibility rules in addition to `elections.vote` and `polls.vote`.",
  "",
);

fs.writeFileSync(outputPath, `${lines.join("\n")}\n`);
console.log(`Created ${outputPath}`);
