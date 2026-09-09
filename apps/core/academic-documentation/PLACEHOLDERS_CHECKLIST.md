# Dissertation Placeholders Checklist

Generated document: `KNTSF_FINAL_DISSERTATION.docx`

## Already filled in the document

- Candidate names and index numbers (title page and declarations)
- KUC declaration wording (three candidate blocks + supervisor block)
- Faculty: Computing & Data Science
- Condensed chapters aligned to KUC structure (~60-page target)

## You must complete manually

### Front matter

- [ ] `[INSERT MONTH AND YEAR]` on cover and title page
- [ ] `[INSERT SUPERVISOR NAME]` on supervisor declaration
- [ ] Three candidate signatures and dates on declaration page
- [ ] Supervisor signature and date
- [ ] Final dedication (max two lines; draft text included)
- [ ] Final acknowledgement (no religious thanks per KUC rule)
- [ ] Review abstract (max 250 words, single block, no citations)

### Word formatting (KUC)

- [ ] Update **TABLE OF CONTENTS** (right-click → Update Field)
- [ ] Generate **LIST OF TABLES** (Table / Page columns)
- [ ] Generate **LIST OF FIGURES** (Figure / Page columns)
- [ ] Set preliminary pages to Roman numerals (i, ii, …); Chapter One starts at 1
- [ ] Apply double spacing to TOC if required by examiner

### Figures (yellow placeholders in document)

**Chapter 3**

- [ ] Dashboard wireframe / student management (Figure 3.15 placeholder)

**Chapter 4**

- [ ] Login interface (Figure 4.1)
- [ ] Student management dashboard (Figure 4.2)
- [ ] Permit management screen (Figure 4.3)
- [ ] NFC verification screen (Figure 4.4)
- [ ] Election dashboard (Figure 4.6)
- [ ] Mobile voting screen (Figure 4.7)
- [ ] Student home screen (Figure 4.8)
- [ ] Audit logs dashboard (Figure 4.9, optional)

**Appendix 3**

- [ ] Public portal, mobile permit request, reports, scan screen

**Appendix 1**

- [ ] Test runner screenshot (optional)

Store files under `academic-documentation/screenshots/` per `SCREENSHOT_CAPTURE_GUIDE.md`.

### References

- [ ] Confirm all in-text citations match `REFERENCES_VERIFIED.md`
- [ ] Add any missing peer-reviewed sources cited in Chapter Two

### Final review

- [ ] Spell-check names (especially M'Bangot-Menard Naeem Latif)
- [ ] Print preview page count after images are inserted (baseline without screenshots: ~36 pages in Word; target ~60–68 after figures and list updates; must stay under 100)
- [ ] If still under 60 pages after screenshots, expand acknowledgements or apply university line-spacing rules in Word, then regenerate from markdown if needed
- [ ] Remove yellow highlight boxes after inserting images (delete placeholder paragraphs)

## Regenerate document

```bash
node academic-documentation/scripts/assemble_dissertation_docx.cjs
```
