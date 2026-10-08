from pathlib import Path
from datetime import date
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from PIL import Image as PILImage

ROOT = Path(__file__).resolve().parent
EVID = ROOT / "evidencias"
OUT = ROOT / "Reporte_Practica_DevOps_AWS.docx"

NAVY = "17324D"
TEAL = "0B7A75"
LIGHT = "EAF3F4"
PALE = "F4F7F9"
GRAY = "506070"
GREEN = "DDF3E4"
AMBER = "FFF0CC"


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=90, start=100, bottom=90, end=100):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for name, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{name}"))
        if node is None:
            node = OxmlElement(f"w:{name}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    node = OxmlElement("w:tblHeader")
    node.set(qn("w:val"), "true")
    tr_pr.append(node)


def set_font(run, name="Aptos", size=None, bold=None, color=None):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), name)
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.bold = bold
    if color:
        run.font.color.rgb = RGBColor.from_string(color)


def add_field(paragraph, field):
    run = paragraph.add_run()
    fld_char = OxmlElement("w:fldChar")
    fld_char.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = field
    sep = OxmlElement("w:fldChar")
    sep.set(qn("w:fldCharType"), "separate")
    end = OxmlElement("w:fldChar")
    end.set(qn("w:fldCharType"), "end")
    run._r.extend([fld_char, instr, sep, end])


doc = Document()
sec = doc.sections[0]
sec.page_width = Inches(8.5)
sec.page_height = Inches(11)
sec.top_margin = Inches(0.65)
sec.bottom_margin = Inches(0.65)
sec.left_margin = Inches(0.75)
sec.right_margin = Inches(0.75)

styles = doc.styles
normal = styles["Normal"]
normal.font.name = "Aptos"
normal._element.rPr.rFonts.set(qn("w:ascii"), "Aptos")
normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos")
normal.font.size = Pt(10.2)
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.08

for name, size, color, before, after in [
    ("Title", 28, NAVY, 0, 10),
    ("Heading 1", 19, NAVY, 10, 7),
    ("Heading 2", 13, TEAL, 8, 5),
    ("Heading 3", 11, NAVY, 6, 3),
]:
    style = styles[name]
    style.font.name = "Aptos Display"
    style._element.rPr.rFonts.set(qn("w:ascii"), "Aptos Display")
    style._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos Display")
    style.font.size = Pt(size)
    style.font.color.rgb = RGBColor.from_string(color)
    style.font.bold = True
    style.paragraph_format.space_before = Pt(before)
    style.paragraph_format.space_after = Pt(after)
    style.paragraph_format.keep_with_next = True

footer = sec.footer
ft = footer.add_table(rows=1, cols=3, width=Inches(7))
ft.columns[0].width = Inches(2.5)
ft.columns[1].width = Inches(2.5)
ft.columns[2].width = Inches(2)
for cell in ft.rows[0].cells:
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    set_cell_margins(cell, 0, 0, 0, 0)
left = ft.cell(0, 0).paragraphs[0]
left.text = "Nexa API · Práctica DevOps"
center = ft.cell(0, 1).paragraphs[0]
center.text = "Unidad I · Tema 1"
center.alignment = WD_ALIGN_PARAGRAPH.CENTER
right = ft.cell(0, 2).paragraphs[0]
right.alignment = WD_ALIGN_PARAGRAPH.RIGHT
right.add_run("Página ")
add_field(right, "PAGE")
for cell in ft.rows[0].cells:
    for run in cell.paragraphs[0].runs:
        set_font(run, size=8, color=GRAY)


def p(text="", bold_prefix=None, align=None, style=None):
    par = doc.add_paragraph(style=style)
    if bold_prefix and text.startswith(bold_prefix):
        r1 = par.add_run(bold_prefix)
        r1.bold = True
        par.add_run(text[len(bold_prefix):])
    else:
        par.add_run(text)
    if align is not None:
        par.alignment = align
    return par


def heading(text, level=1):
    return doc.add_heading(text, level=level)


def page_break():
    doc.add_page_break()


def add_bullet(text):
    par = doc.add_paragraph(style="List Bullet")
    par.paragraph_format.space_after = Pt(3)
    par.add_run(text)
    return par


def add_number(text):
    par = doc.add_paragraph(style="List Number")
    par.paragraph_format.space_after = Pt(4)
    par.add_run(text)
    return par


def add_code(text):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    cell = table.cell(0, 0)
    set_cell_shading(cell, "EEF2F5")
    set_cell_margins(cell, 120, 140, 120, 140)
    par = cell.paragraphs[0]
    par.paragraph_format.space_after = Pt(0)
    for i, line in enumerate(text.splitlines()):
        if i:
            par.add_run().add_break()
        run = par.add_run(line)
        set_font(run, name="Consolas", size=8.5, color="263746")
    doc.add_paragraph().paragraph_format.space_after = Pt(0)
    return table


def add_table(headers, rows, widths=None, header_fill=NAVY):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.style = "Table Grid"
    for idx, text in enumerate(headers):
        cell = table.rows[0].cells[idx]
        cell.text = text
        set_cell_shading(cell, header_fill)
        set_cell_margins(cell)
        if widths:
            cell.width = Inches(widths[idx])
        for run in cell.paragraphs[0].runs:
            set_font(run, size=8.5, bold=True, color="FFFFFF")
    set_repeat_table_header(table.rows[0])
    for ri, row in enumerate(rows):
        cells = table.add_row().cells
        for ci, text in enumerate(row):
            cells[ci].text = str(text)
            cells[ci].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            set_cell_margins(cells[ci])
            if widths:
                cells[ci].width = Inches(widths[ci])
            if ri % 2 == 1:
                set_cell_shading(cells[ci], PALE)
            for par in cells[ci].paragraphs:
                par.paragraph_format.space_after = Pt(0)
                for run in par.runs:
                    set_font(run, size=8.3, color="263746")
    doc.add_paragraph().paragraph_format.space_after = Pt(0)
    return table


def add_status_cards(cards):
    table = doc.add_table(rows=1, cols=len(cards))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    for i, (big, label, fill) in enumerate(cards):
        cell = table.cell(0, i)
        set_cell_shading(cell, fill)
        set_cell_margins(cell, 140, 90, 130, 90)
        par = cell.paragraphs[0]
        par.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = par.add_run(big + "\n")
        set_font(r, name="Aptos Display", size=18, bold=True, color=NAVY)
        r = par.add_run(label)
        set_font(r, size=8.5, color=GRAY)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)


def add_image(path, caption, max_width=7.0, max_height=7.1):
    path = Path(path)
    with PILImage.open(path) as im:
        px_w, px_h = im.size
    ratio = px_h / px_w
    width = max_width
    height = width * ratio
    if height > max_height:
        height = max_height
        width = height / ratio
    par = doc.add_paragraph()
    par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    par.paragraph_format.space_after = Pt(4)
    par.add_run().add_picture(str(path), width=Inches(width), height=Inches(height))
    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_after = Pt(4)
    run = cap.add_run(caption)
    run.italic = True
    set_font(run, size=8.5, color=GRAY)


# Portada
top = doc.add_table(rows=1, cols=1)
top.alignment = WD_TABLE_ALIGNMENT.CENTER
cell = top.cell(0, 0)
set_cell_shading(cell, NAVY)
set_cell_margins(cell, 260, 220, 260, 220)
par = cell.paragraphs[0]
par.alignment = WD_ALIGN_PARAGRAPH.LEFT
r = par.add_run("REPORTE DE PRÁCTICA")
set_font(r, name="Aptos Display", size=14, bold=True, color="78D6CF")
r = par.add_run("\nEjecutar Web App en Contenedor")
set_font(r, name="Aptos Display", size=26, bold=True, color="FFFFFF")

doc.add_paragraph().paragraph_format.space_after = Pt(45)
p("Unidad I · Tema 1", style="Title")
p("Introducción a DevOps", style="Subtitle")
doc.add_paragraph().paragraph_format.space_after = Pt(28)

meta = add_table(
    ["Campo", "Información"],
    [
        ["Proyecto", "Nexa API con SQLite"],
        ["Alumno", "Axel Rodríguez"],
        ["Evidencia", "Desarrollo, Docker, AWS EC2 y Postman"],
        ["Fecha", "25 de septiembre de 2026"],
    ],
    widths=[1.6, 5.1],
    header_fill=TEAL,
)
doc.add_paragraph().paragraph_format.space_after = Pt(25)

quote = doc.add_table(rows=1, cols=1)
quote.alignment = WD_TABLE_ALIGNMENT.CENTER
qc = quote.cell(0, 0)
set_cell_shading(qc, LIGHT)
set_cell_margins(qc, 180, 180, 180, 180)
qp = qc.paragraphs[0]
qp.alignment = WD_ALIGN_PARAGRAPH.CENTER
qr = qp.add_run("Resultado comprobado: API pública en AWS EC2 y 20 de 20 aserciones aprobadas en Postman.")
set_font(qr, size=11, bold=True, color=NAVY)

page_break()
heading("1. Objetivo, alcance y resultados", 1)
p("El objetivo fue desarrollar una API web con base de datos SQLite normalizada, definir diez endpoints con respuestas JSON uniformes, contenerizarla con Docker y desplegarla en una instancia Ubuntu de Amazon EC2. La verificación final se realizó contra la dirección pública de la instancia mediante Postman.")

add_status_cards([
    ("10", "endpoints implementados", GREEN),
    ("20/20", "aserciones aprobadas", GREEN),
    ("0", "errores en Postman", GREEN),
    ("200", "health check público", GREEN),
])

heading("Resultados principales", 2)
add_table(
    ["Criterio", "Resultado comprobado"],
    [
        ["Backend y SQLite", "Implementados con Node.js y node:sqlite; estructura normalizada."],
        ["JSON Schema", "Contratos definidos en OpenAPI 3.1; envoltura statusCode + data."],
        ["Dockerfile", "Creado; la imagen webapp:latest se construyó en EC2."],
        ["AWS EC2", "Instancia Ubuntu en us-east-2; aplicación pública en puerto 8080."],
        ["Postman", "10 solicitudes, 20 aserciones, 0 fallos y 0 errores."],
        ["Respaldo y vaciado", "Endpoints ejecutados correctamente; el respaldo queda en el volumen Docker."],
        ["Docker Hub", "No se publicó. El código se transfirió a EC2 y la imagen se construyó allí."],
    ],
    widths=[1.65, 5.05],
)

heading("Recursos utilizados", 2)
for item in [
    "Cuenta de AWS y consola EC2.",
    "Computadora con conexión a Internet, navegador y Visual Studio Code.",
    "Node.js 22.22.3, SQLite integrado y Docker 29.1.3 en Ubuntu.",
    "Postman para ejecutar la colección de diez endpoints.",
]:
    add_bullet(item)

page_break()
heading("2. Arquitectura de la solución", 1)
p("La solución separa el cliente de pruebas, el servidor HTTP, la persistencia y la infraestructura. El contenedor expone el puerto 80 internamente y EC2 publica ese servicio en el puerto 8080.")

arch = doc.add_table(rows=1, cols=4)
arch.alignment = WD_TABLE_ALIGNMENT.CENTER
labels = [
    ("Postman / navegador", "Cliente HTTP"),
    ("EC2 :8080", "Entrada pública"),
    ("Docker :80", "Nexa API"),
    ("/data", "SQLite + backups"),
]
for i, (title, subtitle) in enumerate(labels):
    c = arch.cell(0, i)
    set_cell_shading(c, LIGHT if i % 2 == 0 else "DCEBED")
    set_cell_margins(c, 180, 80, 180, 80)
    pp = c.paragraphs[0]
    pp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    rr = pp.add_run(title + "\n")
    set_font(rr, size=10, bold=True, color=NAVY)
    rr = pp.add_run(subtitle)
    set_font(rr, size=8, color=GRAY)

doc.add_paragraph()
add_table(
    ["Componente", "Configuración verificada"],
    [
        ["Instancia", "i-0ea7789720e6b8bd5 · nexa-devops-ubuntu"],
        ["Sistema", "Ubuntu Server 26.04 LTS x86_64"],
        ["Tipo y zona", "t3.micro · us-east-2a (Ohio)"],
        ["Dirección pública", "3.15.3.74 · ec2-3-15-3-74.us-east-2.compute.amazonaws.com"],
        ["Red", "Grupo de seguridad nexa-devops-sg · aplicación en TCP 8080"],
        ["Almacenamiento", "8 GiB gp3 + volumen Docker webapp-data"],
        ["Contenedor", "webapp-container · reinicio unless-stopped · 8080:80"],
    ],
    widths=[1.6, 5.1],
)
p("La IP y la instancia anteriores corresponden al despliegue que respondió durante la verificación. Una captura posterior del usuario mostró otra instancia en us-east-1; esa captura no se utiliza como evidencia de este despliegue.")

page_break()
heading("3. Desarrollo de la Web App API", 1)
heading("Modelo de datos normalizado", 2)
add_code("categories\n  id INTEGER PRIMARY KEY\n  name TEXT UNIQUE NOT NULL\n       1\n       │\n       └──────── N\nproducts\n  id INTEGER PRIMARY KEY\n  name TEXT NOT NULL\n  price_cents INTEGER NOT NULL\n  category_id INTEGER FK → categories.id")
p("El esquema cumple tercera forma normal: cada campo es atómico, las tablas usan claves simples y los atributos dependen de su clave primaria. El nombre de la categoría se almacena una sola vez en categories y products conserva únicamente category_id. La restricción ON DELETE RESTRICT impide borrar categorías que todavía tienen productos.")

heading("Contrato de respuesta", 2)
add_code('{\n  "statusCode": 200,\n  "data": []\n}')
p("Todas las respuestas usan esta envoltura. El valor statusCode coincide con el código HTTP real. Las operaciones POST devuelven 201 al crear; las consultas, respaldos y eliminaciones correctas devuelven 200. Los errores también mantienen data como arreglo e incluyen un mensaje.")

heading("Validación y seguridad", 2)
for item in [
    "Los contratos de entrada y salida se documentan en openapi.json y contracts.mjs.",
    "POST y DELETE requieren la cabecera X-Admin-Token.",
    "Los cuerpos JSON tienen límite de 16 KiB y requieren Content-Type: application/json.",
    "SQLite usa consultas parametrizadas, claves foráneas, modo WAL y transacciones.",
]:
    add_bullet(item)

page_break()
heading("4. Catálogo de diez endpoints", 1)
add_table(
    ["#", "Método", "Ruta", "Función"],
    [
        [1, "GET", "/api/health", "Comprobar API y SQLite"],
        [2, "POST", "/api/categories", "Crear categoría"],
        [3, "GET", "/api/categories", "Listar categorías"],
        [4, "POST", "/api/products", "Crear producto"],
        [5, "GET", "/api/products", "Listar productos"],
        [6, "GET", "/api/products/{id}", "Consultar un producto"],
        [7, "POST", "/api/database/backup", "Crear respaldo SQLite"],
        [8, "DELETE", "/api/products/{id}", "Eliminar producto"],
        [9, "DELETE", "/api/categories/{id}", "Eliminar categoría sin productos"],
        [10, "DELETE", "/api/database", "Vaciar datos y conservar estructura"],
    ],
    widths=[0.35, 0.7, 2.5, 3.15],
)

heading("Ejemplos de entrada", 2)
add_code('POST /api/categories\n{"name":"Electrónica"}\n\nPOST /api/products\n{"name":"Teclado","price_cents":59900,"category_id":1}\n\nDELETE /api/database\n{"confirmation":"VACIAR"}')
p("El panel web en la ruta raíz permite seleccionar las operaciones y observar la respuesta. La ruta /openapi.json expone la especificación OpenAPI 3.1; estos recursos de documentación no se cuentan dentro de los diez endpoints solicitados.")

page_break()
heading("5. Dockerfile y ejecución", 1)
p("El Dockerfile se creó en la raíz del proyecto. Usa Node.js 22.22.3 sobre Debian slim, copia únicamente los archivos de la API, ejecuta el proceso con el usuario node, declara /data como volumen y comprueba /api/health mediante HEALTHCHECK.")
add_code("docker build -t webapp:latest .\n\ndocker run -d -p 8080:80 --name webapp-container webapp:latest")
p("Para conservar SQLite y habilitar las operaciones administrativas, la ejecución usada en EC2 agregó un volumen, la variable ADMIN_TOKEN y una política de reinicio:")
add_code("sudo docker run -d \\\n  --name webapp-container \\\n  --restart unless-stopped \\\n  -p 8080:80 \\\n  -e ADMIN_TOKEN='<valor reservado>' \\\n  -v webapp-data:/data \\\n  webapp:latest")

heading("Comprobación local y resolución de incidente", 2)
p("Durante la primera prueba, Docker Desktop mostró un error al inicializar su servicio. Por esa razón, las capturas locales disponibles corresponden a la API ejecutada directamente con Node.js en localhost:18080. La construcción Docker se comprobó después en la instancia EC2, donde la imagen y el contenedor quedaron operativos.")
add_image(EVID / "01-panel-local.png", "Figura 1. Panel de la API durante la verificación funcional local.", max_height=3.75)

page_break()
heading("6. Creación y preparación de AWS EC2", 1)
p("Se utilizó Amazon EC2, conforme a las instrucciones de la práctica. La instancia se creó con Ubuntu Server, dirección IPv4 pública y reglas de acceso para administración y para el puerto 8080 de la aplicación.")
for step in [
    "Ingresar a la consola de AWS y abrir EC2 en la región Estados Unidos (Ohio), us-east-2.",
    "Lanzar una instancia Ubuntu Server x86_64 de tipo t3.micro con almacenamiento gp3.",
    "Asignar el nombre nexa-devops-ubuntu y conservar el método de acceso a la instancia.",
    "Configurar el grupo de seguridad nexa-devops-sg para SSH y TCP 8080.",
    "Conectarse al servidor e instalar Docker desde el repositorio oficial.",
]:
    add_number(step)

heading("Instalación de Docker en Ubuntu", 2)
add_code("sudo apt-get update\nsudo apt-get install -y ca-certificates curl\n# Configurar el repositorio oficial de Docker\nsudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin\nsudo docker --version")
p("La versión comprobada en el servidor fue Docker 29.1.3.")

heading("Datos de la instancia desplegada", 2)
add_table(
    ["Dato", "Valor"],
    [
        ["ID", "i-0ea7789720e6b8bd5"],
        ["IP pública", "3.15.3.74"],
        ["Región / zona", "us-east-2 / us-east-2a"],
        ["URL de la aplicación", "http://3.15.3.74:8080"],
    ],
    widths=[1.6, 5.1],
)

page_break()
heading("7. Despliegue de la aplicación en EC2", 1)
p("El proyecto se transfirió al servidor y la imagen webapp:latest se construyó directamente en la instancia. Después se inició webapp-container con el puerto 8080 publicado, un volumen persistente y reinicio automático.")
add_code("sudo docker build -t webapp:latest .\nsudo docker run -d --name webapp-container --restart unless-stopped \\\n  -p 8080:80 -e ADMIN_TOKEN='<valor reservado>' \\\n  -v webapp-data:/data webapp:latest\nsudo docker ps --filter name=webapp-container\ncurl http://localhost:8080/api/health")

heading("Variación respecto a Docker Hub", 2)
p("La consigna indica etiquetar y publicar la imagen en Docker Hub. Esa publicación no se realizó porque no se proporcionó una cuenta o nombre de usuario de Docker Hub. Para completar el despliegue sin inventar evidencia, se construyó la misma imagen directamente en EC2. Los comandos que quedarían pendientes son:")
add_code("docker login\ndocker tag webapp:latest TU_USUARIO/webapp:latest\ndocker push TU_USUARIO/webapp:latest")
p("Esta variación mantiene la contenerización y el despliegue en EC2, pero no demuestra el criterio específico de publicación en Docker Hub.")

heading("Resultado público", 2)
add_code('GET http://3.15.3.74:8080/api/health\n\n{"statusCode":200,"data":[{"service":"nexa-webapp","database":"sqlite-ok"}]}')

page_break()
heading("8. Evidencia del despliegue público", 1)
add_image(EVID / "13-panel-aws-ec2.png", "Figura 2. Panel Nexa cargado desde la dirección pública de AWS EC2.", max_height=6.8)
p("La captura fue tomada directamente desde http://3.15.3.74:8080. El panel confirma que el servicio está activo y que SQLite se encuentra conectado.")

page_break()
heading("9. Pruebas en Postman", 1)
p("Se importó la colección Nexa DevOps EC2 — 10 endpoints y se configuró baseUrl con la IP pública. La variable administrativa se mantuvo reservada. La colección guarda los identificadores creados para que las consultas y eliminaciones posteriores usen los registros correctos.")
add_status_cards([
    ("10", "solicitudes", GREEN),
    ("20", "aserciones", GREEN),
    ("0", "fallos", GREEN),
    ("0", "errores", GREEN),
])
add_table(
    ["Comprobación por solicitud", "Criterio"],
    [
        ["Código HTTP", "200 en consultas/eliminaciones/respaldo; 201 en altas"],
        ["Envoltura JSON", "statusCode coincide con HTTP y data es un arreglo"],
        ["Secuencia funcional", "Crear → consultar → respaldar → eliminar → vaciar"],
        ["Resultado", "APROBADO: 20/20 aserciones"],
    ],
    widths=[2.0, 4.7],
)
add_image(EVID / "14-postman-health-aws.png", "Figura 3. GET /api/health en Postman: HTTP 200 y dos pruebas aprobadas.", max_height=4.5)

page_break()
heading("10. Ejecución completa de la colección", 1)
add_image(EVID / "15-postman-runner-configuracion.png", "Figura 4. Runner de Postman con los diez endpoints seleccionados en orden.", max_height=6.8)
p("La ejecución conserva los valores de las variables creadas durante la secuencia. La última operación vacía la base dedicada a la práctica, por lo que el respaldo se realiza antes.")

page_break()
heading("11. Resultados de Postman", 1)
add_image(EVID / "16-postman-runner-resultados.png", "Figura 5. Resultado final: 20 pruebas aprobadas, 0 fallidas y 0 errores.", max_height=6.8)
p("La vista de resultados muestra respuestas HTTP 200 para el respaldo, la eliminación del producto, la eliminación de la categoría y el vaciado. Cada petición aprobó las validaciones del código HTTP y de la envoltura JSON.")

page_break()
heading("12. Respaldo y vaciado de SQLite", 1)
heading("Generación del respaldo", 2)
p("POST /api/database/backup ejecuta VACUUM INTO, que crea una copia consistente de la base e incluye los cambios confirmados en el archivo WAL. La respuesta devuelve el nombre del archivo y su tamaño.")
add_image(EVID / "08-respaldo-detalle.png", "Figura 6. Respuesta del endpoint de respaldo durante la prueba funcional.", max_height=3.6)
p("En el contenedor, los archivos se almacenan en /data/backups. Como /data está asociado al volumen webapp-data, los respaldos sobreviven al reemplazo del contenedor.")
add_code("sudo docker exec webapp-container ls -lh /data/backups\n\n# Copiar los respaldos al servidor EC2\nsudo docker cp webapp-container:/data/backups ./respaldos")

page_break()
heading("Vaciado conservando estructura", 2)
p("DELETE /api/database requiere el cuerpo {\"confirmation\":\"VACIAR\"}. La operación elimina primero products y después categories dentro de una transacción. Conserva tablas, índices, archivo SQLite y respaldos.")
add_image(EVID / "11-vaciado-detalle.png", "Figura 7. Respuesta del vaciado de datos con la estructura conservada.", max_height=3.4)

page_break()
heading("13. Conclusiones", 1)
p("La práctica integró desarrollo de API, diseño normalizado, validación mediante JSON Schema, persistencia SQLite, creación de imagen Docker, despliegue en Amazon EC2 y pruebas automatizadas con Postman. La aplicación quedó accesible en el puerto 8080 de la instancia y el health check confirmó tanto el servidor como la base de datos.")
p("La colección de Postman recorrió las diez operaciones en orden y obtuvo 20 de 20 aserciones aprobadas. Esto demuestra que los métodos GET, POST y DELETE respetan el contrato esperado, que las relaciones de datos funcionan y que los procedimientos administrativos de respaldo y vaciado están disponibles.")
p("El único criterio sin evidencia completa es la publicación en Docker Hub. Se documentó con precisión la alternativa utilizada: transferencia del proyecto y construcción de webapp:latest en EC2. Para completar ese punto solo falta etiquetar y subir la imagen a un repositorio del alumno.")

heading("Matriz final de cumplimiento", 2)
add_table(
    ["Elemento", "Estado", "Evidencia"],
    [
        ["Web App + SQLite", "Cumplido", "Código, esquema y panel"],
        ["10 endpoints", "Cumplido", "Colección y 20/20 pruebas"],
        ["Dockerfile", "Cumplido", "Imagen construida en EC2"],
        ["Ejecución local en Docker", "Parcial", "Incidente inicial; prueba local con Node"],
        ["AWS EC2", "Cumplido", "IP pública y health check"],
        ["Docker Hub", "Pendiente", "Comandos documentados"],
        ["Respaldo y vaciado", "Cumplido", "Endpoints 7 y 10"],
    ],
    widths=[2.0, 1.0, 3.7],
)

heading("Archivos de entrega", 2)
for item in [
    "Dockerfile y código fuente de practica-devops.",
    "openapi.json y postman_collection_ec2.json.",
    "evidencias/postman-ec2-resultados.json y postman-ec2-resumen.txt.",
    "Reporte_Practica_DevOps_AWS.docx y Reporte_Practica_DevOps_AWS.pdf.",
]:
    add_bullet(item)

heading("Referencias técnicas", 2)
for text, url in [
    ("Node.js SQLite", "https://nodejs.org/api/sqlite.html"),
    ("Docker Engine en Ubuntu", "https://docs.docker.com/engine/install/ubuntu/"),
    ("Publicar imágenes en Docker Hub", "https://docs.docker.com/docker-hub/repos/manage/hub-images/push/"),
    ("Introducción a Amazon EC2", "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html"),
]:
    par = doc.add_paragraph()
    run = par.add_run(f"{text}: {url}")
    set_font(run, size=8.7, color=TEAL)

# Mantener juntas las filas y evitar metadatos innecesarios.
doc.core_properties.title = "Reporte de Práctica: Ejecutar Web App en Contenedor"
doc.core_properties.subject = "Unidad I - Tema 1: Introducción a DevOps"
doc.core_properties.author = "Axel Rodríguez"
doc.core_properties.keywords = "DevOps, Docker, AWS EC2, SQLite, Postman"
doc.core_properties.comments = "Reporte actualizado con evidencias verificadas del despliegue."

doc.save(OUT)
print(OUT)
