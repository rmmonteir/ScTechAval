import gzip
import json
import urllib.request
from django.core.management.base import BaseCommand
from empreendimentos.models import Municipio
from empreendimentos.messages import CMD_HELP, CMD_BUSCANDO, CMD_ERRO_API, CMD_SUCESSO

IBGE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/42/municipios'


class Command(BaseCommand):
    help = CMD_HELP

    def handle(self, *args, **kwargs):
        self.stdout.write(CMD_BUSCANDO)

        try:
            req = urllib.request.Request(IBGE_URL, headers={'Accept-Encoding': 'gzip'})
            with urllib.request.urlopen(req, timeout=15) as response:
                raw = response.read()
                if response.info().get('Content-Encoding') == 'gzip':
                    raw = gzip.decompress(raw)
                data = json.loads(raw.decode('utf-8'))
        except Exception as e:
            self.stderr.write(CMD_ERRO_API.format(erro=e))
            return

        criados = 0
        for item in data:
            _, created = Municipio.objects.get_or_create(
                codigo_ibge=item['id'],
                defaults={'nome': item['nome']},
            )
            if created:
                criados += 1

        total = Municipio.objects.count()
        self.stdout.write(self.style.SUCCESS(
            CMD_SUCESSO.format(criados=criados, total=total)
        ))
