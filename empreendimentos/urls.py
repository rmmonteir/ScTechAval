from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmpreendimentoViewSet, MunicipioListView, ImportarMunicipiosView

router = DefaultRouter()
router.register(r'empreendimentos', EmpreendimentoViewSet, basename='empreendimento')

urlpatterns = [
    path('', include(router.urls)),
    path('municipios/', MunicipioListView.as_view(), name='municipios-list'),
    path('importar-municipios/', ImportarMunicipiosView.as_view(), name='importar-municipios'),
]
