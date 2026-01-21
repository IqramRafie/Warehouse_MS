from django.http import JsonResponse

import inventory


def health(request):
    return JsonResponse({'status': 'OK'})
"""
URL configuration for config1 project.

The `urlpatterns` list routes URLs to view. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function view
    1. Add an import:  from my_app import view
    2. Add a URL to urlpatterns:  path('', view.home, name='home')
Class-based view
    1. Add an import:  from other_app.view import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

urlpatterns = [
    path('admin/', admin.site.urls),
]

from django.urls import include, path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns += [
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/', include('rest_framework.urls', namespace='rest_framework')),
]

from rest_framework.routers import DefaultRouter
from inventory.views import ProductViewSet, SupplierViewSet, LowStockAlertView
from inbound.views import InboundViewSet, BulkInboundUploadView
from outbound.views import OutboundViewSet, BulkOutboundUploadView
from users.views import UserViewSet

router = DefaultRouter()
router.register('products', ProductViewSet)
router.register('suppliers', SupplierViewSet)
router.register('inbound', InboundViewSet)
router.register('outbound', OutboundViewSet)
router.register('users', UserViewSet)

# Routing for product, inbound and outbound
urlpatterns += [
    path('api/', include(router.urls)),
    path('', health),
]

from inventory.views import BulkProductUploadView
# Bulk Uploads
urlpatterns += [
    path('api/products/bulk-upload', BulkProductUploadView.as_view()),
    path('api/inbound/bulk-upload', BulkInboundUploadView.as_view()),
    path('api/outbound/bulk-upload', BulkOutboundUploadView.as_view()),
    path('api/alerts/low-stock', LowStockAlertView.as_view()),
]


# Dashboard
urlpatterns += [
    path('api/', include('inventory.urls')),
    path('api/', include('audit.urls'))
]

