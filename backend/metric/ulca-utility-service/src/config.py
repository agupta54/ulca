import os

DEBUG = False
API_URL_PREFIX = "/ulca/apis/"
HOST = '0.0.0.0'
PORT = 5001

ENABLE_CORS = False

MAIL_SETTINGS           =   {
                                "MAIL_SERVER"   : 'smtp.gmail.com',
                                "MAIL_PORT"     : 465,
                                "MAIL_USE_TLS"  : False,
                                "MAIL_USE_SSL"  : True,
                                "MAIL_USERNAME" : os.environ.get('ULCA_SUPPORT_EMAIL','xxxx'),
                                "MAIL_PASSWORD" : os.environ.get('ULCA_SUPPORT_EMAIL_PASSWORD','xxx')
                            }


receiver_email_ids = ['jainy.joy@tarento.com']

data_connection_url         =   os.environ.get('ULCA_DS_PUBLISH_MONGO_CLUSTER', 'mongodb://localhost:27017')
data_db_schema              =   os.environ.get('DATA_PARALLEL', 'ulca')
data_parallel               =   os.environ.get('DATA_SCHEMA', 'parallel-dataset')
data_ocr                    =   os.environ.get('DATA_OCR', 'ocr-dataset')
data_mono                   =   os.environ.get('DATA_MONO', 'monolingual-dataset') 
data_asr                    =   os.environ.get('DATA_ASR', 'asr-dataset')
data_asr_unlabeled          =   os.environ.get('DATA_ASR_UNLABELED', 'asr-unlabeled-dataset')  

