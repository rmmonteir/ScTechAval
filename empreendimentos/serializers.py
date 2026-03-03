from django.utils import timezone
from rest_framework import serializers
from .models import Empreendimento, Municipio
from .messages import MUNICIPIO_NAO_ENCONTRADO, TELEFONE_INVALIDO, DATA_FUNDACAO_INVALIDA


class MunicipioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Municipio
        fields = ['id', 'nome', 'codigo_ibge']


class EmpreendimentoSerializer(serializers.ModelSerializer):
    segmento_display = serializers.CharField(source='get_segmento_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Empreendimento
        fields = [
            'id',
            'nome',
            'nome_empreendedor',
            'municipio',
            'segmento',
            'segmento_display',
            'email',
            'telefone',
            'status',
            'status_display',
            'descricao',
            'data_fundacao',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_municipio(self, value):
        try:
            municipio = Municipio.objects.get(nome__iexact=value.strip())
            return municipio.nome
        except Municipio.DoesNotExist:
            raise serializers.ValidationError(MUNICIPIO_NAO_ENCONTRADO)

    def validate_telefone(self, value):
        digits = ''.join(c for c in value if c.isdigit())
        if len(digits) not in (10, 11):
            raise serializers.ValidationError(TELEFONE_INVALIDO)
        return value

    def validate_data_fundacao(self, value):
        if value and value > timezone.localdate():
            raise serializers.ValidationError(DATA_FUNDACAO_INVALIDA)
        return value
