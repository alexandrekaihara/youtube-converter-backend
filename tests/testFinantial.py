import requests, zipfile, io

# IPCA e INPC https://www.ibge.gov.br/estatisticas/economicas/precos-e-custos/9256-indice-nacional-de-precos-ao-consumidor-amplo.html?=&t=downloads
# Define the request URL
url = "https://www.google-analytics.com/j/collect"

# Define query parameters (parsed from the URL)
params = {
    "v": "1",
    "_v": "j101",
    "a": "1870915315",
    "t": "event",
    "ni": "0",
    "_s": "1",
    "dl": "https://www.ibge.gov.br/estatisticas/economicas/precos-e-custos/9256-indice-nacional-de-precos-ao-consumidor-amplo.html??&t=downloads",
    "dr": "https://www.google.com/",
    "ul": "en-us",
    "de": "UTF-8",
    "dt": "Índice Nacional de Preços ao Consumidor Amplo | IBGE",
    "sd": "24-bit",
    "sr": "2560x1600",
    "vp": "1653x1486",
    "je": "0",
    "ec": "Inbound Links",
    "ea": "https://www.ibge.gov.br/#",
    "el": "/estatisticas/economicas/precos-e-custos/9256-indice-nacional-de-precos-ao-consumidor-amplo.html",
    "_u": "SACAAUABAAAAACAEK~",
    "jid": "988614346",
    "gjid": "4474118",
    "cid": "1131337518.1733190502",
    "tid": "UA-285486-1",
    "_gid": "660791405.1733190502",
    "_r": "1",
    "gtm": "45He4bk0n815ND2WBQv810564332za200",
    "gcd": "13l3l3l3l1l1",
    "dma": "0",
    "tag_exp": "101925629~102067555~102067808~102077855~102081485",
    "cd1": "1131337518.1733190502",
    "z": "1328925455"
}

# Headers, if required
headers = {
    "Referer": "https://www.ibge.gov.br/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
}

# Perform the POST request
response = requests.post(url, params=params, headers=headers)

# Perform the GET request
z = zipfile.ZipFile(io.BytesIO(response.content))
z.extractall("/path/to/destination_directory")

response = requests.get(url, params=params, headers=headers)

# Check if the response is successful
response = requests.get("https://www.google-analytics.com/collect?v=1&_v=j101&a=1870915315&t=event&ni=0&_s=1&dl=https%3A%2F%2Fwww.ibge.gov.br%2Festatisticas%2Feconomicas%2Fprecos-e-custos%2F9256-indice-nacional-de-precos-ao-consumidor-amplo.html%3F%3D%26t%3Ddownloads&dr=https%3A%2F%2Fwww.google.com%2F&ul=en-us&de=UTF-8&dt=%C3%8Dndice%20Nacional%20de%20Pre%C3%A7os%20ao%20Consumidor%20Amplo%20%7C%20IBGE&sd=24-bit&sr=2560x1600&vp=1330x1486&je=0&ec=Inbound%20Links&ea=https%3A%2F%2Fwww.ibge.gov.br%2F%23&el=%2Festatisticas%2Feconomicas%2Fprecos-e-custos%2F9256-indice-nacional-de-precos-ao-consumidor-amplo.html&_u=SACAAUABAAAAACAEK~&jid=&gjid=&cid=1131337518.1733190502&tid=UA-285486-1&_gid=660791405.1733190502&gtm=45He4bk0n815ND2WBQv810564332za200&gcd=13l3l3l3l1l1&dma=0&tag_exp=101925629~102067555~102067808~102077855~102081485&cd1=1131337518.1733190502&z=1938806466")
if response.status_code == 200:
    # Save the response content to a GIF file
    with open("output.zip", "wb") as file:
        file.write(response.content)



#get SELIC data
# https://www.bcb.gov.br/controleinflacao/historicotaxasjuros
import requests
from matplotlib import pyplot as plt

url = 'https://www.bcb.gov.br/api/servico/sitebcb/historicotaxasjuros'

# Define headers
headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'  # This header tells the server you're expecting JSON responses
}

# Send GET request with headers
response = requests.get(url, headers=headers)

# Check the response
print(response.status_code)
print(response.json())  # Assuming the response is in JSON format
selic = [reuniao['MetaSelic'] for reuniao in response.json()['conteudo']].reverse()
