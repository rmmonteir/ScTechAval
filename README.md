# ScTechAval

## Descrição

O ScTechAval é uma aplicação web para cadastro e gerenciamento de empreendimentos do estado de Santa Catarina. Desenvolvida como uma API REST com interface web integrada, permite realizar operações completas de criação, consulta, edição e exclusão de empreendimentos diretamente pelo navegador.

A interface web está disponível na rota principal da aplicação e consome a API REST em tempo real. Os dados podem ser filtrados por segmento de atuação, status e nome, com paginação automática nos resultados. Municípios de SC são importados diretamente da API do IBGE.

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
├── sctec/                               # configurações do projeto Django
│   ├── settings.py
│   ├── urls.py                          # rotas raiz: /, /municipios/, /admin/, /api/
│   └── wsgi.py
└── empreendimentos/                     # app principal
    ├── enums.py                         # SegmentoChoices, StatusChoices
    ├── messages.py                      # todas as strings de validação e labels
    ├── models.py                        # modelos Municipio e Empreendimento
    ├── serializers.py                   # validação de municipio, telefone e data_fundacao
    ├── views.py                         # EmpreendimentoViewSet, MunicipioListView, ImportarMunicipiosView
    ├── filters.py                       # filtros por segmento, status, município e nome
    ├── urls.py                          # rotas da API
    ├── admin.py                         # painel administrativo
    ├── migrations/
    │   ├── 0001_initial.py
    │   ├── 0002_municipio.py
    │   └── 0003_empreendimento_email_telefone.py
    ├── management/commands/
    │   └── importar_municipios.py       # importa municípios de SC via API do IBGE
    ├── fixtures/
    │   └── empreendimentos_iniciais.json  # 6 registros de exemplo
    ├── templates/empreendimentos/
    │   └── index.html                   # interface web principal (SPA)
    └── static/empreendimentos/
        ├── style.css                    # estilos da interface
        └── app.js                       # lógica CRUD, modal de municípios e máscaras
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

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/municipios/` | Listar todos os municípios de SC |
| POST | `/api/importar-municipios/` | Importar/atualizar municípios via API do IBGE |
| GET | `/api/empreendimentos/` | Listar empreendimentos (filtros e paginação) |
| POST | `/api/empreendimentos/` | Criar empreendimento |
| GET | `/api/empreendimentos/{id}/` | Detalhar empreendimento |
| PUT | `/api/empreendimentos/{id}/` | Atualizar completamente |
| PATCH | `/api/empreendimentos/{id}/` | Atualizar parcialmente |
| DELETE | `/api/empreendimentos/{id}/` | Remover empreendimento |

**Filtros disponíveis:** `?segmento=tecnologia`, `?status=ativo`, `?municipio=Joinville`, `?search=tech`, `?ordering=-created_at`, `?page=2`

**Segmentos válidos:** `tecnologia`, `comercio`, `industria`, `servicos`, `agronegocio`

**Status válidos:** `ativo`, `inativo`

## Campos do Empreendimento

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `nome` | texto | Nome do empreendimento |
| `nome_empreendedor` | texto | Nome do responsável |
| `municipio` | texto | Município de SC (validado contra tabela IBGE) |
| `segmento` | escolha | Segmento de atuação |
| `email` | e-mail | E-mail de contato (formato validado) |
| `telefone` | texto | Telefone com máscara `(XX) XXXX-XXXX` ou `(XX) XXXXX-XXXX` |
| `status` | escolha | `ativo` ou `inativo` |
| `descricao` | texto longo | Descrição opcional |
| `data_fundacao` | data | Data de fundação (não pode ser futura) |
