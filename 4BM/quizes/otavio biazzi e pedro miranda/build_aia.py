"""
build_aia.py - gera o QuizMedia.aia (arquivo para importar no MIT App Inventor)

Quando rodar:
  Depois de mexer em qualquer arquivo da pasta codigo_app/, rode:
      python build_aia.py

O que ele faz:
  1. Abre o QuizMedia.aia atual e pega a tela (Screen1) e os blocos
  2. Ajusta nome, cores e endereço do servidor
  3. Cria um .aia novo colocando dentro os arquivos de codigo_app/
"""
import json, re, shutil, zipfile, pathlib

pasta = pathlib.Path(__file__).parent                 # pasta onde está este arquivo
antigo = zipfile.ZipFile(pasta / 'QuizMedia.aia')     # o .aia atual (um .aia é um zip)

# caminho da tela dentro do .aia
nome_tela = 'src/appinventor/ai_matinventor/QuizMedia/Screen1.scm'

# ---------- 1) lê a tela (está em JSON no meio do arquivo) ----------
texto = antigo.read(nome_tela).decode('utf-8', 'replace')
dados = json.loads(texto[texto.index('{'):texto.rindex('}') + 1])
props = dados['Properties']

# ---------- 2) ajusta nome e cores do app ----------
props.update(
    AppName='Médias',
    Title='Médias',
    BackgroundColor='&HFFFFF3B0',   # amarelo
    PrimaryColor='&HFF1F9D2A',      # verde
    PrimaryColorDark='&HFF17781F',  # verde escuro
    AccentColor='&HFF1F9D2A',
)

# endereço da página que o app abre (IP do computador com o XAMPP)
for componente in props['$Components']:
    if componente['$Type'] == 'WebViewer':
        componente['HomeUrl'] = 'http://172.20.6.46/QuizMedia/index.html'

props.pop('Icon', None)   # tira o ícone personalizado

scm = '#|\n$JSON\n' + json.dumps(dados, ensure_ascii=True, separators=(',', ':')) + '\n|#\n'

# ---------- 3) ajusta o project.properties ----------
projeto = antigo.read('youngandroidproject/project.properties').decode('utf-8')
projeto = re.sub(r'(?m)^icon=.*\n', '', projeto)
projeto = re.sub(r'aname=.*', 'aname=Medias', projeto)
projeto = re.sub(r'color\.primary=.*', 'color.primary=&HFF1F9D2A', projeto)
projeto = re.sub(r'color\.primary\.dark=.*', 'color.primary.dark=&HFF17781F', projeto)
projeto = re.sub(r'color\.accent=.*', 'color.accent=&HFF1F9D2A', projeto)

# ---------- 4) monta o .aia novo ----------
saida = pasta / 'QuizMedia.aia.new'
with zipfile.ZipFile(saida, 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr(nome_tela, scm)                                                  # tela
    z.writestr(nome_tela.replace('.scm', '.bky'),
               antigo.read(nome_tela.replace('.scm', '.bky')))                  # blocos
    z.writestr('youngandroidproject/project.properties', projeto)

    # arquivos principais do app
    for nome in ['index.html', 'app.js', 'LuckiestGuy.ttf']:
        z.write(pasta / 'codigo_app' / nome, 'assets/' + nome)

    # tudo da pasta css/ e da pasta gifs/
    extras = sorted((pasta / 'codigo_app').glob('css/*')) + sorted((pasta / 'codigo_app').glob('gifs/*'))
    for arquivo in extras:
        z.write(arquivo, 'assets/' + arquivo.relative_to(pasta / 'codigo_app').as_posix())

antigo.close()
shutil.move(saida, pasta / 'QuizMedia.aia')   # troca o antigo pelo novo
print('ok')
