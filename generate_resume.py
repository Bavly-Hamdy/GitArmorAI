import os
import reportlab
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute total page numbers & add clean footer."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Bottom page footer
        footer_text = f"Bavly Hamdy Shaker  |  Full Stack & AI Software Engineer  |  Page {self._pageNumber} of {page_count}"
        self.drawCentredString(letter[0] / 2.0, 18, footer_text)
        
        # Top header line on pages after page 1
        if self._pageNumber > 1:
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(32, letter[1] - 24, letter[0] - 32, letter[1] - 24)
            self.drawString(32, letter[1] - 20, "Bavly Hamdy Shaker — Curriculum Vitae")
            self.drawRightString(letter[0] - 32, letter[1] - 20, "bavly.ai")
            
        self.restoreState()

def create_resume():
    pdf_path = os.path.join("public", "Bavly-Hamdy-Resume.pdf")
    
    # 0.45 inch margins (32pt left/right, 28pt top/bottom)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=32,
        rightMargin=32,
        topMargin=26,
        bottomMargin=30
    )

    styles = getSampleStyleSheet()
    
    # Anti-AI Bespoke Editorial Color Tokens
    DARK_HEADER_BG = colors.HexColor("#0B0F19")  # Obsidian dark
    PRIMARY_NAVY   = colors.HexColor("#0F172A")  # Deep slate navy
    ACCENT_BLUE    = colors.HexColor("#2563EB")  # Royal cobalt blue
    TEXT_DARK      = colors.HexColor("#1E293B")  # Dark slate text
    TEXT_MUTED     = colors.HexColor("#475569")  # Muted slate text
    TAG_BG         = colors.HexColor("#F1F5F9")  # Soft gray tag bg
    TAG_BORDER     = colors.HexColor("#CBD5E1")  # Soft gray tag border

    # Paragraph Styles
    name_style = ParagraphStyle(
        'HeaderName',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=21,
        leading=23,
        textColor=colors.white,
        alignment=TA_LEFT,
    )

    title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#60A5FA"), # Soft ice blue
        alignment=TA_LEFT,
    )

    header_contact_style = ParagraphStyle(
        'HeaderContact',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#94A3B8"),
        alignment=TA_RIGHT,
    )

    section_heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=12.5,
        textColor=PRIMARY_NAVY,
        spaceAfter=2,
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=TEXT_DARK,
        alignment=TA_JUSTIFY,
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=TEXT_DARK,
        leftIndent=10,
        firstLineIndent=-6,
        spaceAfter=2,
    )

    project_title_style = ParagraphStyle(
        'ProjectTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=11.5,
        textColor=PRIMARY_NAVY,
    )

    project_tech_style = ParagraphStyle(
        'ProjectTech',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=ACCENT_BLUE,
        alignment=TA_RIGHT,
    )

    story = []

    # ═══════════════════════════════════════════════════════════════
    # 1. HEADER BANNER — Dark Obsidian Executive Card
    # ═══════════════════════════════════════════════════════════════
    header_left = (
        "<font color='#FFFFFF'><b>BAVLY HAMDY SHAKER</b></font><br/>"
        "<font color='#60A5FA'><b>Full Stack &amp; AI Software Engineer &nbsp;|&nbsp; UI/UX Architect</b></font><br/>"
        "<font color='#94A3B8'>B.Sc. Computer Science / Software Engineering — KSIU &nbsp;•&nbsp; ECPC Finalist</font>"
    )
    
    header_right = (
        "<font color='#F8FAFC'><b>Cairo, Egypt (UTC+3)</b></font><br/>"
        "Phone: <font color='#F8FAFC'>(+20) 107 029 9203</font><br/>"
        "Email: <a href='mailto:Bavly.hamdyai@gmail.com' color='#60A5FA'>Bavly.hamdyai@gmail.com</a><br/>"
        "GitHub: <a href='https://github.com/Bavly-Hamdy' color='#60A5FA'>github.com/Bavly-Hamdy</a><br/>"
        "LinkedIn: <a href='https://linkedin.com/in/bavly-hamdy' color='#60A5FA'>linkedin.com/in/bavly-hamdy</a>"
    )

    header_table_data = [
        [
            Paragraph(header_left, name_style),
            Paragraph(header_right, header_contact_style)
        ]
    ]

    header_table = Table(header_table_data, colWidths=[4.7*inch, 2.75*inch])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), DARK_HEADER_BG),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('CORNER_PAD', (0,0), (-1,-1), 6),
    ]))

    story.append(header_table)
    story.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════════════════════
    # 2. EXECUTIVE SUMMARY & ARCHITECTURAL HIGHLIGHTS
    # ═══════════════════════════════════════════════════════════════
    story.append(Paragraph("PROFESSIONAL SUMMARY &amp; ARCHITECTURAL PROFILE", section_heading_style))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_BLUE, spaceAfter=4))
    
    summary_text = (
        "Results-driven <b>Full Stack &amp; AI Software Engineer</b> specializing in Cloud-Native Microservices, Generative AI LLM Integration "
        "(Multimodal Vision OCR, Prompt Engineering, Guardrails), and Enterprise-Grade System Architecture. ECPC/ICPC Competitive Programmer "
        "with proven algorithmic mastery in dynamic programming and graph theory. Certified by <b>IBM</b> (15-Course Professional Certificate), "
        "<b>Huawei Cloud</b>, <b>WE Telecom Egypt</b> (200-Hour Full-Stack Diploma), and <b>University of Colorado Boulder</b>. "
        "Architect of <b>9+ production systems</b> enforcing 100% strict TypeScript type safety, zero client API key exposure, and offline-first desktop/mobile apps."
    )
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 7))

    # ═══════════════════════════════════════════════════════════════
    # 3. TECHNICAL SKILLS & COMPETENCY MATRIX
    # ═══════════════════════════════════════════════════════════════
    story.append(Paragraph("TECHNICAL SKILLS &amp; STACK MATRIX", section_heading_style))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_BLUE, spaceAfter=4))

    skills_data = [
        [
            Paragraph("<b>AI &amp; Multimodal Vision:</b>", body_style),
            Paragraph("Google Gemini 3.6 / 2.5 Flash, Multimodal OCR Handwriting Analysis, Strict Zod JSON Schema Enforcement, RAG Architecture, LLM Prompt Engineering, Secure API Proxying.", body_style)
        ],
        [
            Paragraph("<b>Full-Stack &amp; Mobile:</b>", body_style),
            Paragraph("Next.js 16/15 (App Router), React 19/18, TypeScript (Strict Mode), TanStack Start (SSR), React Native (Expo), Electron 42 (Native Windows NSIS), Tailwind CSS v4, Framer Motion.", body_style)
        ],
        [
            Paragraph("<b>Cloud &amp; Microservices:</b>", body_style),
            Paragraph("Microservices Architecture, Docker, Kubernetes, OpenShift, Serverless Edge (Nitro Engine), Huawei Cloud Services, Cloudflare Workers, CI/CD GitHub Actions.", body_style)
        ],
        [
            Paragraph("<b>Data, Security &amp; Core:</b>", body_style),
            Paragraph("Firebase Firestore &amp; Auth Rules, Cloudinary CDN, Real-time WebSockets/MQTT, 3-Strike Anti-Cheat Engine, Data Structures &amp; Algorithms, Dynamic Programming (C++).", body_style)
        ],
    ]

    skills_table = Table(skills_data, colWidths=[1.65*inch, 5.8*inch])
    skills_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
    ]))
    story.append(skills_table)
    story.append(Spacer(1, 8))

    # ═══════════════════════════════════════════════════════════════
    # 4. FEATURED ENGINEERING PROJECTS & PRODUCTION SYSTEMS
    # ═══════════════════════════════════════════════════════════════
    story.append(Paragraph("FEATURED PRODUCTION PROJECTS &amp; SYSTEM ARCHITECTURE", section_heading_style))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_BLUE, spaceAfter=4))

    projects_list = [
        {
            "name": "CV Genius Optimizer &amp; BOSSLA Career Pro",
            "tech": "Next.js 16 • TypeScript • Gemini 2.5 Flash • Framer Motion • Zod",
            "bullets": [
                "<b>ATS Resume Auditor &amp; Google X-Y-Z Rewriter:</b> Engineered a forensic resume auditor parsing PDF resumes client-side with zero server storage.",
                "<b>Strict JSON Schema Enforcement:</b> Implemented Gemini 2.5 Flash with Zod runtime validation to prevent LLM prompt injection and output glitches.",
                "<b>ATS Match Engine:</b> Computed context-aware keyword gap detection scores with real-time experience rewrite suggestions."
            ]
        },
        {
            "name": "E-Written: BIS Smart Grader V2 — Assiut University",
            "tech": "React 18 • Multimodal Gemini 2.5 OCR • Firebase • Cloudinary",
            "bullets": [
                "<b>Multimodal Handwriting OCR Pipeline:</b> Built an automated academic grading engine transcribing handwritten Arabic &amp; English exam scripts.",
                "<b>University Faculty Security:</b> Enforced strict whitelisted domain auth (*.edu.eg) and Firestore Security Rules restricting ledger access to faculty.",
                "<b>Cloud Assets &amp; Ledger:</b> Processed raw paper photos via Cloudinary image pipelines and exported verified scores to XLSX/PDF."
            ]
        },
        {
            "name": "Clinic Hub (Clinic OS) — Bilingual Desktop OS",
            "tech": "Electron 42 • React 18 • Firebase • Gemini 1.5 Flash • Tailwind CSS",
            "bullets": [
                "<b>Offline-First Desktop App:</b> Developed a native Windows Electron desktop application with main &amp; renderer IPC process isolation.",
                "<b>Dual RTL/LTR Mirror Engine:</b> Designed seamless Arabic &amp; English UI direction switches with zero layout shifting.",
                "<b>AI Safety Prescription Assistant:</b> Integrated an AI prescribing engine performing real-time drug allergy &amp; interaction checks."
            ]
        },
        {
            "name": "AI Integrated Healthcare System — KSIU Graduation Project",
            "tech": "React Native (Expo) • IoT Wearable Hardware • MQTT • Firebase",
            "bullets": [
                "<b>IoT Telemetry Ecosystem:</b> Paired custom wearable hardware (BP, HR, SpO2, Temp) streaming vitals over MQTT protocol to mobile &amp; web apps.",
                "<b>Emergency Threshold Dispatch:</b> Engineered real-time telemetry charts with automated SMS &amp; voice alert triggers for critical vitals."
            ]
        },
        {
            "name": "Bavly AI Launchpad &amp; SmartEdu SaaS Platform",
            "tech": "React 19 • TanStack Start (SSR) • Nitro Engine • Express • Firebase",
            "bullets": [
                "<b>Zero Key Exposure SSR Architecture:</b> Built an SSR platform utilizing Nitro Engine server-route proxies (/api/chat) protecting LLM secret keys.",
                "<b>3-Strike Anti-Cheat Engine:</b> Implemented client-side anti-cheat guardrails (fullscreen lock, tab blur tracking, copy prevention)."
            ]
        }
    ]

    for proj in projects_list:
        header_table_data = [
            [
                Paragraph(f"<b>{proj['name']}</b>", project_title_style),
                Paragraph(f"<i>{proj['tech']}</i>", project_tech_style)
            ]
        ]
        h_table = Table(header_table_data, colWidths=[4.1*inch, 3.35*inch])
        h_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ('TOPPADDING', (0,0), (-1,-1), 1),
            ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ]))
        story.append(h_table)

        for bullet in proj['bullets']:
            story.append(Paragraph(f"• {bullet}", bullet_style))
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 4))

    # ═══════════════════════════════════════════════════════════════
    # 5. VERIFIED DIPLOMAS & CERTIFICATIONS
    # ═══════════════════════════════════════════════════════════════
    story.append(Paragraph("VERIFIED DIPLOMAS &amp; CERTIFICATIONS", section_heading_style))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_BLUE, spaceAfter=4))

    certs_data = [
        [
            Paragraph("• <b>Huawei Cloud Service Computing Micro-Cert</b> — <i>Huawei Cloud (Valid 2026)</i>", bullet_style),
            Paragraph("• <b>Full Stack Web Development Diploma (200 Hours)</b> — <i>WE Telecom Egypt (2024)</i>", bullet_style)
        ],
        [
            Paragraph("• <b>IBM Full Stack Developer Certificate</b> (15 Courses) — <i>Coursera / IBM (2024)</i>", bullet_style),
            Paragraph("• <b>IBM AI Developer Professional Certificate</b> (10 Courses) — <i>Coursera / IBM (2024)</i>", bullet_style)
        ],
        [
            Paragraph("• <b>Data Mining Methods Certificate</b> — <i>University of Colorado Boulder (2024)</i>", bullet_style),
            Paragraph("• <b>Cyber Security Excellence Certificate</b> — <i>Arab Organization for Industrialization (AOI)</i>", bullet_style)
        ],
        [
            Paragraph("• <b>Container &amp; Kubernetes Essentials V2</b> — <i>IBM / Credly Verified Badge (2024)</i>", bullet_style),
            Paragraph("• <b>Generative AI Essentials for Developers</b> — <i>IBM / Credly Verified Badge (2024)</i>", bullet_style)
        ],
    ]

    certs_table = Table(certs_data, colWidths=[3.7*inch, 3.75*inch])
    certs_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
    ]))
    story.append(certs_table)
    story.append(Spacer(1, 6))

    # ═══════════════════════════════════════════════════════════════
    # 6. COMPETITIVE PROGRAMMING & EDUCATION
    # ═══════════════════════════════════════════════════════════════
    story.append(Paragraph("COMPETITIVE PROGRAMMING &amp; ACADEMIC EDUCATION", section_heading_style))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT_BLUE, spaceAfter=4))

    edu_data = [
        "• <b>ECPC Finalist (Egyptian Collegiate Programming Contest):</b> Honorable Mention (2022 &amp; 2023) — ICPC Foundation. Specialized in dynamic programming, graph algorithms, and runtime optimization.",
        "• <b>Bachelor of Science in Computer Science &amp; Software Engineering:</b> King Salman International University (KSIU). Graduation Project: AI Integrated IoT Healthcare Ecosystem."
    ]

    for item in edu_data:
        story.append(Paragraph(item, bullet_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print("Executive Anti-AI Resume generated successfully at public/Bavly-Hamdy-Resume.pdf")

if __name__ == '__main__':
    create_resume()
