from PIL import Image, ImageDraw
import math, os
SRC='img/_captures-atletas'; OUT='img/pt-atletas'; os.makedirs(OUT, exist_ok=True)
YEL=(255,214,0); BLK=(20,20,20)
def arrow(dr, tip, start, w=10):
    dr.line([start,tip], fill=BLK, width=w+4); dr.line([start,tip], fill=YEL, width=w)
    ang=math.atan2(tip[1]-start[1], tip[0]-start[0]); L=34
    for da in (math.radians(28), -math.radians(28)):
        x=tip[0]-L*math.cos(ang-da); y=tip[1]-L*math.sin(ang-da); dr.line([(x,y),tip], fill=BLK, width=w+4)
    for da in (math.radians(28), -math.radians(28)):
        x=tip[0]-L*math.cos(ang-da); y=tip[1]-L*math.sin(ang-da); dr.line([(x,y),tip], fill=YEL, width=w)
JOBS=[
 ('01-idioma','01-idioma.png',(0,0,1278,910),(628,498),(300,150)),
 ('02-cadastro','02-cadastro-dados.png',(338,92,942,1016),(639,508),(250,-4)),
 ('03-login','04-login.png',(0,0,1278,910),(628,498),(300,150)),
 ('04-foto-documento','05-perfil-topo.png',(206,430,1016,1075),(430,928),(320,70)),
 ('05-termos','05-perfil-topo.png',(206,2120,1016,2745),(636,2624),(250,-150)),
 ('06-autorizacao','08-autorizacao-responsavel.png',(196,980,1056,1670),(672,1203),(250,120)),
]
for name, src, crop, tipf, off in JOBS:
    im=Image.open(os.path.join(SRC,src)).convert('RGB'); c=im.crop(crop); dr=ImageDraw.Draw(c)
    tip=(tipf[0]-crop[0], tipf[1]-crop[1]); start=(tip[0]+off[0], tip[1]+off[1])
    arrow(dr, tip, start); c.save(os.path.join(OUT,name+'.png')); print(name, c.size)
