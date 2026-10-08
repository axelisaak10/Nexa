from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Preformatted, KeepTogether
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'output' / 'pdf' / 'Reporte_Pruebas_Unitarias_API_Nexa.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='ReportTitle', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=22, leading=27, textColor=colors.HexColor('#16324F'), alignment=TA_CENTER, spaceAfter=14))
styles.add(ParagraphStyle(name='Subtitle', parent=styles['Normal'], fontSize=11, leading=15, textColor=colors.HexColor('#40566D'), alignment=TA_CENTER, spaceAfter=18))
styles.add(ParagraphStyle(name='H1x', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=15, leading=19, textColor=colors.HexColor('#16324F'), spaceBefore=8, spaceAfter=8))
styles.add(ParagraphStyle(name='H2x', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=12, leading=15, textColor=colors.HexColor('#214E73'), spaceBefore=6, spaceAfter=5))
styles.add(ParagraphStyle(name='Bodyx', parent=styles['BodyText'], fontSize=9.5, leading=14, spaceAfter=7))
styles.add(ParagraphStyle(name='Small', parent=styles['BodyText'], fontSize=8, leading=11))
styles.add(ParagraphStyle(name='CodeBlock', parent=styles['Code'], fontName='Courier', fontSize=7.8, leading=11, backColor=colors.HexColor('#F3F6F8'), borderPadding=8, spaceAfter=8))

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.HexColor('#667788'))
    canvas.drawString(2*cm, 1.2*cm, 'Unidad I - Tema 1 - Introducción a DevOps')
    canvas.drawRightString(letter[0]-2*cm, 1.2*cm, f'Página {doc.page}')
    canvas.restoreState()

def P(text, style='Bodyx'):
    return Paragraph(text, styles[style])

def make_table(data, widths, font=7.5, padding=5):
    t = Table([[P(str(x), 'Small') for x in row] for row in data], colWidths=widths, repeatRows=1, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),colors.HexColor('#16324F')),
        ('TEXTCOLOR',(0,0),(-1,0),colors.white),
        ('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('GRID',(0,0),(-1,-1),0.5,colors.HexColor('#D9D9D9')),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#EEF4F8')]),
        ('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),
        ('TOPPADDING',(0,0),(-1,-1),padding),('BOTTOMPADDING',(0,0),(-1,-1),padding),
        ('FONTSIZE',(0,0),(-1,-1),font),
    ]))
    return t

story = []
story += [Spacer(1, 1.2*cm), P('Reporte de Pruebas Unitarias de la API Nexa', 'ReportTitle'),
          P('Cobertura de endpoints, validación de errores y resultados obtenidos', 'Subtitle'),
          Spacer(1, .3*cm),
          make_table([
              ['Dato', 'Valor'],
              ['Actividad', 'Pruebas unitarias de endpoints previamente creados'],
              ['Tecnología', 'Node.js 22, node:test, assert y SQLite'],
              ['Fecha de ejecución', '1 de octubre de 2026'],
              ['Resultado', '17 pruebas aprobadas de 17; 0 fallos'],
              ['Cobertura funcional', '12 operaciones HTTP y protocolo Socket TCP 6061'],
          ], [4.2*cm, 11.4*cm]),
          Spacer(1, .5*cm), P('Resumen ejecutivo', 'H1x'),
          P('Se implementó y ejecutó una suite automatizada sobre la API desarrollada en la práctica anterior. La prueba crea una base SQLite temporal y aislada, inicia el servidor en un puerto disponible y valida el contrato JSON <b>{statusCode, data}</b>. La ejecución cubrió lectura, creación, actualización, eliminación, respaldo, vaciado y comunicación TCP.'),
          P('Para cumplir el requisito de actualización se incorporaron dos operaciones PUT: una para categorías y otra para productos. La documentación OpenAPI se actualizó a 12 operaciones. La suite también reproduce errores comunes del consumidor, como datos incompletos, identificadores inválidos, token incorrecto, JSON mal formado, tipo de contenido ausente, duplicados y relaciones inexistentes.'),
          P('Conclusión', 'H1x'),
          P('El resultado fue satisfactorio: <b>17 de 17 pruebas aprobaron</b>. La API mantiene la estructura uniforme de respuesta, protege las escrituras, valida los cuerpos con JSON Schema, conserva la integridad referencial y genera respaldos SQLite coherentes.')]

story += [PageBreak(), P('Objetivo y estrategia de prueba', 'H1x'),
          P('El objetivo fue comprobar que los endpoints responden correctamente ante solicitudes válidas y rechazan de forma controlada las entradas incorrectas. Se utilizó el módulo estándar <b>node:test</b>, equivalente funcional a Jest para esta práctica, junto con <b>assert/strict</b>.'),
          P('Preparación del entorno', 'H2x'),
          P('Cada ejecución crea una carpeta temporal, inicializa el esquema normalizado de categorías y productos, configura un token administrativo exclusivo de prueba y levanta servidores HTTP y TCP locales. Al finalizar se cierran los servidores y se elimina la base temporal. Así, las pruebas no alteran la base desplegada en EC2.'),
          P('Comando de ejecución', 'H2x'),
          Preformatted('node --test --test-reporter spec test.mjs', styles['CodeBlock']),
          P('Criterios verificados', 'H2x'),
          P('Cada respuesta HTTP debe incluir solamente las propiedades <b>statusCode</b> y <b>data</b>; data siempre debe ser un arreglo. También se compara el código HTTP real con statusCode, se revisan los datos devueltos y se confirma la persistencia después de reiniciar el servidor.'),
          P('Archivos principales', 'H2x'),
          make_table([
              ['Archivo', 'Función'],
              ['server.mjs', 'Servidor HTTP, Socket TCP y acceso a SQLite'],
              ['contracts.mjs', 'JSON Schema, validador y documentación OpenAPI'],
              ['test.mjs', 'Suite automatizada de 17 pruebas'],
              ['schema.sql', 'Tablas normalizadas, restricciones e índice'],
          ], [4.2*cm, 11.4*cm])]

endpoints = [
 ['1','GET','/api/health','Estado del servicio y conexión SQLite','200'],
 ['2','GET','/api/categories','Lista categorías','200'],
 ['3','POST','/api/categories','Crea una categoría válida','201'],
 ['4','PUT','/api/categories/{id}','Actualiza el nombre de categoría','200'],
 ['5','DELETE','/api/categories/{id}','Elimina categoría sin productos','200'],
 ['6','GET','/api/products','Lista productos','200'],
 ['7','GET','/api/products/{id}','Consulta producto por identificador','200'],
 ['8','POST','/api/products','Crea producto relacionado','201'],
 ['9','PUT','/api/products/{id}','Actualiza nombre, precio y categoría','200'],
 ['10','DELETE','/api/products/{id}','Elimina producto','200'],
 ['11','POST','/api/database/backup','Crea respaldo SQLite consistente','200'],
 ['12','DELETE','/api/database','Vacía datos y conserva estructura','200'],
]
story += [PageBreak(), P('Matriz de los 12 endpoints probados', 'H1x'),
          P('La matriz incluye operaciones GET, POST, PUT y DELETE. PUT representa la actualización solicitada en la actividad.'),
          make_table([['Núm.','Método','Ruta','Comportamiento esperado','HTTP']] + endpoints,
                     [0.8*cm,1.4*cm,4.6*cm,8.0*cm,1.1*cm])]

errors = [
 ['Body vacío, arreglo o null','POST categoría','400','El cuerpo no cumple el JSON Schema'],
 ['Nombre vacío o propiedad extra','POST categoría','400','Rechazo de entrada inválida'],
 ['Precio negativo, decimal o texto','POST producto','400','Validación de tipo y rango'],
 ['Categoría inexistente','POST producto','409','Conflicto de integridad referencial'],
 ['Categoría duplicada','POST categoría','409','Restricción UNIQUE'],
 ['Eliminar categoría con productos','DELETE categoría','409','Protección de la relación'],
 ['Token incorrecto o ausente','POST PUT DELETE','401','Acceso administrativo rechazado'],
 ['Confirmación distinta de VACIAR','DELETE base','400','Evita borrado accidental'],
 ['ID inexistente','GET o PUT producto','404','Registro no encontrado'],
 ['ID no numérico','GET producto','400','Identificador inválido'],
 ['JSON mal formado','POST categoría','400','JSON inválido'],
 ['Sin application/json','POST categoría','415','Tipo de contenido requerido'],
 ['Body mayor a 16 KB','POST categoría','413','Cuerpo demasiado grande'],
 ['Ruta o método inexistente','GET o PATCH','404 o 405','Error controlado'],
]
story += [PageBreak(), P('Escenarios de fallo considerados', 'H1x'),
          P('Los siguientes casos representan errores previsibles que un usuario puede cometer al consumir la API. Todos devuelven una respuesta JSON controlada y un código HTTP adecuado.'),
          make_table([['Entrada o acción','Endpoint','Código','Validación']] + errors,
                     [4.3*cm,3.2*cm,1.4*cm,7.0*cm], font=7.2, padding=3.5)]

story += [PageBreak(), P('Resultados obtenidos', 'H1x'),
          make_table([
              ['Métrica','Resultado'],
              ['Pruebas ejecutadas','17'],
              ['Aprobadas','17'],
              ['Fallidas','0'],
              ['Canceladas','0'],
              ['Omitidas','0'],
              ['Cobertura de operaciones HTTP','12 endpoints'],
              ['Prueba adicional','Socket TCP 6061 con insert y get'],
          ], [7.5*cm, 8.1*cm]),
          Spacer(1,.5*cm), P('Evidencia resumida de la ejecución', 'H2x'),
          Preformatted('''✔ GET health y documentación OpenAPI\n✔ GET, POST, PUT y DELETE de categorías\n✔ GET, POST, PUT y DELETE de productos\n✔ Respaldo SQLite e integrity_check = ok\n✔ Persistencia después de reiniciar\n✔ Vaciado conservando tablas y respaldos\n✔ Errores de esquema, autorización e integridad\n✔ Socket TCP 6061 insert y get\n\nResultado: 17 aprobadas, 0 fallidas''', styles['Code']),
          P('Interpretación', 'H2x'),
          P('La aprobación total demuestra que las funciones principales cumplen sus contratos y que las entradas inválidas no producen respuestas ambiguas ni corrupción de datos. El respaldo se abrió en modo de solo lectura, pasó PRAGMA integrity_check y conservó el registro creado antes de la copia.'),
          P('Limitaciones', 'H2x'),
          P('Estas pruebas validan comportamiento funcional e integración local con SQLite. No sustituyen pruebas de carga, seguridad ofensiva ni disponibilidad prolongada de EC2. El despliegue debe ejecutar la misma versión del código para disponer de los nuevos endpoints PUT.'),
          P('Recomendaciones', 'H2x'),
          P('Ejecutar <b>npm test</b> antes de construir cada imagen Docker, agregar la prueba al flujo de integración continua y desplegar una nueva imagen en EC2 después de cualquier cambio en server.mjs o contracts.mjs.')]

doc = SimpleDocTemplate(str(OUT), pagesize=letter, rightMargin=2*cm, leftMargin=2*cm, topMargin=1.8*cm, bottomMargin=2*cm, title='Reporte de Pruebas Unitarias de la API Nexa', author='Axel Rodriguez')
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
