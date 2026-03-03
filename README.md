# ScTechAval

## Descrição

O ScTechAval é uma aplicação web para cadastro e gerenciamento de empreendimentos do estado de Santa Catarina. Desenvolvida como uma API REST com interface web integrada, permite realizar operações completas de criação, consulta, edição e exclusão de empreendimentos diretamente pelo navegador.

A interface web está disponível na rota principal da aplicação e consome a API REST em tempo real. Os dados podem ser filtrados por segmento de atuação, status e nome, com paginação automática nos resultados.

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Linguagem | Python 3.9+ |
| Framework web | Django 4.2 LTS |
| API REST | Django REST Framework 3.15 |
| Filtros | django-filter 24.3 |
| Banco de dados | SQLite |
| Frontend | HTML, CSS e JavaScript (vanilla) |

## Estrutura do projeto

```
ScTechAval/
├── manage.py
├── requirements.txt
├── db.sqlite3
├── sctech/                          # configurações do projeto Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── empreendimentos/                 # app principal
    ├── models.py                    # modelos Empreendimento e Municipio
    ├── serializers.py               # serialização para a API
    ├── views.py                     # viewset CRUD
    ├── filters.py                   # filtros por segmento, status e município
    ├── urls.py                      # rotas da API
    ├── admin.py                     # painel administrativo
    ├── migrations/                  # histórico do banco de dados
    ├── management/commands/
    │   └── importar_municipios.py   # busca municípios de SC via API do IBGE
    ├── fixtures/
    │   └── empreendimentos_iniciais.json   # 6 registros de exemplo
    ├── templates/empreendimentos/
    │   └── index.html               # interface web principal
    └── static/empreendimentos/
        ├── style.css
        └── app.js
```

## Execução

**Pré-requisitos:** Python 3.9 ou superior instalado.

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd ScTechAval

# 2. Crie e ative o ambiente virtual
python3 -m venv venv
source venv/bin/activate        # Linux/macOS
# venv\Scripts\activate         # Windows

# 3. Instale as dependências
pip install -r requirements.txt

# 4. Execute as migrações do banco de dados
python manage.py migrate

# 5. Importe os municípios de Santa Catarina (requer internet)
python manage.py importar_municipios

# 6. (Opcional) Carregue os dados de exemplo
python manage.py loaddata empreendimentos_iniciais

# 7. Inicie o servidor
python manage.py runserver
```

Acesse `http://localhost:8000/` no navegador.

### Painel administrativo

Para acessar o Django Admin em `http://localhost:8000/admin/`, crie um superusuário:

```bash
python manage.py createsuperuser
```

## API REST

Base URL: `http://localhost:8000/api/`
DIRECIONAR PARA: `http://localhost:8000/api/empreendimentos/`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/municipios/` | Listar municípios de SC |
| GET | `/api/empreendimentos/` | Listar (com filtros e paginação) |
| POST | `/api/empreendimentos/` | Criar |
| GET | `/api/empreendimentos/{id}/` | Detalhar |
| PUT | `/api/empreendimentos/{id}/` | Atualizar completamente |
| PATCH | `/api/empreendimentos/{id}/` | Atualizar parcialmente |
| DELETE | `/api/empreendimentos/{id}/` | Remover |

**Filtros disponíveis:** `?segmento=tecnologia`, `?status=ativo`, `?municipio=Joinville`, `?search=tech`, `?ordering=-created_at`, `?page=2`

**Segmentos válidos:** `tecnologia`, `comercio`, `industria`, `servicos`, `agronegocio`
