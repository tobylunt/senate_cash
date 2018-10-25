# pages/urls.py 
from django.urls import path

from .views import HomePageView, AboutPageView
from django.contrib.staticfiles.urls import staticfiles_urlpatterns # new - http://www.effectivedjango.com/tutorial/static.html

urlpatterns = [
    path('about/', AboutPageView.as_view(), name='about'), 
    path('', HomePageView.as_view(), name='home'),
]
