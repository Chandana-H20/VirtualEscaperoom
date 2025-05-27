# /cipher_escape_project/config.py
import os
from dotenv import load_dotenv

load_dotenv()
basedir = os.path.abspath(os.path.dirname(__file__))
instance_path = os.path.join(basedir, 'instance')

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-very-insecure-default-secret-key-please-change'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(instance_path, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    @staticmethod
    def ensure_instance_folder():
        if not os.path.exists(instance_path):
            try:
                os.makedirs(instance_path)
                print(f"Created instance folder at: {instance_path}")
            except OSError as e:
                if not os.path.exists(instance_path):
                     print(f"Error creating instance folder: {e}")

Config.ensure_instance_folder()