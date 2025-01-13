from tortoise import fields
from tortoise.models import Model

class User(Model):
    id=fields.IntField(pk=True)
    username=fields.CharField(max_length=32,null=True)
    balance=fields.IntField(default=0)