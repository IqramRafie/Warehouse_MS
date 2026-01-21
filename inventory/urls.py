from django.urls import path
from inventory.view.dashboard import DashboardSummaryView

urlpatterns = [
    path('dashboard/summary', DashboardSummaryView.as_view()),
]