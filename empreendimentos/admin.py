from django.contrib import admin
from .models import Empreendimento
from .messages import (
    ADMIN_FIELDSET_IDENTIFICACAO,
    ADMIN_FIELDSET_LOCALIZACAO,
    ADMIN_FIELDSET_CLASSIFICACAO,
    ADMIN_FIELDSET_DETALHES,
    ADMIN_FIELDSET_METADADOS,
)


@admin.register(Empreendimento)
class EmpreendimentoAdmin(admin.ModelAdmin):
    list_display = ['nome', 'nome_empreendedor', 'municipio', 'segmento', 'status', 'created_at']
    list_filter = ['segmento', 'status', 'municipio']
    search_fields = ['nome', 'nome_empreendedor', 'municipio']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = [
        (ADMIN_FIELDSET_IDENTIFICACAO, {'fields': ['nome', 'nome_empreendedor', 'email', 'telefone']}),
        (ADMIN_FIELDSET_LOCALIZACAO,   {'fields': ['municipio']}),
        (ADMIN_FIELDSET_CLASSIFICACAO, {'fields': ['segmento', 'status']}),
        (ADMIN_FIELDSET_DETALHES,      {'fields': ['descricao', 'data_fundacao']}),
        (ADMIN_FIELDSET_METADADOS,     {'fields': ['created_at', 'updated_at'], 'classes': ['collapse']}),
    ]
