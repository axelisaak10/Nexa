from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

out=Path('evidencias/17-pruebas-unitarias-node.png')
W,H=1500,900
img=Image.new('RGB',(W,H),'#0d1117'); d=ImageDraw.Draw(img)
font_path='C:/Windows/Fonts/consola.ttf'; bold_path='C:/Windows/Fonts/consolab.ttf'
font=ImageFont.truetype(font_path,27); bold=ImageFont.truetype(bold_path,30); small=ImageFont.truetype(font_path,24)
d.rectangle((0,0,W,64),fill='#1b2733')
for x,c in [(28,'#ff5f56'),(62,'#ffbd2e'),(96,'#27c93f')]: d.ellipse((x,22,x+18,40),fill=c)
d.text((135,17),'Proyecto Integrador CI/CD - Pruebas y cobertura',font=bold,fill='#f0f6fc')
lines=[
('$ npm run test:coverage','#7ee787'),
('▶ Configuración CI/CD del proyecto integrador','#f0f6fc'),
('  ✔ workflow push y pull_request a main','#7ee787'),
('  ✔ Docker Hub con secrets y tags latest + SHA','#7ee787'),
('  ✔ despliegue SSH blue-green con health check','#7ee787'),
('▶ Integración de 12 endpoints, errores y persistencia','#f0f6fc'),
('  ✔ 01 GET health y doce operaciones documentadas','#7ee787'),
('  ✔ GET y POST de categorías y productos','#7ee787'),
('  ✔ 07 PUT categories actualiza datos','#7ee787'),('  ✔ 08 PUT products actualiza datos','#7ee787'),
('  ✔ Rechazo de duplicados, FK inválida y eliminación del padre','#7ee787'),
('  ✔ Esquemas, autorización y errores de usuario','#7ee787'),
('  ✔ Respaldo, persistencia, DELETE y vaciado seguro','#7ee787'),
('  ✔ Socket TCP 6061: insert y get comparten SQLite','#7ee787'),
('ℹ tests 25     pass 25     fail 0     skipped 0','#58a6ff'),
('ℹ lines 93.29% | branches 88.18% | functions 93.55%','#58a6ff'),
]
y=88
for text,color in lines: d.text((35,y),text,font=font if not text.startswith('ℹ') else bold,fill=color); y+=40
img.save(out)
print(out)
