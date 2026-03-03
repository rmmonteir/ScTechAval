from rest_framework import viewsets, generics
from .models import Empreendimento, Municipio
from .serializers import EmpreendimentoSerializer, MunicipioSerializer
from .filters import EmpreendimentoFilter


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
