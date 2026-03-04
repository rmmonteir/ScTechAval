from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

urlpatterns = [
    path('', TemplateView.as_view(template_name='empreendimentos/index.html')),
    path('municipios/', TemplateView.as_view(template_name='empreendimentos/municipios.html')),
    path('admin/', admin.site.urls),
    path('api/', include('empreendimentos.urls')),
]
