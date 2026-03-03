from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('empreendimentos', '0002_municipio'),
    ]

    operations = [
        migrations.AddField(
            model_name='empreendimento',
            name='email',
            field=models.EmailField(max_length=254, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='empreendimento',
            name='telefone',
            field=models.CharField(max_length=20, default=''),
            preserve_default=False,
        ),
        migrations.RemoveField(
            model_name='empreendimento',
            name='contato',
        ),
    ]
