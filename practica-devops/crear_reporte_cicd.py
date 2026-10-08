from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from pathlib import Path

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'output'/'pdf'/'Reporte_Proyecto_Integrador_CICD.pdf'
OUT.parent.mkdir(parents=True,exist_ok=True)
NAVY=colors.HexColor('#173A5E'); BLUE=colors.HexColor('#21618C'); PALE=colors.HexColor('#EDF3F7'); GREEN=colors.HexColor('#087F5B')

styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='CoverSchool',parent=styles['Normal'],fontName='Helvetica-Bold',fontSize=16,leading=21,alignment=TA_CENTER,textColor=NAVY))
styles.add(ParagraphStyle(name='CoverTitle',parent=styles['Title'],fontName='Helvetica-Bold',fontSize=24,leading=30,alignment=TA_CENTER,textColor=NAVY,spaceAfter=10))
styles.add(ParagraphStyle(name='CoverSub',parent=styles['Normal'],fontSize=14,leading=19,alignment=TA_CENTER,textColor=BLUE))
styles.add(ParagraphStyle(name='H1x',parent=styles['Heading1'],fontName='Helvetica-Bold',fontSize=15,leading=19,textColor=colors.black,spaceBefore=6,spaceAfter=8))
styles.add(ParagraphStyle(name='H2x',parent=styles['Heading2'],fontName='Helvetica-Bold',fontSize=12,leading=15,textColor=colors.black,spaceBefore=5,spaceAfter=5))
styles.add(ParagraphStyle(name='BodyJ',parent=styles['BodyText'],fontName='Helvetica',fontSize=10.2,leading=15.5,alignment=TA_JUSTIFY,firstLineIndent=18,spaceAfter=8))
styles.add(ParagraphStyle(name='Body',parent=styles['BodyText'],fontName='Helvetica',fontSize=9.6,leading=14,spaceAfter=7))
styles.add(ParagraphStyle(name='Small',parent=styles['BodyText'],fontName='Helvetica',fontSize=7.7,leading=10))
styles.add(ParagraphStyle(name='Caption',parent=styles['BodyText'],fontName='Helvetica-Oblique',fontSize=8.5,leading=11,alignment=TA_CENTER,textColor=colors.HexColor('#4B6175'),spaceBefore=5,spaceAfter=10))

def P(text,style='BodyJ'): return Paragraph(text,styles[style])
def footer(canvas,doc):
    if doc.page==1:return
    canvas.saveState(); canvas.setFont('Helvetica',8); canvas.setFillColor(colors.HexColor('#667788'))
    canvas.drawString(2*cm,1.15*cm,'Proyecto Integrador - Pipeline CI/CD')
    canvas.drawRightString(letter[0]-2*cm,1.15*cm,f'Página {doc.page}')
    canvas.restoreState()
def tbl(rows,widths,font=7.5):
    t=Table([[P(str(v),'Small') for v in r] for r in rows],colWidths=widths,repeatRows=1,hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),colors.white),('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('GRID',(0,0),(-1,-1),.45,colors.HexColor('#D4DADF')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,PALE]),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),('FONTSIZE',(0,0),(-1,-1),font)])); return t
def fig(path,caption,width=16.5*cm):
    return [Image(str(path),width=width,height=width*ImageReaderRatio(path)),P(caption,'Caption')]
def ImageReaderRatio(path):
    from PIL import Image as PILImage
    with PILImage.open(path) as im:return im.height/im.width

story=[]
story += [Spacer(1,1.4*cm),P('UNIVERSIDAD TECNOLÓGICA DE QUERÉTARO','CoverSchool'),Spacer(1,.35*cm),P('Unidad I - Introducción a DevOps','CoverSub'),Spacer(1,2.0*cm),P('Proyecto Integrador','CoverTitle'),P('Pipeline CI/CD automatizado para API REST','CoverSub'),P('Docker, GitHub Actions y AWS EC2','CoverSub'),Spacer(1,2.0*cm),tbl([['Dato','Información'],['Alumno','Axel Rodríguez'],['Asignatura','Introducción a DevOps'],['Docente','____________________________'],['Fecha','7 de octubre de 2026'],['Resultado local','25 pruebas aprobadas; cobertura de líneas 93.29%']],[4.0*cm,11.6*cm]),Spacer(1,1.2*cm),P('Santiago de Querétaro, Querétaro','CoverSub')]

story += [PageBreak(),P('Introducción','H1x')]
intro=[
'La integración continua y el despliegue continuo permiten transformar cambios pequeños de código en versiones verificadas y disponibles de manera repetible. En un proceso manual, cada integrante debe recordar cómo ejecutar las pruebas, construir una imagen, etiquetarla, publicarla y reemplazar la aplicación en el servidor. Esta secuencia es vulnerable a omisiones, diferencias entre equipos y exposición accidental de credenciales. El propósito de este proyecto es convertir esa secuencia en un pipeline que aplique las mismas reglas a cada cambio enviado a la rama principal.',
'La solución parte de una API REST funcional escrita con Node.js 22 y SQLite. La aplicación administra categorías y productos mediante doce operaciones HTTP que incluyen GET, POST, PUT y DELETE. También contiene validación por JSON Schema, respuestas uniformes con las propiedades <b>statusCode</b> y <b>data</b>, autenticación administrativa para escrituras, restricciones de integridad referencial, respaldo coherente de SQLite y un endpoint de salud. Esta base permite comprobar respuestas exitosas y errores frecuentes como cuerpos incompletos, tipos incorrectos, identificadores inválidos, duplicados, relaciones inexistentes y tokens no autorizados.',
'La calidad se controla con el ejecutor de pruebas incluido en Node.js. La suite levanta servidores HTTP y TCP en puertos temporales, crea una base aislada y elimina sus datos al terminar. Además de las pruebas funcionales se añadieron verificaciones estáticas del workflow, de las etiquetas Docker, del uso de secretos y del orden del despliegue blue-green. El comando de cobertura impone un mínimo de 70 por ciento para líneas, funciones y ramas. Una regresión o reducción importante de cobertura impide la publicación de la imagen.',
'La automatización se define en GitHub Actions. En cada <i>push</i> o <i>pull request</i> hacia <b>main</b>, el job de integración descarga el código, configura Node.js y ejecuta las pruebas. Solo un push aprobado puede autenticarse en Docker Hub mediante secretos, construir la imagen y publicar las etiquetas <b>latest</b> y el hash completo del commit. La etiqueta inmutable permite identificar con precisión qué versión se despliega y facilita el diagnóstico de incidentes.',
'Para reducir la interrupción del servicio, AWS EC2 ejecuta dos posiciones lógicas, azul y verde. La nueva imagen se inicia en el puerto interno inactivo, se consulta repetidamente <b>/api/health</b> y solo después de una respuesta correcta Nginx cambia el tráfico público del puerto 80 mediante una recarga. El contenedor anterior se elimina después del cambio. Si la nueva versión no queda saludable, el script la retira y mantiene la versión activa. Ninguna contraseña, IP, token o clave SSH se almacena en el repositorio; la información sensible se obtiene de GitHub Secrets.',
'El alcance del documento incluye diseño, implementación, pruebas locales, cobertura, contenedorización, workflow y estrategia de despliegue. La publicación real en Docker Hub y el despliegue automático requieren configurar los secretos del repositorio y encender Docker Desktop. Los resultados distinguen las verificaciones completadas de los pasos externos pendientes, evitando presentar como ejecutada una evidencia que todavía no existe.'
]
story += [P(x) for x in intro]

story += [PageBreak(),P('1 Arquitectura de la solución','H1x')]
flow=[['Cambio en main','Pruebas y cobertura','Docker Hub','AWS EC2','Nginx puerto 80'],['git push','25 pruebas y umbral 70%','latest y SHA','contenedor azul o verde','API pública']]
story += [tbl(flow,[3.0*cm,3.4*cm,3.0*cm,3.2*cm,3.0*cm]),P('Figura 1. Arquitectura lógica del pipeline desde el cambio de código hasta el servicio público.','Caption'),P('El workflow contiene tres trabajos dependientes. <b>test</b> se ejecuta para cambios y solicitudes de integración. <b>publish</b> depende de las pruebas y se limita a envíos directos a main. <b>deploy</b> consume exactamente la imagen etiquetada con github.sha, carga una clave SSH desde secretos y ejecuta el script remoto. La opción de concurrencia evita dos despliegues simultáneos.')]
story += [P('2 Desarrollo y calidad del backend','H1x'),tbl([['Método','Ruta','Función'],['GET','/api/health','Verifica Node.js y SQLite'],['GET, POST','/api/categories','Lista y crea categorías'],['PUT, DELETE','/api/categories/{id}','Actualiza y elimina categorías'],['GET, POST','/api/products','Lista y crea productos'],['GET, PUT, DELETE','/api/products/{id}','Consulta, actualiza y elimina productos'],['POST','/api/database/backup','Genera respaldo consistente'],['DELETE','/api/database','Vacía datos y conserva estructura']],[2.7*cm,5.4*cm,7.5*cm])]

story += [PageBreak(),P('3 Pruebas automatizadas y cobertura','H1x'),P('El comando <b>npm run test:coverage</b> ejecutó 25 pruebas y todas aprobaron. Los porcentajes fueron 93.29% de líneas, 88.18% de ramas y 93.55% de funciones. Los tres indicadores superan el umbral obligatorio de 70%.')]
story += fig(ROOT/'evidencias'/'17-pruebas-unitarias-node.png','Figura 2. Resumen verificable de pruebas y cobertura ejecutado localmente.',16.5*cm)
story += [P('La suite cubre los doce endpoints, validación, autenticación, duplicados, llaves foráneas, respaldo, persistencia, vaciado y Socket TCP. También verifica que el workflow use secretos, publique dos etiquetas, no incluya direcciones IP y compruebe la salud antes de cambiar Nginx.')]

story += [PageBreak(),P('4 Contenedorización','H1x'),P('El Dockerfile utiliza node:22.22.3-bookworm-slim, copia únicamente los archivos necesarios, crea el volumen /data, cambia al usuario node y define un health check. El archivo .dockerignore aplica una lista blanca: excluye todo el contexto y permite solamente el backend, los recursos públicos y el Dockerfile. Esto evita incorporar llaves, archivos .env, Git, reportes o dependencias locales.'),P('5 Pipeline de GitHub Actions','H1x'),tbl([['Job','Evento','Responsabilidad'],['test','push y pull_request','Ejecuta pruebas y exige cobertura mínima'],['publish','push a main','Publica latest y el SHA en Docker Hub'],['deploy','push a main','Conecta por SSH y activa la versión saludable']],[3.0*cm,4.0*cm,8.6*cm]),P('Los secretos requeridos son DOCKERHUB_USERNAME, DOCKERHUB_TOKEN, EC2_HOST, EC2_USER, EC2_SSH_KEY, EC2_KNOWN_HOSTS y ADMIN_TOKEN. Ningún valor se encuentra en el código.'),P('6 Despliegue blue-green','H1x'),P('El script selecciona el color inactivo, descarga la imagen inmutable y monta el volumen persistente de SQLite. Después de confirmar la salud, genera una configuración nueva de Nginx, valida su sintaxis y recarga el servicio. Finalmente registra el color activo y elimina la versión anterior. Si el health check falla, conserva la versión anterior.')]

story += [PageBreak(),P('7 Resultados','H1x'),tbl([['Criterio','Resultado','Estado'],['API REST','12 operaciones','Cumplido'],['Pruebas automatizadas','25 aprobadas, 0 fallidas','Cumplido'],['Cobertura de líneas','93.29%','Cumplido'],['Cobertura de ramas','88.18%','Cumplido'],['Cobertura de funciones','93.55%','Cumplido'],['Dockerfile y dockerignore','Revisión estática aprobada','Cumplido'],['Workflow main.yml','Creado y validado por pruebas','Cumplido'],['Build Docker local','Motor Docker apagado','Pendiente'],['Push y despliegue reales','Secretos no configurados','Pendiente']],[7.4*cm,4.7*cm,3.5*cm]),Spacer(1,.4*cm)]
story += fig(ROOT/'evidencias'/'14-postman-health-aws.png','Figura 3. Respuesta HTTP 200 del endpoint de salud desplegado previamente en AWS EC2.',16.4*cm)

story += [PageBreak(),P('8 Procedimiento de demostración','H1x'),P('Para la demostración se modifica una línea visible en la respuesta de salud, se ejecuta localmente npm run test:coverage y se crea un commit limitado al proyecto. El push a main debe mostrar en GitHub Actions los jobs test, publish y deploy. Después se consulta la URL pública por el puerto 80 para confirmar que la versión corresponde al hash del commit.'),P('Las evidencias que deben añadirse después del primer pipeline real son: resumen verde de GitHub Actions, repositorio de Docker Hub con latest y SHA, salida del health check de despliegue y URL pública actualizada. No deben aparecer tokens, direcciones privadas ni contenido de la llave PEM.'),P('9 Conclusiones','H1x'),P('El proyecto convirtió una API funcional en un artefacto verificable y preparado para entrega continua. La cobertura quedó ampliamente por encima del mínimo: 93.29% de líneas, 88.18% de ramas y 93.55% de funciones. Las pruebas también verificaron validación, autenticación, integridad de SQLite, respaldo, persistencia y estructura de CI/CD. Esta combinación reduce la probabilidad de publicar una versión que falle por errores conocidos.'),P('La estrategia blue-green separa la construcción de la activación. La imagen nueva debe responder correctamente antes de recibir tráfico y Nginx cambia de destino mediante una recarga. La seguridad se mantiene al usar GitHub Secrets, una etiqueta inmutable por commit, validación de known_hosts, ejecución sin privilegios y un archivo de entorno protegido en EC2. Quedan como pasos operativos encender Docker Desktop y registrar los secretos; una vez realizados, un git push a main demostrará el ciclo completo solicitado.')]

story += [PageBreak(),P('10 Fuentes de información','H1x'),P('1. GitHub. <i>Understanding GitHub Actions</i>. https://docs.github.com/actions','Body'),P('2. Docker. <i>Build and push Docker images</i>. https://docs.docker.com/build/ci/github-actions/','Body'),P('3. Docker. <i>Personal access tokens</i>. https://docs.docker.com/security/access-tokens/','Body'),P('4. Amazon Web Services. <i>Get started with Amazon EC2</i>. https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html','Body'),P('5. Node.js. <i>Test runner and code coverage</i>. https://nodejs.org/api/test.html','Body')]

doc=SimpleDocTemplate(str(OUT),pagesize=letter,leftMargin=2.2*cm,rightMargin=2.2*cm,topMargin=1.8*cm,bottomMargin=1.9*cm,title='Proyecto Integrador Pipeline CI/CD',author='Axel Rodríguez')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(OUT)
