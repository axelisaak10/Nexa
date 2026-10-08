from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "output" / "word" / "Reporte_Proyecto_Integrador_CICD.docx"
OUT.parent.mkdir(parents=True, exist_ok=True)

doc = Document()
sec = doc.sections[0]
sec.top_margin = Inches(.8); sec.bottom_margin = Inches(.8)
sec.left_margin = Inches(.9); sec.right_margin = Inches(.9)

styles = doc.styles
styles['Normal'].font.name = 'Arial'; styles['Normal'].font.size = Pt(11)
styles['Normal'].paragraph_format.line_spacing = 1.5
styles['Normal'].paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
for s in ['Title','Heading 1','Heading 2']:
    styles[s].font.name='Arial'; styles[s].font.color.rgb=RGBColor(0,0,0)
styles['Title'].font.size=Pt(24); styles['Title'].font.bold=True
styles['Heading 1'].font.size=Pt(16); styles['Heading 1'].font.bold=True

def shade(cell, color='173A5E'):
    tcPr=cell._tc.get_or_add_tcPr(); shd=OxmlElement('w:shd'); shd.set(qn('w:fill'),color); tcPr.append(shd)

def table(headers, rows, widths=None):
    t=doc.add_table(rows=1, cols=len(headers)); t.style='Table Grid'
    for i,h in enumerate(headers):
        c=t.rows[0].cells[i]; c.text=h; shade(c)
        for r in c.paragraphs[0].runs: r.font.color.rgb=RGBColor(255,255,255); r.bold=True
        c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
    for ri,row in enumerate(rows):
        cells=t.add_row().cells
        for i,v in enumerate(row):
            cells[i].text=str(v); cells[i].vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            if ri%2: shade(cells[i],'EEF3F8')
    if widths:
        for row in t.rows:
            for i,w in enumerate(widths): row.cells[i].width=Inches(w)
    doc.add_paragraph()
    return t

def fig(path, caption):
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    p.add_run().add_picture(str(ROOT/path), width=Inches(6.5))
    c=doc.add_paragraph(caption); c.alignment=WD_ALIGN_PARAGRAPH.CENTER
    c.runs[0].italic=True; c.runs[0].font.size=Pt(9)

# Portada
for _ in range(3): doc.add_paragraph()
p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=p.add_run('UNIVERSIDAD TECNOLÓGICA DE QUERÉTARO'); r.bold=True; r.font.size=Pt(18)
p=doc.add_paragraph('Unidad I  Introducción a DevOps'); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
for _ in range(4): doc.add_paragraph()
p=doc.add_paragraph(style='Title'); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
p.add_run('Proyecto Integrador')
p=doc.add_paragraph('Pipeline CI CD automatizado para API REST'); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
p.runs[0].bold=True; p.runs[0].font.size=Pt(18)
p=doc.add_paragraph('Docker  GitHub Actions y AWS EC2'); p.alignment=WD_ALIGN_PARAGRAPH.CENTER
p.runs[0].font.size=Pt(14)
for _ in range(5): doc.add_paragraph()
table(['Dato','Información'],[['Alumno','Axel Rodríguez'],['Asignatura','Introducción a DevOps'],['Docente','________________________'],['Fecha','7 de octubre de 2026']], [1.5,4.5])
doc.add_page_break()

doc.add_heading('Contenido',0)
for item in ['1 Introducción','2 Arquitectura de la solución','3 Desarrollo y calidad del backend','4 Pruebas automatizadas y cobertura','5 Contenedorización','6 Pipeline de GitHub Actions','7 Despliegue continuo en EC2','8 Resultados','9 Conclusiones','10 Fuentes de información']:
    doc.add_paragraph(item)
doc.add_page_break()

doc.add_heading('1 Introducción',1)
intro=[
'La integración continua y el despliegue continuo permiten transformar cambios pequeños de código en versiones verificadas y disponibles de manera repetible. En un proceso manual, cada integrante debe recordar cómo ejecutar las pruebas, construir una imagen, etiquetarla, publicarla y reemplazar la aplicación en el servidor. Esta secuencia es vulnerable a omisiones, diferencias entre equipos y exposición accidental de credenciales. El propósito de este proyecto es convertir esa secuencia en un pipeline que aplique las mismas reglas a cada cambio enviado a la rama principal.',
'La solución parte de una API REST funcional escrita con Node.js 22 y SQLite. La aplicación administra categorías y productos mediante doce operaciones HTTP que incluyen GET, POST, PUT y DELETE. También contiene validación mediante JSON Schema, respuestas uniformes con las propiedades statusCode y data, autenticación administrativa para escrituras, restricciones de integridad referencial, respaldo coherente de SQLite y un endpoint de salud.',
'La calidad se controla con el ejecutor de pruebas incluido en Node.js. La suite levanta servidores HTTP y TCP en puertos temporales, crea una base aislada y elimina sus datos al terminar. También se añadieron verificaciones del workflow, de las etiquetas Docker, del uso de secretos y del orden del despliegue blue green. El comando de cobertura impone un mínimo de 70 por ciento para líneas, funciones y ramas.',
'La automatización se define en GitHub Actions. En cada push o pull request hacia main, el trabajo de integración descarga el código, configura Node.js y ejecuta todas las pruebas. Solo un push aprobado puede autenticarse en Docker Hub mediante secretos, construir la imagen y publicar las etiquetas latest y el hash completo del commit.',
'Para reducir la interrupción del servicio, AWS EC2 ejecuta dos posiciones lógicas, azul y verde. La nueva imagen se inicia en el puerto interno inactivo, se consulta repetidamente /api/health y solo después de una respuesta correcta Nginx cambia el tráfico público del puerto 80 mediante una recarga. Ninguna contraseña, IP, token o clave SSH se almacena en el repositorio; la información sensible se obtiene de GitHub Secrets.',
'El alcance incluye diseño, implementación, pruebas locales, cobertura, contenedorización, workflow y estrategia de despliegue. La publicación real en Docker Hub y el despliegue automático requieren configurar los secretos del repositorio y disponer del motor Docker activo.'
]
for x in intro: doc.add_paragraph(x)

doc.add_heading('2 Arquitectura de la solución',1)
doc.add_paragraph('El flujo inicia con un cambio enviado a GitHub. GitHub Actions valida la aplicación y, si las pruebas aprueban, construye dos etiquetas de la imagen. AWS EC2 descarga la versión identificada por el hash del commit y Nginx dirige el tráfico hacia el contenedor saludable.')
table(['Etapa','Responsabilidad'],[['Desarrollador','Envía cambios mediante git push.'],['GitHub Actions','Ejecuta pruebas y cobertura.'],['Docker Hub','Almacena las etiquetas latest y SHA.'],['AWS EC2','Ejecuta el despliegue blue green.'],['Nginx','Publica la API por el puerto 80.']], [2,4.8])

doc.add_heading('3 Desarrollo y calidad del backend',1)
table(['Método','Ruta','Función'],[['GET','/api/health','Verifica Node.js y SQLite'],['GET y POST','/api/categories','Lista y crea categorías'],['PUT y DELETE','/api/categories/{id}','Actualiza y elimina categorías'],['GET y POST','/api/products','Lista y crea productos'],['GET PUT DELETE','/api/products/{id}','Consulta actualiza y elimina productos'],['POST','/api/database/backup','Genera respaldo consistente'],['DELETE','/api/database','Vacía datos conservando estructura']], [1.3,2.6,3.2])
doc.add_paragraph('Cada respuesta conserva el contrato JSON { statusCode, data }. Las operaciones de escritura validan el cuerpo, exigen autenticación administrativa y respetan las relaciones entre categorías y productos.')

doc.add_heading('4 Pruebas automatizadas y cobertura',1)
doc.add_paragraph('El comando npm run test:coverage ejecutó 25 pruebas. Todas aprobaron. Los resultados fueron 93.29 por ciento de líneas, 88.18 por ciento de ramas y 93.55 por ciento de funciones, superiores al umbral mínimo de 70 por ciento.')
table(['Métrica','Resultado','Umbral','Estado'],[['Pruebas','25 aprobadas','Sin fallos','Cumplido'],['Líneas','93.29 %','70 %','Cumplido'],['Ramas','88.18 %','70 %','Cumplido'],['Funciones','93.55 %','70 %','Cumplido']], [2,1.6,1.6,1.5])
fig(Path('evidencias/17-pruebas-unitarias-node.png'),'Figura 1. Pruebas automatizadas y cobertura ejecutadas localmente.')

doc.add_heading('5 Contenedorización',1)
doc.add_paragraph('El Dockerfile utiliza node:22.22.3-bookworm-slim, copia únicamente los archivos necesarios, crea el volumen /data, cambia al usuario node y define una comprobación de salud. El archivo .dockerignore excluye dependencias locales, archivos de entorno, registros y reportes para reducir el contexto y evitar incorporar información sensible.')

doc.add_page_break()
doc.add_heading('6 Pipeline de GitHub Actions',1)
table(['Trabajo','Disparador','Resultado'],[['test','push o pull request a main','Ejecuta npm run test:coverage'],['publish','push aprobado a main','Publica latest y github.sha en Docker Hub'],['deploy','Después de publish','Conecta por SSH y actualiza EC2']], [1.4,2.4,3.3])
doc.add_paragraph('Los secretos requeridos son DOCKERHUB_USERNAME, DOCKERHUB_TOKEN, EC2_HOST, EC2_USER, EC2_SSH_KEY, EC2_KNOWN_HOSTS y ADMIN_TOKEN. Sus valores no forman parte del código público.')

doc.add_heading('7 Despliegue continuo en EC2',1)
doc.add_paragraph('El script selecciona el color inactivo, descarga la imagen inmutable y monta el volumen persistente de SQLite. Después de confirmar la salud, genera una configuración nueva de Nginx, valida su sintaxis y recarga el servicio. Si la versión nueva falla, se retira y se conserva la versión activa. El grupo de seguridad permite SSH para administración y HTTP en el puerto 80.')
fig(Path('evidencias/14-postman-health-aws.png'),'Figura 2. Respuesta HTTP 200 del endpoint de salud en AWS EC2.')

doc.add_page_break()
doc.add_heading('8 Resultados',1)
table(['Criterio','Resultado','Estado'],[['API REST','12 operaciones','Cumplido'],['Pruebas automatizadas','25 aprobadas y 0 fallidas','Cumplido'],['Cobertura de líneas','93.29 %','Cumplido'],['Cobertura de ramas','88.18 %','Cumplido'],['Cobertura de funciones','93.55 %','Cumplido'],['Dockerfile y dockerignore','Revisión estática aprobada','Cumplido'],['Workflow','main.yml creado','Cumplido'],['Build Docker local','Requiere motor Docker activo','Pendiente'],['Publicación y despliegue','Requiere configurar secretos','Pendiente']], [3.2,2.8,1.3])
doc.add_paragraph('La evidencia en Postman confirma que la API y SQLite respondieron desde EC2 durante la práctica anterior. Para cerrar la demostración del pipeline se debe ejecutar un push a main y capturar los trabajos aprobados, las etiquetas publicadas y la URL por el puerto 80.')

doc.add_heading('9 Conclusiones',1)
doc.add_paragraph('El proyecto convirtió una API funcional en un artefacto verificable y preparado para entrega continua. La cobertura quedó ampliamente por encima del mínimo y las pruebas incluyeron respuestas exitosas, validación, autenticación, integridad de SQLite, respaldo, persistencia y estructura de CI/CD. Esta combinación reduce la probabilidad de publicar una versión que falle por errores conocidos.')
doc.add_paragraph('La estrategia blue green separa la construcción de la activación. La imagen nueva debe responder correctamente antes de recibir tráfico y Nginx cambia de destino mediante una recarga. La seguridad se conserva mediante GitHub Secrets, etiquetas inmutables por commit, validación de known hosts y ejecución sin privilegios. Una vez configurados los secretos, un git push a main permitirá demostrar el ciclo completo solicitado.')

doc.add_heading('10 Fuentes de información',1)
sources=[('GitHub','Understanding GitHub Actions','https://docs.github.com/actions'),('Docker','Build and push Docker images','https://docs.docker.com/build/ci/github-actions/'),('Docker','Personal access tokens','https://docs.docker.com/security/access-tokens/'),('Amazon Web Services','Get started with Amazon EC2','https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html'),('Node.js','Test runner and code coverage','https://nodejs.org/api/test.html')]
for org,title,url in sources: doc.add_paragraph(f'{org}. {title}. {url}', style='List Number')

# Numeración de página
for section in doc.sections:
    p=section.footer.paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    run=p.add_run('Página ')
    fld=OxmlElement('w:fldSimple'); fld.set(qn('w:instr'),'PAGE'); run._r.addnext(fld)

doc.save(OUT)
print(OUT)
