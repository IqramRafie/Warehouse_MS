from inventory.models import Product
from audit.utils import log_action
from django.core.mail import send_mail
from django.conf import settings

def check_low_stock(product, user=None):
    if product.quantity <= product.low_stock_threshold:
        log_action(
            user,
            'LOW_STOCK_ALERT',
            'Product',
            product.id,
            {
                'quantity': product.quantity,
                'threshold': product.low_stock_threshold,
            }
        )
        # Send email alert
        subject = f'Low Stock Alert: {product.name}'
        message = f'Product {product.name} (SKU: {product.sku}) has low stock. Current quantity: {product.quantity}, Threshold: {product.low_stock_threshold}.'
        from_email = settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@warehouse.com'
        recipient_list = ['admin@warehouse.com']  # Configure recipients

        try:
            send_mail(subject, message, from_email, recipient_list)
        except Exception as e:
            print(f"Email sending failed: {e}")

        return True
    return False


