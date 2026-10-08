from pathlib import Path
from xml.sax.saxutils import escape
import json
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, Preformatted
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter

root = Path(__file__).resolve().parent
out = root / 'Reporte_practica_DevOps.pdf'
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyES', fontName='Helvetica', fontSize=10, leading=14, spaceAfter=8))
styles.add(ParagraphStyle(name='CaptionES', fontName='Helvetica', fontSize=9, leading=12, spaceAfter=8))
styles.add(ParagraphStyle(name='CodeES', fontName='Courier', fontSize=8, leading=11, backColor=colors.HexColor('#f0f4f7'), borderPadding=8, spaceAfter=10))
for name in ['Title', 'Heading1', 'Heading2']:
    styles[name].textColor = colors.black
styles['Title'].fontSize = 25
styles['Title'].leading = 30
styles['Title'].alignment = TA_LEFT
styles['Heading1'].fontSize = 17
styles['Heading1'].leading = 21
styles['Heading2'].fontSize = 12
styles['Heading2'].leading = 16
flow = []
def p(text, style='BodyES'): flow.append(Paragraph(text, styles[style]))
def h(text): p(text, 'Heading1')
def sub(text): p(text, 'Heading2')
def code(text): flow.append(Preformatted(text, styles['CodeES']))
def table(rows, widths):
    data = [[Paragraph(escape(str(c)), styles['CaptionES']) for c in row] for row in rows]
    t = Table(data, colWidths=widths, repeatRows=1, hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e9eef2')),('VALIGN',(0,0),(-1,-1),'TOP'),('BOTTOMPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),5),('LINEBELOW',(0,0),(-1,0),.6,colors.HexColor('#9aaebc')),('LINEBELOW',(0,1),(-1,-1),.3,colors.HexColor('#d9e2e8'))]))
    flow.append(t); flow.append(Spacer(1,10))
def page(): flow.append(PageBreak())

p('Reporte de práctica de Web App en contenedor', 'Title')
p('Unidad I · Tema 1 · Introducción a DevOps')
p('Proyecto Nexa API | Fecha de ejecución local 21 de septiembre de 2026')
p('Alumno ____________________________   Grupo ____________')
h('Objetivo y resultado')
p('Desarrollar una API con SQLite normalizada, empaquetarla para Docker y preparar su publicación en Docker Hub y despliegue en una instancia Ubuntu de AWS EC2. La API y sus diez operaciones se implementaron y comprobaron localmente. La ejecución del contenedor y el despliegue remoto permanecen pendientes.')
table([
['Criterio','Estado comprobado'],
['Backend y SQLite','Implementados; 10 endpoints probados mediante HTTP.'],
['JSON Schema','Contratos de entrada y salida en OpenAPI 3.1.'],
['Dockerfile','Creado en la raíz; construcción no verificada por fallo de Docker Desktop.'],
['Contenedor en puerto 8080','Pendiente. Windows rechazó abrir 8080; capturas locales en 18080.'],
['Docker Hub y AWS EC2','Guía y scripts listos; publicación y despliegue pendientes de acceso.'],
], [156,348])
sub('Recursos y organización')
p('Se utilizó Node.js con su módulo SQLite integrado, un navegador y pruebas automatizadas. Docker Desktop está instalado, pero su motor no quedó disponible. El backend está en practica-devops y funciona de manera independiente al sitio Next.js con Supabase existente. No necesita instalar paquetes npm.')
sub('Modelo de datos en tercera forma normal')
code('categories (id PK, name UNIQUE)\n     1  ----  N\nproducts (id PK, name, price_cents, category_id FK)')
p('Los campos son atómicos y las claves primarias son simples. Los atributos dependen de su clave completa. El nombre de la categoría solo se almacena en categories, por lo que no hay dependencia transitiva dentro de products. La relación se conserva mediante una clave foránea con restricción de borrado. El precio usa centavos enteros.')

page(); h('Parte 1 Desarrollo y pruebas de la API')
table([['Método','Ruta','Función'],
['GET','/api/health','Estado del servicio'],['GET','/api/categories','Listar categorías'],
['POST','/api/categories','Crear categoría'],['DELETE','/api/categories/{id}','Eliminar categoría'],
['GET','/api/products','Listar productos'],['GET','/api/products/{id}','Consultar producto'],
['POST','/api/products','Crear producto'],['DELETE','/api/products/{id}','Eliminar producto'],
['POST','/api/database/backup','Crear respaldo'],['DELETE','/api/database','Vaciar datos'],
], [58,225,221])
sub('Contrato JSON y validación')
code('{"statusCode": 200, "data": []}\n\nPOST /api/categories\n{"name":"Electrónica"}\n\nPOST /api/products\n{"name":"Teclado","price_cents":59900,"category_id":1}')
p('Los esquemas definen tipos, campos requeridos, límites de longitud y rechazo de campos adicionales. Las altas devuelven HTTP 201; las consultas, eliminaciones y respaldos usan 200. El valor statusCode coincide con HTTP. Los errores también usan data como arreglo. Los contratos completos están en openapi.json y en la ruta /openapi.json.')
sub('Autorización y operaciones administrativas')
p('POST y DELETE requieren X-Admin-Token, que se compara con ADMIN_TOKEN. Sin esa configuración, solo se admiten lecturas. El respaldo usa VACUUM INTO para incluir los cambios confirmados en WAL y se guarda en data/backups. El vaciado requiere {"confirmation":"VACIAR"}; elimina productos y categorías en una transacción, conservando tablas, índices y respaldos.')
sub('Verificación realizada')
p('La suite local informó 14 pruebas aprobadas y cero fallos: 13 subpruebas y su prueba contenedora. Se comprobaron los diez endpoints, errores de validación y autorización, integridad referencial, persistencia tras reinicio y lectura del respaldo con PRAGMA integrity_check. Las pruebas usan una base aislada.')
p('Se realizaron además diez peticiones correctas desde el panel y una comprobación de presentación móvil. Las respuestas reales están en evidencias/peticiones-locales.json. El registro de pruebas está en evidencias/pruebas-locales.txt. La colección postman_collection.json guarda automáticamente los IDs creados.')

page(); h('Parte 2 Imagen y ejecución en Docker')
p('El Dockerfile está en la raíz del repositorio. Copia únicamente el backend de la práctica, usa un usuario sin privilegios, declara el volumen /data y comprueba /api/health. .dockerignore excluye archivos ajenos a la API y credenciales.')
code((root.parent / 'Dockerfile').read_text(encoding='utf-8').replace('COPY --chown=node:node practica-devops/package.json practica-devops/server.mjs practica-devops/contracts.mjs practica-devops/schema.sql ./', 'COPY --chown=node:node practica-devops/package.json \\\n  practica-devops/server.mjs practica-devops/contracts.mjs \\\n  practica-devops/schema.sql ./').replace('HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch(\'http://127.0.0.1:80/api/health\').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"', '# Healthcheck HTTP definido en el Dockerfile original.'))
sub('Comandos solicitados')
code('docker build -t webapp:latest .\ndocker run -d -p 8080:80 --name webapp-container webapp:latest')
p('Para permitir escrituras y mantener los datos en un volumen nombrado, usar esta variante en lugar del segundo comando, antes de crear el contenedor:')
code("$env:ADMIN_TOKEN = [guid]::NewGuid().ToString('N')\ndocker run -d -p 8080:80 --name webapp-container `\n  --restart unless-stopped -e ADMIN_TOKEN `\n  -v webapp-data:/data webapp:latest")
sub('Bloqueo observado')
p('Docker Desktop no logró iniciar. Su registro informó un error al inicializar Inference manager y abrir dockerInference. Por ello no se obtuvo una imagen construida ni evidencia de contenedor activo. Además, el servidor local recibió EACCES al intentar escuchar en 127.0.0.1:8080, también fuera del entorno restringido. La causa de ese rechazo de puerto no quedó determinada.')
p('Las capturas del anexo corresponden exclusivamente a Node.js local en el puerto 18080. La comprobación exigida en http://localhost:8080 debe repetirse cuando Docker y ese puerto estén disponibles.')
h('Parte 4 Publicación en Docker Hub')
p('Crear la cuenta y un repositorio webapp. Tras construir la imagen, sustituir TU_USUARIO por el usuario real y ejecutar:')
code('docker login\ndocker tag webapp:latest TU_USUARIO/webapp:latest\ndocker push TU_USUARIO/webapp:latest')
p('Pendiente de ejecución. Guardar una captura del repositorio con la etiqueta y otra del push terminado con su digest. No incluir secretos.')

page(); h('Partes 3 y 5 Preparación de AWS EC2')
p('Estos pasos constituyen el procedimiento de despliegue pendiente. No se creó una cuenta, instancia ni recurso de AWS durante esta ejecución.')
for text in [
'1. Crear la cuenta AWS y completar las verificaciones personales y de facturación. Consultar los beneficios y costos vigentes de la cuenta antes de lanzar recursos.',
'2. En EC2, lanzar una instancia con Ubuntu Server 24.04 LTS, arquitectura x86_64, tipo elegible para el plan y dirección IPv4 pública. Crear y conservar el par de claves.',
'3. Configurar el grupo de seguridad: TCP 22 desde la IP del alumno y TCP 8080 desde las IP de prueba autorizadas. Conectarse como ubuntu.',
'4. Copiar deploy/install-docker-ubuntu.sh al servidor y ejecutarlo con bash. Instala Docker desde el repositorio oficial y verifica hello-world.',
'5. Copiar deploy/run-ec2.sh y ejecutar el comando siguiente. El script pide el token, descarga la imagen, publica 8080:80 y conserva SQLite en un volumen.',
]: p(text)
code('bash run-ec2.sh TU_USUARIO/webapp:latest\nsudo docker ps --filter name=webapp-container\ncurl http://localhost:8080/api/health')
p('6. Abrir http://IP_PUBLICA:8080 y probar los diez endpoints con Postman. Para proteger el token al hacer escrituras, usar un túnel SSH y definir baseUrl=http://localhost:18080:')
code('ssh -i clave.pem -L 18080:localhost:8080 ubuntu@IP_PUBLICA')
p('La última petición de la colección elimina los datos de la práctica. Usar una instancia dedicada, hacer primero el respaldo y revisar las respuestas. Retirar los recursos al terminar si ya no se necesitan.')
sub('Capturas pendientes para cerrar la entrega')
p('Construcción de la imagen; contenedor local activo y navegador en 8080; repositorio y push en Docker Hub; instancia Ubuntu y reglas de acceso; Docker instalado en EC2; pull y contenedor remoto; respuestas de los diez endpoints contra EC2. El anexo actual cubre únicamente las pruebas locales.')
sub('Conclusión')
p('La práctica permite relacionar desarrollo, validación de contratos, integridad de datos y empaquetado reproducible. La API cumple las operaciones solicitadas en ejecución local. El ciclo DevOps quedará completo cuando se verifiquen la construcción, publicación y ejecución remota de la misma imagen. Se sigue EC2 porque así lo piden las instrucciones; la referencia aislada a App Service corresponde a un servicio diferente de Azure.')
sub('Documentación consultada')
for title, url in [
('SQLite en Node.js','https://nodejs.org/download/release/v22.22.3/docs/api/sqlite.html'),
('Docker en Ubuntu','https://docs.docker.com/engine/install/ubuntu/'),
('Publicación en Docker Hub','https://docs.docker.com/docker-hub/repos/manage/hub-images/push/'),
('Primeros pasos en EC2','https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html')]:
    p(f'<link href="{url}" color="#087a66">{title}</link>', 'CaptionES')

records = json.loads((root/'evidencias/peticiones-locales.json').read_text(encoding='utf-8'))['requests']
files = ['02-health','03-crear-categoria','04-categorias','05-crear-producto','06-productos','07-producto','08-respaldo','09-eliminar-producto','10-eliminar-categoria','11-vaciado']
descriptions = [
'La API confirma la conexión con SQLite.',
'Se crea una categoría y se recibe su ID con HTTP 201.',
'La consulta devuelve la categoría registrada.',
'Se crea un producto relacionado por category_id; el precio está en centavos.',
'El listado devuelve el producto persistido.',
'La consulta por ID devuelve el producto solicitado.',
'El respaldo devuelve el archivo generado y su tamaño en bytes.',
'Se elimina el producto y se devuelve el registro eliminado.',
'Se elimina la categoría después de borrar su producto.',
'Se agregaron antes nuevos datos de prueba. El vaciado elimina un producto y una categoría.',
]
for start in range(0,10,2):
    page(); h(f'Anexo Evidencias locales {start+1} y {start+2}')
    p('Capturas reales del panel en localhost:18080 · Node.js local · 21 de septiembre de 2026', 'CaptionES')
    for i in range(start,start+2):
        record = records[i]
        path = record['url'].split('18080')[1]
        p(f"<b>{i+1}. {record['method']} {path} · HTTP {record['status']}</b>", 'CaptionES')
        flow.append(Image(str(root/'evidencias'/f'{files[i]}-detalle.png'), width=504, height=281.25))
        flow.append(Spacer(1,5))
        p(descriptions[i], 'CaptionES')

def footer(canvas, doc):
    canvas.setFont('Helvetica',8)
    canvas.setFillColor(colors.HexColor('#526674'))
    canvas.drawString(54,27,'Nexa API | Práctica de DevOps | Evidencia local y despliegue pendiente')
    canvas.drawRightString(558,27,str(doc.page))

SimpleDocTemplate(str(out), pagesize=letter, rightMargin=54, leftMargin=54, topMargin=35, bottomMargin=43, title='Reporte de práctica de Web App en contenedor', author='').build(flow,onFirstPage=footer,onLaterPages=footer)
print(out)
