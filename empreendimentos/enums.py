from django.db import models


class SegmentoChoices(models.TextChoices):
    TECNOLOGIA  = 'tecnologia',  'Tecnologia'
    COMERCIO    = 'comercio',    'Comércio'
    INDUSTRIA   = 'industria',   'Indústria'
    SERVICOS    = 'servicos',    'Serviços'
    AGRONEGOCIO = 'agronegocio', 'Agronegócio'


class StatusChoices(models.TextChoices):
    ATIVO   = 'ativo',   'Ativo'
    INATIVO = 'inativo', 'Inativo'
