/* eslint-disable @typescript-eslint/no-require-imports, no-undef */
const fs = require("fs");
const path = require("path");
const {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  ImageRun,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TextRun,
  WidthType,
} = require("docx");

const root = path.resolve(__dirname, "..");
const outputPath = path.join(root, "KNTSF_FINAL_DISSERTATION.docx");

const A4 = { width: 11906, height: 16838 };
const MARGIN = { top: 1440, right: 1440, bottom: 1440, left: 1440 };
const CONTENT_WIDTH = A4.width - MARGIN.left - MARGIN.right;
const FONT = "Times New Roman";

const CANDIDATES = [
  { name: "Rahim Daud", index: "26102859" },
  { name: "Kwuatsenu Divine", index: "26102924" },
  { name: "M'Bangot-Menard Naeem Latif", index: "26102931" },
];

const SUBMISSION_MONTH_YEAR = "[INSERT MONTH AND YEAR]";
const SUPERVISOR_NAME = "[INSERT SUPERVISOR NAME]";

const chapterFiles = [
  "CHAPTER_1_INTRODUCTION.md",
  "CHAPTER_2_LITERATURE_REVIEW.md",
  "CHAPTER_3_SYSTEM_ANALYSIS_AND_DESIGN.md",
  "CHAPTER_4_SYSTEM_IMPLEMENTATION.md",
  "CHAPTER_5_SUMMARY_CONCLUSION_AND_RECOMMENDATIONS.md",
];

const embeddedDiagramFiles = new Set([
  "figure-2-1-client-server-architecture.png",
  "figure-2-4-rbac-model.png",
  "figure-3-2-overall-system-architecture.png",
  "figure-3-4-entity-relationship-diagram.png",
  "figure-3-5-permit-request-and-payment-workflow.png",
  "figure-3-7-nfc-verification-workflow.png",
  "figure-4-5-permit-verification-workflow.png",
  "figure-4-27-deployment-architecture.png",
]);

const appendices = [
  { number: 1, title: "Testing Results", file: "appendices/APPENDIX_1_TESTING_RESULTS.md" },
  { number: 2, title: "Database Schema Summary", file: "appendices/APPENDIX_2_DATABASE_SCHEMA.md" },
  { number: 3, title: "System Screenshots", file: "appendices/APPENDIX_3_SYSTEM_SCREENSHOTS.md" },
  { number: 4, title: "Code Snippets", file: "appendices/APPENDIX_4_CODE_SNIPPETS.md" },
];

function read(name) {
  return fs.readFileSync(path.join(root, name), "utf8").replace(/\r\n/g, "\n");
}

function textRun(text, options = {}) {
  return new TextRun({
    text,
    font: FONT,
    size: options.size ?? 24,
    bold: options.bold,
    italics: options.italics,
    color: options.color,
  });
}

function paragraph(text, options = {}) {
  return new Paragraph({
    alignment: options.alignment ?? AlignmentType.JUSTIFIED,
    spacing: {
      before: options.before ?? 0,
      after: options.after ?? 160,
      line: options.line ?? 360,
    },
    indent: options.indent,
    children: [textRun(text, options.run ?? {})],
  });
}

function centered(text, options = {}) {
  return paragraph(text, {
    ...options,
    alignment: AlignmentType.CENTER,
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function heading(text, level, pageBreakBefore = false) {
  const headingLevel =
    level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3;

  return new Paragraph({
    heading: headingLevel,
    pageBreakBefore,
    spacing: { before: level === 1 ? 240 : 180, after: 160 },
    children: [
      textRun(text, {
        size: level === 1 ? 30 : level === 2 ? 27 : 25,
        bold: true,
      }),
    ],
  });
}

function placeholder(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 180, after: 180, line: 360 },
    shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
    border: {
      top: { style: BorderStyle.SINGLE, size: 6, color: "D6B656" },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "D6B656" },
    },
    children: [textRun(text, { bold: true, color: "7A4F00" })],
  });
}

function parseInline(text) {
  const runs = [];
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);

  for (const part of parts) {
    if (part.startsWith("`") && part.endsWith("`")) {
      runs.push(new TextRun({ text: part.slice(1, -1), font: "Courier New", size: 22 }));
    } else if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(textRun(part.slice(2, -2), { bold: true }));
    } else {
      runs.push(textRun(part));
    }
  }

  return runs.length > 0 ? runs : [textRun(text)];
}

function imageDimensions(buffer) {
  if (buffer.length < 24 || buffer.readUInt32BE(0) !== 0x89504e47) {
    return { width: 900, height: 600 };
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function imageParagraph(markdownLine) {
  const match = markdownLine.match(/^!\[(.+?)\]\((.+?)\)$/);

  if (!match) {
    return null;
  }

  const [, alt, rel] = match;
  const file = path.join(root, rel);
  const basename = path.basename(file);

  if (!fs.existsSync(file)) {
    return placeholder(`[MISSING FIGURE FILE — ${alt}]`);
  }

  if (!embeddedDiagramFiles.has(basename)) {
    return placeholder(`[INSERT FIGURE — ${alt}]`);
  }

  const data = fs.readFileSync(file);
  const size = imageDimensions(data);
  const maxWidth = 560;
  const maxHeight = 640;
  const scale = Math.min(maxWidth / size.width, maxHeight / size.height, 1);

  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 180, after: 120 },
    children: [
      new ImageRun({
        type: "png",
        data,
        transformation: {
          width: Math.round(size.width * scale),
          height: Math.round(size.height * scale),
        },
        altText: {
          title: alt,
          description: alt,
          name: alt,
        },
      }),
    ],
  });
}

function markdownTable(lines) {
  const rows = lines
    .filter((line) => !/^\|\s*-+/.test(line))
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim()),
    );

  if (rows.length === 0) {
    return [];
  }

  const colCount = Math.max(...rows.map((row) => row.length));
  const colWidth = Math.floor(CONTENT_WIDTH / colCount);
  const widths = Array.from({ length: colCount }, (_, index) =>
    index === colCount - 1 ? CONTENT_WIDTH - colWidth * (colCount - 1) : colWidth,
  );
  const border = { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" };
  const borders = { top: border, left: border, bottom: border, right: border };

  return [
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: widths,
      rows: rows.map(
        (row, rowIndex) =>
          new TableRow({
            tableHeader: rowIndex === 0,
            children: widths.map(
              (width, cellIndex) =>
                new TableCell({
                  width: { size: width, type: WidthType.DXA },
                  borders,
                  shading: rowIndex === 0 ? { fill: "D9EAF7", type: ShadingType.CLEAR } : undefined,
                  margins: { top: 80, bottom: 80, left: 100, right: 100 },
                  children: [
                    new Paragraph({
                      spacing: { after: 80, line: 300 },
                      children: [textRun(row[cellIndex] ?? "", { size: 20, bold: rowIndex === 0 })],
                    }),
                  ],
                }),
            ),
          }),
      ),
    }),
  ];
}

function markdownToDocx(markdown, options = {}) {
  const children = [];
  const lines = markdown.split("\n");
  let paragraphBuffer = [];
  let tableBuffer = [];
  let codeBuffer = [];
  let inCode = false;
  let firstHeading = true;

  function flushParagraph() {
    if (paragraphBuffer.length === 0) {
      return;
    }

    const text = paragraphBuffer.join(" ").trim();
    paragraphBuffer = [];

    if (!text) {
      return;
    }

    if (/^\[INSERT (FIGURE|SCREENSHOT|TABLE|TEST|CONFIG|SAMPLE|ACKNOWLEDGEMENTS)/i.test(text)) {
      children.push(placeholder(text));

      return;
    }

    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 160, line: 360 },
        children: parseInline(text),
      }),
    );
  }

  function flushTable() {
    if (tableBuffer.length === 0) {
      return;
    }

    children.push(...markdownTable(tableBuffer), paragraph(""));
    tableBuffer = [];
  }

  function flushCode() {
    if (codeBuffer.length === 0) {
      return;
    }

    children.push(
      new Paragraph({
        spacing: { before: 120, after: 160, line: 300 },
        shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
        children: [new TextRun({ text: codeBuffer.join("\n").slice(0, 2000), font: "Courier New", size: 18 })],
      }),
    );
    codeBuffer = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith("```")) {
      flushParagraph();
      flushTable();

      if (inCode) {
        inCode = false;
        flushCode();
      } else {
        inCode = true;
      }

      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushTable();
      continue;
    }

    if (line.startsWith("|") && line.endsWith("|")) {
      flushParagraph();
      tableBuffer.push(line);
      continue;
    }

    flushTable();

    const image = imageParagraph(line.trim());

    if (image) {
      flushParagraph();
      children.push(image);
      continue;
    }

    const h = line.match(/^(#{1,4})\s+(.+)$/);

    if (h) {
      flushParagraph();
      const level = Math.min(h[1].length, 3);
      children.push(heading(h[2].trim(), level, options.pageBreakFirstHeading && firstHeading));
      firstHeading = false;
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)$/);

    if (bullet) {
      flushParagraph();
      children.push(
        new Paragraph({
          indent: { left: 720, hanging: 360 },
          spacing: { after: 100, line: 360 },
          children: [textRun("- "), ...parseInline(bullet[1])],
        }),
      );
      continue;
    }

    const number = line.match(/^\d+\.\s+(.+)$/);

    if (number) {
      flushParagraph();
      children.push(
        new Paragraph({
          indent: { left: 720, hanging: 360 },
          spacing: { after: 100, line: 360 },
          children: [textRun(`${line.match(/^(\d+)\./)?.[1] ?? "1"}. `), ...parseInline(number[1])],
        }),
      );
      continue;
    }

    paragraphBuffer.push(line.trim());
  }

  flushParagraph();
  flushTable();
  flushCode();

  return children;
}

function parseFrontMatterSections() {
  const sections = {};
  let current = null;
  let buffer = [];

  for (const line of read("FRONT_MATTER.md").split("\n")) {
    const match = line.match(/^## (.+)$/);

    if (match) {
      if (current) {
        sections[current] = buffer.join("\n").trim();
      }

      current = match[1];
      buffer = [];
      continue;
    }

    if (current && !line.startsWith("# ")) {
      buffer.push(line);
    }
  }

  if (current) {
    sections[current] = buffer.join("\n").trim();
  }

  return sections;
}

function frontMatterBody(sectionName) {
  const sections = parseFrontMatterSections();
  const text = sections[sectionName] ?? "";

  if (!text || /^\[INSERT /.test(text.trim())) {
    return [placeholder(`[INSERT ${sectionName.toUpperCase()}]`)];
  }

  if (sectionName === "Abstract") {
    return [
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 160, line: 360 },
        children: [textRun(text.replace(/\n+/g, " ").trim())],
      }),
    ];
  }

  if (sectionName === "Dedication") {
    return text
      .split("\n")
      .filter(Boolean)
      .slice(0, 2)
      .map((line) =>
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200, line: 360 },
          children: [textRun(line.trim(), { italics: true })],
        }),
      );
  }

  return markdownToDocx(text);
}

function candidateNamesLine() {
  return CANDIDATES.map((c) => `${c.name} (${c.index})`).join("; ");
}

function frontCover() {
  return [
    centered("KNUTSFORD UNIVERSITY", { run: { size: 32, bold: true }, before: 2200, after: 480 }),
    centered("FACULTY OF COMPUTING & DATA SCIENCE", { run: { size: 26, bold: true }, after: 360 }),
    centered("NFC-BASED STUDENT PERMIT VERIFICATION AND GOVERNANCE MANAGEMENT SYSTEM FOR KNUTSFORD UNIVERSITY", {
      run: { size: 28, bold: true },
      before: 1200,
      after: 1200,
    }),
    ...CANDIDATES.map((c) => centered(c.name, { after: 120 })),
    centered(SUBMISSION_MONTH_YEAR, { before: 1800, after: 0 }),
    pageBreak(),
  ];
}

function titlePage() {
  return [
    centered("KNUTSFORD UNIVERSITY", { run: { size: 30, bold: true }, before: 1200, after: 480 }),
    centered("NFC-BASED STUDENT PERMIT VERIFICATION AND GOVERNANCE MANAGEMENT SYSTEM FOR KNUTSFORD UNIVERSITY", {
      run: { size: 26, bold: true },
      after: 720,
    }),
    centered(`BY ${candidateNamesLine()}`, { after: 720 }),
    centered(
      "department of computer science, faculty of computing & data science, knutsford university in partial fulfilment of the requirements for the award of the degree of bachelor of science in computer science",
      { run: { size: 22 }, after: 720 },
    ),
    centered(SUBMISSION_MONTH_YEAR, { after: 360 }),
    pageBreak(),
  ];
}

function candidateDeclarations() {
  const blocks = [heading("DECLARATION", 1)];

  for (const candidate of CANDIDATES) {
    blocks.push(
      paragraph(
        "I hereby declare that this project is the result of my own original research and that no part of it has been presented for another degree in this university or elsewhere.",
      ),
      paragraph("Candidate's signature: ______________________________"),
      paragraph("Date: ___________________________________"),
      paragraph(`Name: ${candidate.name}`),
      paragraph(`Index Number: ${candidate.index}`, { after: 280 }),
    );
  }

  blocks.push(pageBreak());

  return blocks;
}

function supervisorDeclaration() {
  return [
    heading("SUPERVISOR'S DECLARATION", 1),
    paragraph(
      "I hereby declare that the preparation and presentation of the project were supervised in accordance with the guidelines on supervision of project laid down by Knutsford University.",
    ),
    paragraph("Supervisor's signature: ______________________________"),
    paragraph("Date: ___________________________________"),
    paragraph(`Name: ${SUPERVISOR_NAME}`),
    pageBreak(),
  ];
}

function preliminaryPages() {
  return [
    ...frontCover(),
    ...titlePage(),
    ...candidateDeclarations(),
    ...supervisorDeclaration(),
    heading("DEDICATION", 1),
    ...frontMatterBody("Dedication"),
    pageBreak(),
    heading("ACKNOWLEDGEMENT", 1),
    ...frontMatterBody("Acknowledgements"),
    pageBreak(),
    heading("ABSTRACT", 1),
    ...frontMatterBody("Abstract"),
    pageBreak(),
    heading("TABLE OF CONTENTS", 1),
    new TableOfContents("TABLE OF CONTENTS", { hyperlink: true, headingStyleRange: "1-3" }),
    pageBreak(),
    heading("LIST OF TABLES", 1),
    placeholder("[UPDATE LIST OF TABLES IN MICROSOFT WORD — USE TABLE AND PAGE COLUMNS]"),
    pageBreak(),
    heading("LIST OF FIGURES", 1),
    placeholder("[UPDATE LIST OF FIGURES IN MICROSOFT WORD — USE FIGURE AND PAGE COLUMNS]"),
    pageBreak(),
  ];
}

function readAppendixMarkdown(fileName) {
  return read(fileName).replace(/^# Appendix \d+[^\n]*\n+/, "");
}

function appendixSection() {
  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      pageBreakBefore: true,
      spacing: { before: 2400, after: 480 },
      children: [textRun("APPENDICES", { size: 32, bold: true })],
    }),
    pageBreak(),
  ];

  for (const appendix of appendices) {
    children.push(heading(`Appendix ${appendix.number}: ${appendix.title}`, 2));

    if (fs.existsSync(path.join(root, appendix.file))) {
      console.log(`Appendix ${appendix.number}: loaded ${appendix.file}`);
      children.push(...markdownToDocx(readAppendixMarkdown(appendix.file)));
    } else {
      children.push(placeholder(`[INSERT APPENDIX ${appendix.number} — ${appendix.title}]`));
    }
  }

  return children;
}

function referencesSection() {
  const children = [heading("REFERENCES", 1, true)];
  let inBibliography = false;

  for (const line of read("REFERENCES_VERIFIED.md").split("\n")) {
    if (line.startsWith("## Bibliography")) {
      inBibliography = true;
      continue;
    }

    if (!inBibliography || !line.trim() || line.startsWith("#")) {
      continue;
    }

    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 120, line: 300 },
        indent: { left: 720, hanging: 360 },
        children: [textRun(line.trim(), { size: 22 })],
      }),
    );
  }

  return children;
}

const children = [
  ...preliminaryPages(),
  ...chapterFiles.flatMap((file) => markdownToDocx(read(file), { pageBreakFirstHeading: true })),
  ...referencesSection(),
  ...appendixSection(),
];

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: FONT, size: 24 },
        paragraph: { spacing: { line: 360, after: 160 } },
      },
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 30, bold: true, font: FONT },
        paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 27, bold: true, font: FONT },
        paragraph: { spacing: { before: 200, after: 160 }, outlineLevel: 1 },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 25, bold: true, font: FONT },
        paragraph: { spacing: { before: 180, after: 140 }, outlineLevel: 2 },
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: A4,
          margin: MARGIN,
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                textRun("Page ", { size: 20 }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20 }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`Created ${outputPath}`);
});
