from django.shortcuts import render
from django.views.generic import TemplateView # new 

# Create your views here.
class HomePageView(TemplateView): # from https://djangoforbeginners.com/pages-app/
    template_name = 'home.html'

class AboutPageView(TemplateView):
    template_name = 'about.html'
