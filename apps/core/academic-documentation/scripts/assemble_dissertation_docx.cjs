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

const chapterFiles = [
  "CHAPTER_1_INTRODUCTION.md",
  "CHAPTER_2_LITERATURE_REVIEW.md",
  "CHAPTER_3_SYSTEM_ANALYSIS_AND_DESIGN.md",
  "CHAPTER_4_SYSTEM_IMPLEMENTATION.md",
  "CHAPTER_5_SUMMARY_CONCLUSION_AND_RECOMMENDATIONS.md",
];

const majorDiagramFiles = new Set([
  "figure-3-2-overall-system-architecture.png",
  "figure-3-4-entity-relationship-diagram.png",
  "figure-3-5-permit-request-and-payment-workflow.png",
  "figure-3-6-paystack-verification-flow.png",
  "figure-3-7-nfc-verification-workflow.png",
  "figure-3-8-election-voting-workflow.png",
  "figure-3-10-security-and-verification-architecture.png",
  "figure-4-7-paystack-payment-flow.png",
  "figure-4-27-deployment-architecture.png",
]);

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
    shading: options.shading,
    border: options.border,
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
  if (buffer.readUInt32BE(0) !== 0x89504e47) {
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

  if (!majorDiagramFiles.has(basename) && basename.startsWith("figure-")) {
    return placeholder(`[FIGURE FILE AVAILABLE — INSERT DURING FINAL LAYOUT: ${alt}]`);
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

    if (/^\[INSERT (FIGURE|SCREENSHOT|TABLE|TEST|CONFIG|SAMPLE)/.test(text)) {
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
        children: [new TextRun({ text: codeBuffer.join("\n").slice(0, 2600), font: "Courier New", size: 18 })],
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

function preliminaryPages() {
  return [
    centered("KNUTSFORD UNIVERSITY", { run: { size: 30, bold: true }, before: 1800, after: 360 }),
    centered("FACULTY OF COMPUTING AND INFORMATION TECHNOLOGY", { run: { size: 26, bold: true }, after: 360 }),
    centered("DEPARTMENT OF COMPUTER SCIENCE", { run: { size: 26, bold: true }, after: 720 }),
    centered("NFC-BASED STUDENT PERMIT VERIFICATION AND GOVERNANCE MANAGEMENT SYSTEM FOR KNUTSFORD UNIVERSITY", {
      run: { size: 28, bold: true },
      after: 720,
    }),
    centered("A FINAL YEAR PROJECT REPORT SUBMITTED IN PARTIAL FULFILMENT OF THE REQUIREMENTS FOR THE AWARD OF A DEGREE IN COMPUTER SCIENCE", {
      run: { size: 24 },
      after: 720,
    }),
    centered("Student Name: [INSERT STUDENT NAME]", { after: 180 }),
    centered("Student ID: [INSERT STUDENT ID]", { after: 180 }),
    centered("Supervisor: [INSERT SUPERVISOR NAME]", { after: 180 }),
    centered("Academic Year: [INSERT ACADEMIC YEAR]", { after: 720 }),
    centered("Date: [INSERT SUBMISSION DATE]", { after: 360 }),
    pageBreak(),
    heading("Declaration", 1),
    paragraph("I declare that this final year project report is my own work and that all sources used or referred to have been properly acknowledged. No part of this report has been submitted for another academic award."),
    paragraph("Student Name: [INSERT STUDENT NAME]"),
    paragraph("Signature: ______________________________"),
    paragraph("Date: ___________________________________"),
    pageBreak(),
    heading("Approval Page", 1),
    paragraph("This project report has been submitted for examination with the approval of the supervisor and the department."),
    paragraph("Supervisor Name: [INSERT SUPERVISOR NAME]"),
    paragraph("Signature: ______________________________"),
    paragraph("Date: ___________________________________"),
    paragraph("Head of Department: [INSERT NAME]"),
    paragraph("Signature: ______________________________"),
    paragraph("Date: ___________________________________"),
    pageBreak(),
    heading("Dedication", 1),
    placeholder("[INSERT DEDICATION]"),
    pageBreak(),
    heading("Acknowledgements", 1),
    placeholder("[INSERT ACKNOWLEDGEMENTS]"),
    pageBreak(),
    heading("Abstract", 1),
    paragraph("This section will contain the final abstract after screenshots, references, implementation evidence, and appendices have been finalized. It should summarize the problem, aim, methodology, implementation, key modules, testing, and conclusion in a concise academic form."),
    placeholder("[INSERT FINAL ABSTRACT]"),
    pageBreak(),
    heading("Table of Contents", 1),
    new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
    pageBreak(),
    heading("List of Figures", 1),
    placeholder("[UPDATE LIST OF FIGURES IN MICROSOFT WORD AFTER FINAL FIGURE INSERTION]"),
    pageBreak(),
    heading("List of Tables", 1),
    placeholder("[UPDATE LIST OF TABLES IN MICROSOFT WORD AFTER FINAL TABLE CAPTION REVIEW]"),
    pageBreak(),
    heading("List of Appendices", 1),
    placeholder("[UPDATE LIST OF APPENDICES AFTER FINAL APPENDIX ASSEMBLY]"),
    pageBreak(),
  ];
}

function appendixHeadings() {
  const master = read("APPENDICES_MASTER.md");
  const matches = [...master.matchAll(/^### Appendix ([A-L]) — (.+)$/gm)];
  const children = [heading("APPENDICES", 1, true)];
  children.push(
    paragraph(
      "This section is prepared for final appendix assembly. The full appendix contents will be inserted after screenshots, route exports, test summaries, deployment extracts, payment samples, NFC samples, and permission matrices have been finalized.",
    ),
  );

  for (const match of matches) {
    children.push(heading(`Appendix ${match[1]} — ${match[2]}`, 2));
    children.push(placeholder(`[INSERT APPENDIX ${match[1]} CONTENT — ${match[2]}]`));
  }

  return children;
}

function referencesSection() {
  return [
    heading("REFERENCES", 1, true),
    paragraph("This section is reserved for the final APA 7th edition reference list. The sources must be verified before final submission. Do not insert fabricated authors, journals, DOIs, URLs, publishers, or publication years."),
    placeholder("[INSERT VERIFIED APA 7TH EDITION REFERENCES]"),
    paragraph("Use REFERENCES_MASTER.md to track missing sources, verify official documentation references, replace chapter citation placeholders, alphabetize the final bibliography, and remove uncited sources."),
  ];
}

const children = [
  ...preliminaryPages(),
  ...chapterFiles.flatMap((file) => markdownToDocx(read(file), { pageBreakFirstHeading: true })),
  ...referencesSection(),
  ...appendixHeadings(),
  heading("ASSEMBLY NOTES", 1, true),
  paragraph("This initial Word document establishes dissertation structure, heading hierarchy, figure placement, table conversion, and visible placeholders. It still requires screenshot insertion, final APA references, appendix content, pagination review, caption review, and manual table/list updates in Microsoft Word."),
  placeholder("[PENDING: SCREENSHOTS, FINAL REFERENCES, APPENDIX CONTENTS, ROMAN/ARABIC PAGE NUMBER REVIEW, LIST OF FIGURES/TABLES UPDATES]"),
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
              children: [textRun("Page ", { size: 20 }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 20 })],
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
