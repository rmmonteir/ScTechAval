import django_filters
from .models import Empreendimento


class EmpreendimentoFilter(django_filters.FilterSet):
    municipio = django_filters.CharFilter(lookup_expr='icontains')
    nome = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Empreendimento
        fields = ['segmento', 'status', 'municipio', 'nome']
