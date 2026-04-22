from pathlib import Path
import os


def _split_csv_env(name: str):
    value = os.getenv(name, "")
    return [item.strip() for item in value.split(",") if item.strip()]


def _is_truthy_env(name: str, default: str = "false"):
    value = os.getenv(name, default)
    return str(value).strip().lower() in {"1", "true", "yes", "on"}

BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = 'django-insecure-mzo*%r-17og72tkrnr5=^azcmn7p%mwecuag2h*!1c-gqz-(#1'

DEBUG = True

ALLOWED_HOSTS = ['*']




INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'rest_framework',
    'corsheaders',
    'authentication',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

default_cors_origins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
    'https://agro-ai.vercel.app',
    'https://agroai.vercel.app',
]

CORS_ALLOWED_ORIGINS = list(dict.fromkeys(default_cors_origins + _split_csv_env('CORS_ALLOWED_ORIGINS')))
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https://[a-z0-9-]+\.vercel\.app$',
]
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = list(
    dict.fromkeys(CORS_ALLOWED_ORIGINS + _split_csv_env('CSRF_TRUSTED_ORIGINS'))
)

IS_PRODUCTION = _is_truthy_env('IS_PRODUCTION') or bool(os.getenv('RENDER_EXTERNAL_URL'))

SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_SAMESITE = 'None' if IS_PRODUCTION else 'Lax'
SESSION_COOKIE_SECURE = IS_PRODUCTION
CSRF_COOKIE_SAMESITE = 'None' if IS_PRODUCTION else 'Lax'
CSRF_COOKIE_SECURE = IS_PRODUCTION
ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

MEDIA_ROOT = os.path.join(BASE_DIR, 'uploads')
MEDIA_URL = '/uploads/'

WSGI_APPLICATION = 'backend.wsgi.application'



DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}




AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]




LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True




STATIC_URL = 'static/'
