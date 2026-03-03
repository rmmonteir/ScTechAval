from django.db import models
from .enums import SegmentoChoices, StatusChoices
from .messages import (
    MUNICIPIO_VERBOSE, MUNICIPIO_VERBOSE_PLURAL,
    EMPREENDIMENTO_VERBOSE, EMPREENDIMENTO_VERBOSE_PLURAL,
)


class Municipio(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    codigo_ibge = models.IntegerField(unique=True)

    class Meta:
        ordering = ['nome']
        verbose_name = MUNICIPIO_VERBOSE
        verbose_name_plural = MUNICIPIO_VERBOSE_PLURAL

    def __str__(self):
        return self.nome


class Empreendimento(models.Model):
    nome = models.CharField(max_length=200)
    nome_empreendedor = models.CharField(max_length=200)
    municipio = models.CharField(max_length=100)
    segmento = models.CharField(max_length=20, choices=SegmentoChoices.choices)
    email    = models.EmailField(max_length=254)
    telefone = models.CharField(max_length=20)
    status = models.CharField(max_length=10, choices=StatusChoices.choices, default=StatusChoices.ATIVO)
    descricao = models.TextField(blank=True)
    data_fundacao = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = EMPREENDIMENTO_VERBOSE
        verbose_name_plural = EMPREENDIMENTO_VERBOSE_PLURAL

    def __str__(self):
        return f'{self.nome} ({self.municipio})'
