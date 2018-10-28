from django.shortcuts import render
from django.views.generic import TemplateView # new 
from django.shortcuts import render_to_response, RequestContext # from https://stackoverflow.com/questions/15491727/include-css-and-javascript-in-my-django-template

# Create your views here.
class HomePageView(TemplateView): # from https://djangoforbeginners.com/pages-app/
    template_name = 'home.html'

class AboutPageView(TemplateView):
    template_name = 'about.html'
