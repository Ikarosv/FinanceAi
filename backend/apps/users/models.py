from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """Model definition for Users."""
    email = models.EmailField(unique=True)
    birthdate = models.DateField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # username é obrigatório para criar superuser

    class Meta:
        """Meta definition for Users."""
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        """Unicode representation of Users."""
        return self.email
