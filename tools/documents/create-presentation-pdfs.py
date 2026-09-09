from __future__ import annotations

import html
import re
from dataclasses import dataclass
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    Flowable,
    CondPageBreak,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "docs" / "defense" / "exports"
OUT_DIR.mkdir(parents=True, exist_ok=True)

NAVY = colors.HexColor("#080D1A")
NAVY_2 = colors.HexColor("#111827")
INK = colors.HexColor("#172033")
MUTED = colors.HexColor("#667085")
PAPER = colors.HexColor("#F4F6FA")
LINE = colors.HexColor("#D7DEEA")
VIOLET = colors.HexColor("#6D4AFF")
VIOLET_SOFT = colors.HexColor("#EDE9FE")
CYAN = colors.HexColor("#159ED9")
GREEN = colors.HexColor("#0E9F75")
AMBER = colors.HexColor("#E69500")
WHITE = colors.white


def register_fonts() -> tuple[str, str, str, str]:
    font_candidates = [
        (
            Path(r"C:\Windows\Fonts\aptos.ttf"),
            Path(r"C:\Windows\Fonts\aptosb.ttf"),
            Path(r"C:\Windows\Fonts\aptosi.ttf"),
            Path(r"C:\Windows\Fonts\aptosbi.ttf"),
        ),
        (
            Path(r"C:\Windows\Fonts\arial.ttf"),
            Path(r"C:\Windows\Fonts\arialbd.ttf"),
            Path(r"C:\Windows\Fonts\ariali.ttf"),
            Path(r"C:\Windows\Fonts\arialbi.ttf"),
        ),
    ]
    for regular, bold, italic, bold_italic in font_candidates:
        if all(p.exists() for p in (regular, bold, italic, bold_italic)):
            pdfmetrics.registerFont(TTFont("DocRegular", str(regular)))
            pdfmetrics.registerFont(TTFont("DocBold", str(bold)))
            pdfmetrics.registerFont(TTFont("DocItalic", str(italic)))
            pdfmetrics.registerFont(TTFont("DocBoldItalic", str(bold_italic)))
            pdfmetrics.registerFontFamily(
                "Doc",
                normal="DocRegular",
                bold="DocBold",
                italic="DocItalic",
                boldItalic="DocBoldItalic",
            )
            return "DocRegular", "DocBold", "DocItalic", "DocBoldItalic"
    return "Helvetica", "Helvetica-Bold", "Helvetica-Oblique", "Helvetica-BoldOblique"


REGULAR, BOLD, ITALIC, BOLD_ITALIC = register_fonts()


@dataclass(frozen=True)
class PdfSpec:
    source: Path
    output: Path
    title: str
    subtitle: str
    badge: str
    footer_name: str


class Rule(Flowable):
    def __init__(self, width: float, color=LINE, thickness: float = 0.8, space_after: float = 8):
        super().__init__()
        self.width = width
        self.height = thickness + space_after
        self.color = color
        self.thickness = thickness

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, self.height - self.thickness, self.width, self.height - self.thickness)


def styles():
    base = getSampleStyleSheet()
    return {
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName=REGULAR,
            fontSize=9.6,
            leading=14.2,
            textColor=INK,
            spaceAfter=6,
            allowWidows=0,
            allowOrphans=0,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontName=REGULAR,
            fontSize=8.2,
            leading=11.4,
            textColor=MUTED,
            spaceAfter=4,
        ),
        "h1": ParagraphStyle(
            "H1",
            parent=base["Heading1"],
            fontName=BOLD,
            fontSize=20,
            leading=23,
            textColor=NAVY,
            spaceBefore=2,
            spaceAfter=12,
            keepWithNext=True,
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Heading2"],
            fontName=BOLD,
            fontSize=14.5,
            leading=17.5,
            textColor=VIOLET,
            spaceBefore=12,
            spaceAfter=6,
            keepWithNext=True,
        ),
        "h3": ParagraphStyle(
            "H3",
            parent=base["Heading3"],
            fontName=BOLD,
            fontSize=11.3,
            leading=14,
            textColor=NAVY_2,
            spaceBefore=9,
            spaceAfter=4,
            keepWithNext=True,
        ),
        "quote": ParagraphStyle(
            "Quote",
            parent=base["BodyText"],
            fontName=ITALIC,
            fontSize=9.5,
            leading=14,
            textColor=NAVY_2,
            leftIndent=4,
            rightIndent=4,
            spaceAfter=0,
        ),
        "code": ParagraphStyle(
            "Code",
            parent=base["Code"],
            fontName="Courier",
            fontSize=7.5,
            leading=10,
            textColor=colors.HexColor("#E5E7EB"),
            backColor=NAVY_2,
            leftIndent=8,
            rightIndent=8,
            borderPadding=8,
            spaceBefore=4,
            spaceAfter=8,
        ),
        "table_header": ParagraphStyle(
            "TableHeader",
            fontName=BOLD,
            fontSize=7.8,
            leading=9.7,
            textColor=WHITE,
        ),
        "table_cell": ParagraphStyle(
            "TableCell",
            fontName=REGULAR,
            fontSize=7.6,
            leading=10,
            textColor=INK,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            fontName=REGULAR,
            fontSize=9.3,
            leading=13.4,
            textColor=INK,
            spaceAfter=2,
        ),
    }


STYLES = styles()


def inline_markup(text: str) -> str:
    text = html.escape(text.strip())
    text = re.sub(r"`([^`]+)`", r'<font name="Courier" color="#4F46E5">\1</font>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<i>\1</i>", text)
    return text


def make_quote(lines: list[str], content_width: float):
    text = "<br/>".join(inline_markup(line.lstrip("> ")) for line in lines)
    body = Paragraph(text, STYLES["quote"])
    table = Table([["", body]], colWidths=[4, content_width - 4])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), VIOLET),
                ("BACKGROUND", (1, 0), (1, -1), colors.HexColor("#F0EDFF")),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (0, -1), 0),
                ("LEFTPADDING", (1, 0), (1, -1), 10),
                ("RIGHTPADDING", (1, 0), (1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ]
        )
    )
    return table


def table_widths(rows: list[list[str]], content_width: float) -> list[float]:
    col_count = max(len(row) for row in rows)
    weights = []
    for col in range(col_count):
        values = [row[col] if col < len(row) else "" for row in rows]
        avg = sum(min(max(len(v), 8), 60) for v in values) / max(len(values), 1)
        weights.append(max(1.0, avg))
    total = sum(weights)
    widths = [content_width * w / total for w in weights]
    min_w = 25 * mm
    if col_count <= 4:
        widths = [max(min_w, w) for w in widths]
        scale = content_width / sum(widths)
        widths = [w * scale for w in widths]
    return widths


def make_table(rows: list[list[str]], content_width: float):
    max_cols = max(len(r) for r in rows)
    normalized = [r + [""] * (max_cols - len(r)) for r in rows]
    data = []
    for row_idx, row in enumerate(normalized):
        style = STYLES["table_header"] if row_idx == 0 else STYLES["table_cell"]
        data.append([Paragraph(inline_markup(cell), style) for cell in row])
    table = Table(data, colWidths=table_widths(normalized, content_width), repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY_2),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7F8FC")]),
                ("GRID", (0, 0), (-1, -1), 0.45, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def parse_markdown(source: str, content_width: float):
    lines = source.replace("\r\n", "\n").split("\n")
    story = []
    paragraph: list[str] = []
    first_h1_skipped = False
    in_code = False
    code_lines: list[str] = []

    def flush_paragraph():
        nonlocal paragraph
        if paragraph:
            text = " ".join(line.strip() for line in paragraph)
            story.append(Paragraph(inline_markup(text), STYLES["body"]))
            paragraph = []

    i = 0
    while i < len(lines):
        raw = lines[i]
        stripped = raw.strip()

        if stripped.startswith("```"):
            flush_paragraph()
            if in_code:
                story.append(Preformatted("\n".join(code_lines), STYLES["code"])); code_lines = []; in_code = False
            else:
                in_code = True
            i += 1
            continue
        if in_code:
            code_lines.append(raw)
            i += 1
            continue
        if not stripped:
            flush_paragraph()
            i += 1
            continue
        if stripped == "---":
            flush_paragraph()
            story.append(Spacer(1, 4))
            story.append(Rule(content_width, LINE, 0.6, 7))
            i += 1
            continue
        if stripped.startswith("# "):
            flush_paragraph()
            if not first_h1_skipped:
                first_h1_skipped = True
            else:
                if story and not isinstance(story[-1], PageBreak):
                    # Begin major sections on a fresh page unless the current
                    # flow is already at the top of a new page.
                    story.append(CondPageBreak(240 * mm))
                story.append(Paragraph(inline_markup(stripped[2:]), STYLES["h1"]))
            i += 1
            continue
        if stripped.startswith("## "):
            flush_paragraph()
            story.append(Paragraph(inline_markup(stripped[3:]), STYLES["h2"]))
            i += 1
            continue
        if stripped.startswith("### "):
            flush_paragraph()
            story.append(Paragraph(inline_markup(stripped[4:]), STYLES["h3"]))
            i += 1
            continue
        if stripped.startswith(">"):
            flush_paragraph()
            quote_lines = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote_lines.append(lines[i].strip())
                i += 1
            story.append(make_quote(quote_lines, content_width))
            story.append(Spacer(1, 6))
            continue
        if stripped.startswith("|") and stripped.endswith("|"):
            flush_paragraph()
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith("|") and lines[i].strip().endswith("|"):
                table_lines.append(lines[i].strip())
                i += 1
            parsed = [[cell.strip() for cell in line.strip("|").split("|")] for line in table_lines]
            if len(parsed) > 1 and all(re.fullmatch(r":?-{3,}:?", c.replace(" ", "")) for c in parsed[1]):
                parsed.pop(1)
            story.append(make_table(parsed, content_width))
            story.append(Spacer(1, 8))
            continue
        if re.match(r"^[-*] ", stripped):
            flush_paragraph()
            items = []
            while i < len(lines) and re.match(r"^[-*] ", lines[i].strip()):
                item_text = re.sub(r"^[-*] ", "", lines[i].strip())
                items.append(ListItem(Paragraph(inline_markup(item_text), STYLES["bullet"]), leftIndent=10))
                i += 1
            story.append(ListFlowable(items, bulletType="bullet", start="circle", leftIndent=18, bulletFontName=BOLD, bulletColor=VIOLET))
            story.append(Spacer(1, 4))
            continue
        if re.match(r"^\d+\. ", stripped):
            flush_paragraph()
            items = []
            while i < len(lines) and re.match(r"^\d+\. ", lines[i].strip()):
                item_text = re.sub(r"^\d+\. ", "", lines[i].strip())
                items.append(ListItem(Paragraph(inline_markup(item_text), STYLES["bullet"]), leftIndent=10))
                i += 1
            story.append(ListFlowable(items, bulletType="1", leftIndent=22, bulletFontName=BOLD, bulletColor=VIOLET))
            story.append(Spacer(1, 4))
            continue

        paragraph.append(raw)
        i += 1

    flush_paragraph()
    return story


def draw_cover(canvas, doc, spec: PdfSpec):
    width, height = A4
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, width, height, fill=1, stroke=0)
    canvas.setFillColor(NAVY_2)
    canvas.circle(width + 22 * mm, height - 18 * mm, 70 * mm, fill=1, stroke=0)
    canvas.setFillColor(VIOLET)
    canvas.rect(0, 0, 7 * mm, height, fill=1, stroke=0)
    canvas.setFillColor(CYAN)
    canvas.rect(7 * mm, 0, 1.8 * mm, height * 0.34, fill=1, stroke=0)
    canvas.setFillColor(GREEN)
    canvas.circle(width - 28 * mm, 28 * mm, 8 * mm, fill=1, stroke=0)

    canvas.setFillColor(VIOLET)
    canvas.roundRect(23 * mm, height - 44 * mm, 54 * mm, 9 * mm, 4.5 * mm, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont(BOLD, 8.5)
    canvas.drawCentredString(50 * mm, height - 40.8 * mm, spec.badge.upper())

    title = Paragraph(
        html.escape(spec.title),
        ParagraphStyle("CoverTitle", fontName=BOLD, fontSize=30, leading=34, textColor=WHITE, alignment=TA_LEFT),
    )
    title.wrapOn(canvas, width - 48 * mm, 110 * mm)
    title.drawOn(canvas, 23 * mm, height - 115 * mm)

    subtitle = Paragraph(
        html.escape(spec.subtitle),
        ParagraphStyle("CoverSubtitle", fontName=REGULAR, fontSize=12, leading=17, textColor=colors.HexColor("#C9D1E2")),
    )
    subtitle.wrapOn(canvas, width - 55 * mm, 45 * mm)
    subtitle.drawOn(canvas, 23 * mm, height - 150 * mm)

    canvas.setStrokeColor(colors.HexColor("#2B3650"))
    canvas.setLineWidth(1)
    canvas.line(23 * mm, 43 * mm, width - 23 * mm, 43 * mm)
    canvas.setFillColor(colors.HexColor("#9CA8BE"))
    canvas.setFont(REGULAR, 8.5)
    canvas.drawString(23 * mm, 31 * mm, "KNUTSFORD UNIVERSITY FINAL YEAR PROJECT")
    canvas.drawRightString(width - 23 * mm, 31 * mm, "INTERNAL PRESENTATION PREPARATION")
    canvas.restoreState()


def draw_body(canvas, doc, spec: PdfSpec):
    width, height = A4
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, height - 16 * mm, width, 16 * mm, fill=1, stroke=0)
    canvas.setFillColor(VIOLET)
    canvas.rect(0, height - 16 * mm, 5 * mm, 16 * mm, fill=1, stroke=0)
    canvas.setFont(BOLD, 8)
    canvas.setFillColor(WHITE)
    canvas.drawString(15 * mm, height - 10.5 * mm, spec.footer_name.upper())
    canvas.setFillColor(MUTED)
    canvas.setFont(REGULAR, 7.5)
    canvas.drawString(18 * mm, 10 * mm, "KNTSF final year project")
    canvas.drawRightString(width - 18 * mm, 10 * mm, f"Page {doc.page - 1}")
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(18 * mm, 14 * mm, width - 18 * mm, 14 * mm)
    canvas.restoreState()


def build_pdf(spec: PdfSpec):
    doc = SimpleDocTemplate(
        str(spec.output),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=23 * mm,
        bottomMargin=19 * mm,
        title=spec.title,
        author="KNTSF Project Team",
        subject=spec.subtitle,
    )
    source = spec.source.read_text(encoding="utf-8")
    body = parse_markdown(source, doc.width)
    story = [Spacer(1, 1), PageBreak(), *body]
    doc.build(
        story,
        onFirstPage=lambda canvas, document: draw_cover(canvas, document, spec),
        onLaterPages=lambda canvas, document: draw_body(canvas, document, spec),
    )


def main():
    specs = [
        PdfSpec(
            source=ROOT / "docs" / "defense" / "briefing" / "presentation-storyboard-and-speaking-guide.md",
            output=OUT_DIR / "presentation-storyboard-and-speaking-guide.pdf",
            title="Presentation storyboard and speaking guide",
            subtitle="A 13-slide defense plan with speaker ownership, example wording, internal notes, demonstration cues, and factual boundaries.",
            badge="Team guide",
            footer_name="Presentation storyboard",
        ),
        PdfSpec(
            source=ROOT / "docs" / "defense" / "briefing" / "team-rehearsal-and-panel-qa.md",
            output=OUT_DIR / "team-rehearsal-and-panel-qa.pdf",
            title="Team rehearsal and panel Q&A guide",
            subtitle="Timed presentation practice, natural handovers, recorded demonstration cues, likely questions, and a rehearsal score sheet.",
            badge="Rehearsal guide",
            footer_name="Team rehearsal and panel Q&A",
        ),
        PdfSpec(
            source=ROOT / "docs" / "defense" / "briefing" / "technical-defense-qa.md",
            output=OUT_DIR / "technical-defense-qa.pdf",
            title="Daud's technical defense handbook",
            subtitle="100 technical questions and concise answers grounded in the Laravel backend, Expo mobile app, payment workflow, NFC design, security controls, and current limitations.",
            badge="Personal handbook",
            footer_name="Daud's technical defense handbook",
        ),
    ]
    for spec in specs:
        build_pdf(spec)
        print(f"Created {spec.output}")


if __name__ == "__main__":
    main()
