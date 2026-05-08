from django.urls import path
from .views import predict_crop,ask_question

urlpatterns = [
    path('predict/', predict_crop, name='predict'),
    path("ask/", ask_question, name='ask'),
]
