import gzip
import json
import urllib.request
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Empreendimento, Municipio
from .serializers import EmpreendimentoSerializer, MunicipioSerializer
from .filters import EmpreendimentoFilter
from .messages import CMD_ERRO_API, CMD_SUCESSO

IBGE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/42/municipios'


class EmpreendimentoViewSet(viewsets.ModelViewSet):
    queryset = Empreendimento.objects.all()
    serializer_class = EmpreendimentoSerializer
    filterset_class = EmpreendimentoFilter
    search_fields = ['nome', 'nome_empreendedor', 'municipio']
    ordering_fields = ['nome', 'municipio', 'segmento', 'status', 'created_at']


class MunicipioListView(generics.ListAPIView):
    queryset = Municipio.objects.all()
    serializer_class = MunicipioSerializer
    pagination_class = None


class ImportarMunicipiosView(APIView):
    def post(self, request):
        try:
            req = urllib.request.Request(IBGE_URL, headers={'Accept-Encoding': 'gzip'})
            with urllib.request.urlopen(req, timeout=15) as response:
                raw = response.read()
                if response.info().get('Content-Encoding') == 'gzip':
                    raw = gzip.decompress(raw)
                data = json.loads(raw.decode('utf-8'))
        except Exception as e:
            return Response(
                {'erro': CMD_ERRO_API.format(erro=e)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        criados = 0
        for item in data:
            _, created = Municipio.objects.get_or_create(
                codigo_ibge=item['id'],
                defaults={'nome': item['nome']},
            )
            if created:
                criados += 1

        total = Municipio.objects.count()
        return Response({'mensagem': CMD_SUCESSO.format(criados=criados, total=total)})
