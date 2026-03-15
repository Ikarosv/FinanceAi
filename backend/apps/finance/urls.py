from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.finance.views import AIAnalysisView, CategoryViewSet, TransactionViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
    path('ai-analysis/', AIAnalysisView.as_view(), name='ai-analysis'),
]